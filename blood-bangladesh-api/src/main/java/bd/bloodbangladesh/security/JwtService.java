package bd.bloodbangladesh.security;

import bd.bloodbangladesh.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final long minutes;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.access-token-minutes}") long minutes) {
        this.encoder = encoder;
        this.minutes = minutes;
    }

    public long expiresInSeconds() {
        return minutes * 60;
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("blood-bangladesh")
                .issuedAt(now)
                .expiresAt(now.plus(minutes, ChronoUnit.MINUTES))
                .subject(user.getId().toString())
                .claim("role", user.getRole())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
