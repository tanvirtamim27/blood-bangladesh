package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.AuthResponse;
import bd.bloodbangladesh.auth.AuthDtos.Session;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class GoogleAuthController {

    public record GoogleRequest(@NotBlank String idToken) {}

    private final GoogleAuthService service;
    private final RefreshCookies cookies;

    public GoogleAuthController(GoogleAuthService service, RefreshCookies cookies) {
        this.service = service;
        this.cookies = cookies;
    }

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleRequest req, HttpServletResponse res) {
        Session s = service.login(req.idToken());
        cookies.set(res, s.refreshToken());
        return s.body();
    }
}