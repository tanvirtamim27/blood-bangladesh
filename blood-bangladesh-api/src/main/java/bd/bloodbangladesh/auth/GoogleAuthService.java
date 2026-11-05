package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.AuthResponse;
import bd.bloodbangladesh.security.JwtService;
import bd.bloodbangladesh.user.User;
import bd.bloodbangladesh.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleAuthService {

    private final UserRepository users;
    private final JdbcClient jdbc;
    private final JwtService jwt;
    private final String clientId;
    private final NimbusJwtDecoder decoder;

    public GoogleAuthService(UserRepository users, JdbcClient jdbc, JwtService jwt,
                             @Value("${app.google.client-id:}") String clientId) {
        this.users = users;
        this.jdbc = jdbc;
        this.jwt = jwt;
        this.clientId = clientId;

        NimbusJwtDecoder d = NimbusJwtDecoder
                .withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();
        OAuth2TokenValidator<Jwt> issuerAndAudience = t -> {
            String iss = t.getClaimAsString("iss");
            boolean okIssuer = "https://accounts.google.com".equals(iss) || "accounts.google.com".equals(iss);
            boolean okAudience = t.getAudience() != null && t.getAudience().contains(clientId);
            return okIssuer && okAudience
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Bad issuer or audience", null));
        };
        d.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefault(), issuerAndAudience));
        this.decoder = d;
    }

    public AuthResponse login(String idToken) {
        if (clientId == null || clientId.isBlank() || clientId.startsWith("PASTE")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google login is not configured");
        }
        Jwt token;
        try {
            token = decoder.decode(idToken);
        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }
        Object verified = token.getClaim("email_verified");
        if (!(Boolean.TRUE.equals(verified) || "true".equals(String.valueOf(verified)))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }
        String email = token.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No email in Google token");
        }
        email = email.trim().toLowerCase();

        User u = users.findByEmail(email).orElse(null);
        if (u == null) {
            String name = token.getClaimAsString("name");
            u = new User();
            u.setFullName(name == null || name.isBlank() ? email.substring(0, email.indexOf('@')) : name);
            u.setEmail(email);
            u.setProvider("GOOGLE");
            u = users.save(u);
        } else if (!u.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is disabled");
        }

        jdbc.sql("""
                UPDATE users
                SET email_verified = TRUE,
                    provider_id = COALESCE(provider_id, :sub),
                    profile_picture_url = COALESCE(profile_picture_url, :pic),
                    updated_at = now()
                WHERE id = :id
                """)
                .param("sub", token.getSubject())
                .param("pic", token.getClaimAsString("picture"))
                .param("id", u.getId())
                .update();

        return new AuthResponse(jwt.createAccessToken(u), "Bearer", jwt.expiresInSeconds(),
                u.getFullName(), u.getRole());
    }
}