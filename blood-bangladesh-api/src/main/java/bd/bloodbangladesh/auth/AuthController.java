package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    public record Ok(boolean ok) {}

    private final AuthService service;
    private final EmailVerificationService verification;
    private final RefreshCookies cookies;

    public AuthController(AuthService service, EmailVerificationService verification, RefreshCookies cookies) {
        this.service = service;
        this.verification = verification;
        this.cookies = cookies;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResult register(@Valid @RequestBody RegisterRequest req) {
        return service.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req,
                              HttpServletRequest http, HttpServletResponse res) {
        Session s = service.login(req, http.getRemoteAddr());
        cookies.set(res, s.refreshToken());
        return s.body();
    }

    @PostMapping("/verify-email")
    public Ok verify(@Valid @RequestBody VerifyEmailRequest req) {
        verification.verify(req.token());
        return new Ok(true);
    }

    @PostMapping("/resend-verification")
    public Ok resend(@Valid @RequestBody ForgotRequest req, HttpServletRequest http) {
        verification.resend(req.email(), http.getRemoteAddr());
        return new Ok(true);
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