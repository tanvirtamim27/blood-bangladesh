package bd.bloodbangladesh.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

// প্রতিটি অনুরোধে দেখে ইউজার এখনো enabled কিনা। ban করা হলে টোকেন থাকলেও ৪০১।
// ডেটাবেসে বারবার না গিয়ে ১০ সেকেন্ড ক্যাশ রাখা হয়।
@Component
public class EnabledUserFilter extends OncePerRequestFilter {

    private record Entry(boolean enabled, Instant at) {}

    private static final Duration TTL = Duration.ofSeconds(10);
    private final ConcurrentHashMap<String, Entry> cache = new ConcurrentHashMap<>();
    private final JdbcClient jdbc;

    public EnabledUserFilter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String uid = jwt.getSubject();
            if (!isEnabled(uid)) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private boolean isEnabled(String uid) {
        Entry e = cache.get(uid);
        if (e != null && e.at().plus(TTL).isAfter(Instant.now())) {
            return e.enabled();
        }
        boolean enabled = jdbc.sql("SELECT enabled FROM users WHERE id = CAST(:id AS uuid)")
                .param("id", uid)
                .query(Boolean.class)
                .optional()
                .orElse(false);
        cache.put(uid, new Entry(enabled, Instant.now()));
        return enabled;
    }
}
