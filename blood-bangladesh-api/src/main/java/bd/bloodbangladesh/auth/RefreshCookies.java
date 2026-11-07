package bd.bloodbangladesh.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RefreshCookies {

    public static final String NAME = "bb_refresh";

    private final boolean secure;
    private final long days;

    public RefreshCookies(@Value("${app.cookie-secure:false}") boolean secure,
                          @Value("${app.jwt.refresh-days:30}") long days) {
        this.secure = secure;
        this.days = days;
    }

    public void set(HttpServletResponse res, String token) {
        res.addHeader(HttpHeaders.SET_COOKIE, build(token, Duration.ofDays(days)).toString());
    }

    public void clear(HttpServletResponse res) {
        res.addHeader(HttpHeaders.SET_COOKIE, build("", Duration.ZERO).toString());
    }

    private ResponseCookie build(String value, Duration maxAge) {
        return ResponseCookie.from(NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/api/v1/auth")
                .maxAge(maxAge)
                .build();
    }
}