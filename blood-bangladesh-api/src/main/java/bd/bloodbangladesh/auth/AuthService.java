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

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(RegisterRequest req) {
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
        return toResponse(u);
    }

    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmail(req.email().trim().toLowerCase())
                .filter(User::isEnabled)
                .filter(x -> x.getPasswordHash() != null && encoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return toResponse(u);
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
