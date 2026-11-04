package bd.bloodbangladesh.notification;

import bd.bloodbangladesh.notification.NotificationDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final JdbcClient jdbc;

    public NotificationService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<NotificationItem> list(UUID userId) {
        return jdbc.sql("""
                SELECT n.id::text AS id, n.type,
                       n.payload->>'responderName'  AS responder_name,
                       n.payload->>'responderPhone' AS responder_phone,
                       r.patient_name, r.blood_group, r.hospital_name,
                       n.is_read, n.created_at
                FROM notifications n
                LEFT JOIN blood_requests r ON r.id::text = n.payload->>'requestId'
                WHERE n.user_id = CAST(:uid AS uuid)
                ORDER BY n.created_at DESC
                LIMIT 50
                """)
                .param("uid", userId.toString())
                .query((rs, i) -> new NotificationItem(
                        rs.getString("id"),
                        rs.getString("type"),
                        rs.getString("responder_name"),
                        rs.getString("responder_phone"),
                        rs.getString("patient_name"),
                        rs.getString("blood_group"),
                        rs.getString("hospital_name"),
                        rs.getBoolean("is_read"),
                        rs.getObject("created_at", OffsetDateTime.class).toString()))
                .list();
    }

    public CountResponse unreadCount(UUID userId) {
        Long c = jdbc.sql("""
                SELECT count(*) FROM notifications
                WHERE user_id = CAST(:uid AS uuid) AND is_read = FALSE
                """)
                .param("uid", userId.toString())
                .query(Long.class).single();
        return new CountResponse(c);
    }

    public Ok markRead(UUID userId, String id) {
        String nid;
        try {
            nid = UUID.fromString(id).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        int rows = jdbc.sql("""
                UPDATE notifications SET is_read = TRUE
                WHERE id = CAST(:id AS uuid) AND user_id = CAST(:uid AS uuid)
                """)
                .param("id", nid)
                .param("uid", userId.toString())
                .update();
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        return new Ok(true);
    }

    public Ok markAllRead(UUID userId) {
        jdbc.sql("""
                UPDATE notifications SET is_read = TRUE
                WHERE user_id = CAST(:uid AS uuid) AND is_read = FALSE
                """)
                .param("uid", userId.toString())
                .update();
        return new Ok(true);
    }

    // আমি কোন কোন অনুরোধে সাড়া দিয়েছি (বাটন সবুজ রাখার জন্য)
    public List<String> respondedRequestIds(UUID userId) {
        return jdbc.sql("""
                SELECT DISTINCT payload->>'requestId' FROM notifications
                WHERE type = 'DONOR_RESPONSE' AND payload->>'responderId' = :uid
                """)
                .param("uid", userId.toString())
                .query(String.class).list();
    }
}