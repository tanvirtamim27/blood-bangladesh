package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.ForgotRequest;
import bd.bloodbangladesh.auth.AuthDtos.ResetRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class PasswordResetController {

    public record Ok(boolean ok) {}

    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/forgot-password")
    public Ok forgot(@Valid @RequestBody ForgotRequest req, HttpServletRequest http) {
        service.request(req.email(), http.getRemoteAddr());
        return new Ok(true);
    }

    @PostMapping("/reset-password")
    public Ok reset(@Valid @RequestBody ResetRequest req) {
        service.reset(req.token(), req.password());
        return new Ok(true);
    }
}