package bd.bloodbangladesh.stats;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
public class PublicStatsController {
    public record PublicStats(long users, long donors, long donations, long openRequests) {}
    private final JdbcClient jdbc;

    public PublicStatsController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private long count(String sql) {
        return jdbc.sql(sql).query(Long.class).single();
    }

    @GetMapping("/stats")
    public PublicStats stats() {
        return new PublicStats(
                count("SELECT count(*) FROM users WHERE enabled = TRUE"),
                count("SELECT count(*) FROM donor_profiles"),
                count("SELECT count(*) FROM donation_history"),
                count("SELECT count(*) FROM blood_requests WHERE status = 'OPEN'")
        );
    }
}
