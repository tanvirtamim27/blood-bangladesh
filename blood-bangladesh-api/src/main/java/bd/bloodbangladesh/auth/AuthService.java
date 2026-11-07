package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.*;
import bd.bloodbangladesh.security.JwtService;
import bd.bloodbangladesh.user.User;
import bd.bloodbangladesh.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginRateLimiter limiter;
    private final RefreshTokenService refreshTokens;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt,
                       LoginRateLimiter limiter, RefreshTokenService refreshTokens) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.limiter = limiter;
        this.refreshTokens = refreshTokens;
    }

    public Session register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        String phone = normalizePhone(req.phone());
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (phone != null && users.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already registered");
        }
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPhone(phone);
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);
        return session(u);
    }

    public Session login(LoginRequest req, String ip) {
        String email = req.email().trim().toLowerCase();
        String emailKey = "email:" + email;
        String ipKey = "ip:" + ip;

        if (limiter.isBlocked(emailKey) || limiter.isBlocked(ipKey)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts, try later");
        }
        User u = users.findByEmail(email)
                .filter(User::isEnabled)
                .filter(x -> x.getPasswordHash() != null && encoder.matches(req.password(), x.getPasswordHash()))
                .orElse(null);
        if (u == null) {
            limiter.recordFailure(emailKey);
            limiter.recordFailure(ipKey);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        limiter.reset(emailKey);
        return session(u);
    }

    public Session refresh(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token");
        }
        RefreshTokenService.Rotated r = refreshTokens.rotate(rawToken);
        User u = users.findById(r.userId()).filter(User::isEnabled).orElse(null);
        if (u == null) {
            refreshTokens.revokeAll(r.userId());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account disabled");
        }
        return new Session(toResponse(u), r.newToken());
    }

    public void logout(String rawToken) {
        refreshTokens.revoke(rawToken);
    }

    private Session session(User u) {
        return new Session(toResponse(u), refreshTokens.issue(u.getId()));
    }

    private AuthResponse toResponse(User u) {
        return new AuthResponse(jwt.createAccessToken(u), "Bearer", jwt.expiresInSeconds(),
                u.getFullName(), u.getRole());
    }

    private String normalizePhone(String p) {
        if (p == null || p.isBlank()) return null;
        return p.startsWith("01") ? "+88" + p : p;
    }
}