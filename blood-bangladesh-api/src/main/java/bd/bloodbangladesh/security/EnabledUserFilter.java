package bd.bloodbangladesh.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

// প্রতিটি অনুরোধে ডেটাবেস থেকে ইউজারের enabled ও আসল role দেখে (১০ সেকেন্ড ক্যাশ)।
// ban করা হলে ৪০১। admin সরানো হলে টোকেনে ROLE_ADMIN থাকলেও ক্ষমতা চলে যায়।
@Component
public class EnabledUserFilter extends OncePerRequestFilter {

    private record Entry(boolean enabled, String role, Instant at) {}

    private static final Duration TTL = Duration.ofSeconds(10);
    private final ConcurrentHashMap<String, Entry> cache = new ConcurrentHashMap<>();
    private final JdbcClient jdbc;

    public EnabledUserFilter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    // role বদলালে সঙ্গে সঙ্গে ক্যাশ মুছতে
    public void evict(String userId) {
        cache.remove(userId);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            Entry e = lookup(jwt.getSubject());
            if (e == null || !e.enabled()) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            // টোকেনের পুরনো role-এর বদলে ডেটাবেসের আসল role বসানো হয়
            JwtAuthenticationToken fresh = new JwtAuthenticationToken(
                    jwt, List.of(new SimpleGrantedAuthority(e.role())), auth.getName());
            fresh.setAuthenticated(true);
            SecurityContextHolder.getContext().setAuthentication(fresh);
        }
        chain.doFilter(request, response);
    }

    private Entry lookup(String uid) {
        Entry cached = cache.get(uid);
        if (cached != null && cached.at().plus(TTL).isAfter(Instant.now())) {
            return cached;
        }
        Entry fresh = jdbc.sql("SELECT enabled, role FROM users WHERE id = CAST(:id AS uuid)")
                .param("id", uid)
                .query((rs, i) -> new Entry(rs.getBoolean("enabled"), rs.getString("role"), Instant.now()))
                .optional()
                .orElse(null);
        if (fresh != null) cache.put(uid, fresh);
        return fresh;
    }
}