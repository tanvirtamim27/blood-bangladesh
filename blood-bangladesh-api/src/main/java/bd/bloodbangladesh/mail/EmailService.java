package bd.bloodbangladesh.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> sender;
    private final String username;

    public EmailService(ObjectProvider<JavaMailSender> sender,
                        @Value("${spring.mail.username:}") String username) {
        this.sender = sender;
        this.username = username;
    }

    // পটভূমিতে চলে, তাই ইমেইল ধীর হলেও ব্যবহারকারীর অনুরোধ আটকায় না
    @Async
    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;

        // ডেভ মোড: Gmail সেট না থাকলে Console-এ ছাপে
        JavaMailSender mailSender = sender.getIfAvailable();
        if (username == null || username.isBlank() || mailSender == null) {
            log.warn("[DEV EMAIL] to={} | subject={}\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage m = new SimpleMailMessage();
            m.setFrom(username);
            m.setTo(to);
            m.setSubject(subject);
            m.setText(body);
            mailSender.send(m);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}