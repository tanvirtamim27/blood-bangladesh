package bd.bloodbangladesh.notification;

import bd.bloodbangladesh.mail.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ResponseMailer {

    private static final Logger log = LoggerFactory.getLogger(ResponseMailer.class);

    private final JdbcClient jdbc;
    private final EmailService email;
    private final String baseUrl;

    public ResponseMailer(JdbcClient jdbc, EmailService email, @Value("${app.base-url}") String baseUrl) {
        this.jdbc = jdbc;
        this.email = email;
        this.baseUrl = baseUrl;
    }

    // ইমেইলে সমস্যা হলেও মূল কাজ (সাড়া দেওয়া) যেন না আটকায়
    public void donorResponded(UUID responderId, String requestId) {
        try {
            String[] d = jdbc.sql("""
                    SELECT ru.email, ru.full_name AS requester_name, r.patient_name, r.hospital_name,
                           du.full_name AS donor_name, du.phone AS donor_phone
                    FROM blood_requests r
                    JOIN users ru ON ru.id = r.requester_id
                    JOIN users du ON du.id = CAST(:d AS uuid)
                    WHERE r.id = CAST(:r AS uuid)
                    """)
                    .param("d", responderId.toString())
                    .param("r", requestId)
                    .query((rs, i) -> new String[]{
                            rs.getString("email"), rs.getString("requester_name"),
                            rs.getString("patient_name"), rs.getString("hospital_name"),
                            rs.getString("donor_name"), rs.getString("donor_phone")})
                    .optional().orElse(null);
            if (d == null || d[0] == null) return;

            String phone = d[5] == null ? "-" : d[5];
            email.send(d[0], "কেউ রক্ত দিতে চান | A donor can help - Blood Bangladesh",
                    "আসসালামু আলাইকুম " + d[1] + ",\n\n"
                            + d[4] + " আপনার অনুরোধে (রোগী: " + d[2] + ", " + d[3] + ") রক্ত দিতে চান।\n"
                            + "ফোন: " + phone + "\n"
                            + "বিস্তারিত: " + baseUrl + "/notifications\n\n"
                            + "-----\n"
                            + "Hello " + d[1] + ",\n\n"
                            + d[4] + " can donate blood for your request (patient: " + d[2] + ", " + d[3] + ").\n"
                            + "Phone: " + phone + "\n"
                            + "Details: " + baseUrl + "/notifications\n\n"
                            + "Blood Bangladesh");
        } catch (Exception e) {
            log.error("Could not send response email: {}", e.getMessage());
        }
    }
}
