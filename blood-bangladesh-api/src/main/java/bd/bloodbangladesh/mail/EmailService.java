package bd.bloodbangladesh.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5)).build();

    private final String apiKey;
    private final String from;

    public EmailService(@Value("${app.brevo.api-key:}") String apiKey,
                        @Value("${app.mail-from:}") String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    @Async
    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        if (apiKey == null || apiKey.isBlank() || from == null || from.isBlank()) {
            log.warn("[DEV EMAIL] to={} | subject={}\n{}", to, subject, body);
            return;
        }
        try {
            String json = "{\"sender\":{\"name\":\"Blood Bangladesh\",\"email\":" + q(from) + "},"
                    + "\"to\":[{\"email\":" + q(to) + "}],"
                    + "\"subject\":" + q(subject) + ","
                    + "\"textContent\":" + q(body) + "}";
            HttpRequest req = HttpRequest.newBuilder(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(10))
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> res = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() >= 300) {
                log.error("Email failed ({}): {}", res.statusCode(), res.body());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private static String q(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        return sb.append("\"").toString();
    }
}