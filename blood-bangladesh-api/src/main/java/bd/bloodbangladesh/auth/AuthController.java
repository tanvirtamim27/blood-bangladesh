package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.AuthResponse;
import bd.bloodbangladesh.auth.AuthDtos.Session;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService service;
    private final RefreshCookies cookies;

    public AuthController(AuthService service, RefreshCookies cookies) {
        this.service = service;
        this.cookies = cookies;
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@CookieValue(name = RefreshCookies.NAME, required = false) String raw,
                                HttpServletResponse res) {
        try {
            Session s = service.refresh(raw);
            cookies.set(res, s.refreshToken());
            return s.body();
        } catch (RuntimeException e) {
            cookies.clear(res);
            throw e;
        }
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = RefreshCookies.NAME, required = false) String raw,
                       HttpServletResponse res) {
        service.logout(raw);
        cookies.clear(res);
    }
}