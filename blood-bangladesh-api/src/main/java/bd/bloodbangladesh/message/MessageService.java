package bd.bloodbangladesh.message;

import bd.bloodbangladesh.mail.EmailService;
import bd.bloodbangladesh.message.MessageDtos.Ok;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class MessageService {

    private static final int MAX_PER_DAY = 10;

    private final JdbcClient jdbc;
    private final EmailService email;
    private final String baseUrl;

    private record Person(String name, String email, String phone) {}

    public MessageService(JdbcClient jdbc, EmailService email, @Value("${app.base-url}") String baseUrl) {
        this.jdbc = jdbc;
        this.email = email;
        this.baseUrl = baseUrl;
    }

    @Transactional
    public Ok send(UUID senderId, String donorId, String rawBody) {
        String did;
        try {
            did = UUID.fromString(donorId).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not found");
        }
        String sid = senderId.toString();
        if (sid.equals(did)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
        }
        String body = rawBody.trim();
        if (body.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is empty");
        }

        // শুধু সার্চে দেখা যায় এমন দাতাকেই বার্তা পাঠানো যাবে
        Person donor = jdbc.sql("""
                SELECT u.full_name, u.email, u.phone
                FROM donor_profiles d JOIN users u ON u.id = d.id
                WHERE d.id = CAST(:id AS uuid) AND d.interested = TRUE AND u.enabled = TRUE
                """)
                .param("id", did)
                .query((rs, i) -> new Person(rs.getString("full_name"), rs.getString("email"), rs.getString("phone")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not available"));

        Person sender = jdbc.sql("SELECT full_name, email, phone FROM users WHERE id = CAST(:id AS uuid)")
                .param("id", sid)
                .query((rs, i) -> new Person(rs.getString("full_name"), rs.getString("email"), rs.getString("phone")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Long today = jdbc.sql("""
                SELECT count(*) FROM direct_messages
                WHERE sender_id = CAST(:s AS uuid) AND created_at > now() - interval '24 hours'
                """)
                .param("s", sid).query(Long.class).single();
        if (today >= MAX_PER_DAY) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Daily message limit reached");
        }
        Long recent = jdbc.sql("""
                SELECT count(*) FROM direct_messages
                WHERE sender_id = CAST(:s AS uuid) AND donor_id = CAST(:d AS uuid)
                  AND created_at > now() - interval '1 hour'
                """)
                .param("s", sid).param("d", did).query(Long.class).single();
        if (recent > 0) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please wait before messaging this donor again");
        }

        jdbc.sql("""
                INSERT INTO direct_messages (sender_id, donor_id, body, email_sent)
                VALUES (CAST(:s AS uuid), CAST(:d AS uuid), :body, :sent)
                """)
                .param("s", sid).param("d", did).param("body", body)
                .param("sent", donor.email() != null)
                .update();

        jdbc.sql("""
                INSERT INTO notifications (user_id, type, payload)
                VALUES (CAST(:d AS uuid), 'DIRECT_MESSAGE',
                        jsonb_build_object('senderId', CAST(:s AS text),
                                           'senderName', CAST(:sn AS text),
                                           'senderPhone', CAST(:sp AS text),
                                           'body', CAST(:body AS text)))
                """)
                .param("d", did).param("s", sid)
                .param("sn", sender.name()).param("sp", sender.phone()).param("body", body)
                .update();

        String phone = sender.phone() == null ? "-" : sender.phone();
        email.send(donor.email(), "আপনার জন্য একটি বার্তা | New message - Blood Bangladesh",
                "আসসালামু আলাইকুম " + donor.name() + ",\n\n"
                        + sender.name() + " আপনাকে একটি বার্তা পাঠিয়েছেন:\n\n\"" + body + "\"\n\n"
                        + "ফোন: " + phone + "\n"
                        + "বিস্তারিত: " + baseUrl + "/notifications\n\n"
                        + "-----\n"
                        + "Hello " + donor.name() + ",\n\n"
                        + sender.name() + " sent you a message:\n\n\"" + body + "\"\n\n"
                        + "Phone: " + phone + "\n"
                        + "Details: " + baseUrl + "/notifications\n\n"
                        + "Blood Bangladesh");
        return new Ok(true);
    }
}
