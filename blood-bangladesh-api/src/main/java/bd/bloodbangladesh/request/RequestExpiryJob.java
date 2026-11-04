package bd.bloodbangladesh.request;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RequestExpiryJob {

    private final JdbcClient jdbc;

    public RequestExpiryJob(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // প্রতি ১০ মিনিটে: নির্ধারিত সময়ের ১২ ঘণ্টা পার হলে EXPIRED
    @Scheduled(fixedRate = 600_000)
    public void expireOld() {
        jdbc.sql("""
                UPDATE blood_requests SET status = 'EXPIRED'
                WHERE status = 'OPEN' AND needed_at < now() - interval '12 hours'
                """).update();
    }
}