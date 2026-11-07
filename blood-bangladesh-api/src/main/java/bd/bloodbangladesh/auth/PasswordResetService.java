package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.mail.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JdbcClient jdbc;
    private final PasswordEncoder encoder;
    private final EmailService email;
    private final LoginRateLimiter limiter;
    private final RefreshTokenService refreshTokens;
    private final String baseUrl;

    private record UserRow(String id, String name) {}
    private record TokenRow(String id, String userId, boolean used, boolean valid) {}

    public PasswordResetService(JdbcClient jdbc, PasswordEncoder encoder, EmailService email,
                                LoginRateLimiter limiter, RefreshTokenService refreshTokens,
                                @Value("${app.base-url}") String baseUrl) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.email = email;
        this.limiter = limiter;
        this.refreshTokens = refreshTokens;
        this.baseUrl = baseUrl;
    }

    // ইমেইল আছে কিনা বাইরে বোঝানো যাবে না, তাই সবসময় সফল দেখায়
    public void request(String rawEmail, String ip) {
        String mail = rawEmail.trim().toLowerCase();
        String emailKey = "reset:" + mail;
        String ipKey = "resetip:" + ip;
        if (limiter.isBlocked(emailKey) || limiter.isBlocked(ipKey)) return;
        limiter.recordFailure(emailKey);
        limiter.recordFailure(ipKey);

        UserRow user = jdbc.sql("SELECT id::text AS id, full_name FROM users WHERE email = :e AND enabled = TRUE")
                .param("e", mail)
                .query((rs, i) -> new UserRow(rs.getString("id"), rs.getString("full_name")))
                .optional().orElse(null);
        if (user == null) return;

        jdbc.sql("UPDATE password_reset_tokens SET used = TRUE WHERE user_id = CAST(:u AS uuid) AND used = FALSE")
                .param("u", user.id()).update();

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        jdbc.sql("""
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                VALUES (CAST(:u AS uuid), :h, now() + interval '30 minutes')
                """)
                .param("u", user.id())
                .param("h", RefreshTokenService.sha256(raw))
                .update();

        String link = baseUrl + "/reset-password?token=" + raw;
        email.send(mail, "পাসওয়ার্ড রিসেট | Reset your password - Blood Bangladesh",
                "আসসালামু আলাইকুম " + user.name() + ",\n\n"
                        + "পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন (৩০ মিনিট বৈধ):\n" + link + "\n\n"
                        + "আপনি অনুরোধ না করে থাকলে এই ইমেইল উপেক্ষা করুন।\n\n"
                        + "-----\n"
                        + "Hello " + user.name() + ",\n\n"
                        + "Click the link below to reset your password (valid for 30 minutes):\n" + link + "\n\n"
                        + "If you did not request this, you can ignore this email.\n\n"
                        + "Blood Bangladesh");
    }

    public void reset(String rawToken, String newPassword) {
        TokenRow row = jdbc.sql("""
                SELECT id::text AS id, user_id::text AS user_id, used, (expires_at > now()) AS valid
                FROM password_reset_tokens WHERE token_hash = :h
                """)
                .param("h", RefreshTokenService.sha256(rawToken))
                .query((rs, i) -> new TokenRow(rs.getString("id"), rs.getString("user_id"),
                        rs.getBoolean("used"), rs.getBoolean("valid")))
                .optional().orElse(null);
        if (row == null || row.used() || !row.valid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired link");
        }
        int n = jdbc.sql("UPDATE password_reset_tokens SET used = TRUE WHERE id = CAST(:id AS uuid) AND used = FALSE")
                .param("id", row.id()).update();
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired link");
        }
        jdbc.sql("UPDATE users SET password_hash = :p, updated_at = now() WHERE id = CAST(:id AS uuid)")
                .param("p", encoder.encode(newPassword))
                .param("id", row.userId()).update();

        // পাসওয়ার্ড বদলালে সব ডিভাইসের লগইন বাতিল
        refreshTokens.revokeAll(UUID.fromString(row.userId()));
    }
}