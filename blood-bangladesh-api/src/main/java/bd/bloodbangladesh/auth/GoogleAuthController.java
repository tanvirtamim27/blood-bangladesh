package bd.bloodbangladesh.auth;

import bd.bloodbangladesh.auth.AuthDtos.AuthResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class GoogleAuthController {

    public record GoogleRequest(@NotBlank String idToken) {}

    private final GoogleAuthService service;

    public GoogleAuthController(GoogleAuthService service) {
        this.service = service;
    }

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleRequest req) {
        return service.login(req.idToken());
    }
}
