package bd.bloodbangladesh.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final JdbcClient jdbc;
    private final int days;

    public record Rotated(UUID userId, String newToken) {}

    private record Row(String id, String userId, boolean revoked, boolean valid, boolean recent) {}

    public RefreshTokenService(JdbcClient jdbc, @Value("${app.jwt.refresh-days:30}") int days) {
        this.jdbc = jdbc;
        this.days = days;
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    public String issue(UUID userId) {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        jdbc.sql("""
                INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
                VALUES (CAST(:u AS uuid), :h, now() + CAST(:d AS int) * interval '1 day')
                """)
                .param("u", userId.toString())
                .param("h", sha256(raw))
                .param("d", days)
                .update();
        return raw;
    }

    public Rotated rotate(String raw) {
        Row row = jdbc.sql("""
                SELECT id::text AS id, user_id::text AS user_id, revoked,
                       (expires_at > now()) AS valid,
                       (revoked_at IS NOT NULL AND revoked_at > now() - interval '10 seconds') AS recent
                FROM refresh_tokens WHERE token_hash = :h
                """)
                .param("h", sha256(raw))
                .query((rs, i) -> new Row(rs.getString("id"), rs.getString("user_id"),
                        rs.getBoolean("revoked"), rs.getBoolean("valid"), rs.getBoolean("recent")))
                .optional()
                .orElseThrow(this::unauthorized);

        UUID uid = UUID.fromString(row.userId());

        if (row.revoked()) {
            // বাতিল token আবার এলে: দুই ট্যাবের একসাথে অনুরোধ (১০ সেকেন্ড) হলে শুধু প্রত্যাখ্যান,
            // নইলে চুরির সন্দেহে ওই ইউজারের সব সেশন বাতিল
            if (!row.recent()) revokeAll(uid);
            throw unauthorized();
        }
        if (!row.valid()) throw unauthorized();

        int n = jdbc.sql("""
                UPDATE refresh_tokens SET revoked = TRUE, revoked_at = now()
                WHERE id = CAST(:id AS uuid) AND revoked = FALSE
                """)
                .param("id", row.id()).update();
        if (n == 0) throw unauthorized();

        return new Rotated(uid, issue(uid));
    }

    public void revoke(String raw) {
        if (raw == null || raw.isBlank()) return;
        jdbc.sql("""
                UPDATE refresh_tokens SET revoked = TRUE, revoked_at = now()
                WHERE token_hash = :h AND revoked = FALSE
                """)
                .param("h", sha256(raw)).update();
    }

    public void revokeAll(UUID userId) {
        jdbc.sql("""
                UPDATE refresh_tokens SET revoked = TRUE, revoked_at = now()
                WHERE user_id = CAST(:u AS uuid) AND revoked = FALSE
                """)
                .param("u", userId.toString()).update();
    }

    public static String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}