package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.mail.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EmailVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JdbcClient jdbc;
    private final EmailService email;
    private final LoginRateLimiter limiter;
    private final String baseUrl;

    private record UserRow(String id, String name, boolean verified) {}
    private record TokenRow(String id, String userId, boolean used, boolean valid) {}

    public EmailVerificationService(JdbcClient jdbc, EmailService email, LoginRateLimiter limiter,
                                    @Value("${app.base-url}") String baseUrl) {
        this.jdbc = jdbc;
        this.email = email;
        this.limiter = limiter;
        this.baseUrl = baseUrl;
    }

    public void sendFor(String userId, String name, String to) {
        jdbc.sql("UPDATE email_verification_tokens SET used = TRUE WHERE user_id = CAST(:u AS uuid) AND used = FALSE")
                .param("u", userId).update();

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        jdbc.sql("""
                INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
                VALUES (CAST(:u AS uuid), :h, now() + interval '30 minutes')
                """)
                .param("u", userId)
                .param("h", RefreshTokenService.sha256(raw))
                .update();

        String link = baseUrl + "/verify-email?token=" + raw;
        email.send(to, "ইমেইল ভেরিফাই করুন | Verify your email - Blood Bangladesh",
                "আসসালামু আলাইকুম " + name + ",\n\n"
                        + "ব্লাড বাংলাদেশে আপনাকে স্বাগতম। অ্যাকাউন্ট চালু করতে নিচের লিংকে ক্লিক করুন (৩০ মিনিট বৈধ):\n"
                        + link + "\n\n"
                        + "আপনি অ্যাকাউন্ট না খুলে থাকলে এই ইমেইল উপেক্ষা করুন।\n\n"
                        + "-----\n"
                        + "Hello " + name + ",\n\n"
                        + "Welcome to Blood Bangladesh. Click the link below to activate your account (valid for 30 minutes):\n"
                        + link + "\n\n"
                        + "If you did not create an account, you can ignore this email.\n\n"
                        + "Blood Bangladesh");
    }

    // ইমেইল আছে কিনা বাইরে বোঝানো যাবে না, তাই সবসময় সফল দেখায়
    public void resend(String rawEmail, String ip) {
        String mail = rawEmail.trim().toLowerCase();
        String emailKey = "verify:" + mail;
        String ipKey = "verifyip:" + ip;
        if (limiter.isBlocked(emailKey) || limiter.isBlocked(ipKey)) return;
        limiter.recordFailure(emailKey);
        limiter.recordFailure(ipKey);

        UserRow u = jdbc.sql("SELECT id::text AS id, full_name, email_verified FROM users WHERE email = :e AND enabled = TRUE")
                .param("e", mail)
                .query((rs, i) -> new UserRow(rs.getString("id"), rs.getString("full_name"), rs.getBoolean("email_verified")))
                .optional().orElse(null);
        if (u == null || u.verified()) return;
        sendFor(u.id(), u.name(), mail);
    }

    public void verify(String rawToken) {
        TokenRow row = jdbc.sql("""
                SELECT id::text AS id, user_id::text AS user_id, used, (expires_at > now()) AS valid
                FROM email_verification_tokens WHERE token_hash = :h
                """)
                .param("h", RefreshTokenService.sha256(rawToken))
                .query((rs, i) -> new TokenRow(rs.getString("id"), rs.getString("user_id"),
                        rs.getBoolean("used"), rs.getBoolean("valid")))
                .optional().orElse(null);
        if (row == null || row.used() || !row.valid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired link");
        }
        int n = jdbc.sql("UPDATE email_verification_tokens SET used = TRUE WHERE id = CAST(:id AS uuid) AND used = FALSE")
                .param("id", row.id()).update();
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired link");
        }
        jdbc.sql("UPDATE users SET email_verified = TRUE, updated_at = now() WHERE id = CAST(:id AS uuid)")
                .param("id", row.userId()).update();
    }
}