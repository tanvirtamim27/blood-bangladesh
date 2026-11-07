package bd.bloodbangladesh.auth;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

// স্লাইডিং উইন্ডো: ১৫ মিনিটে সর্বোচ্চ ৫টি ব্যর্থ চেষ্টা। মেমোরিতে থাকে।
@Component
public class LoginRateLimiter {

    private static final int MAX_FAILS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Deque<Instant>> fails = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        Deque<Instant> q = fails.get(key);
        if (q == null) return false;
        synchronized (q) {
            prune(q);
            return q.size() >= MAX_FAILS;
        }
    }

    public void recordFailure(String key) {
        Deque<Instant> q = fails.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            prune(q);
            q.addLast(Instant.now());
        }
    }

    public void reset(String key) {
        fails.remove(key);
    }

    private void prune(Deque<Instant> q) {
        Instant cutoff = Instant.now().minus(WINDOW);
        while (!q.isEmpty() && q.peekFirst().isBefore(cutoff)) {
            q.pollFirst();
        }
    }
}
