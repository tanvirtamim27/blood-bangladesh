package bd.bloodbangladesh.donation;

import bd.bloodbangladesh.donation.DonationDtos.Ok;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class DonationConfirmController {

    private final DonationService service;

    public DonationConfirmController(DonationService service) {
        this.service = service;
    }

    @PostMapping("/{id}/confirm-donation")
    public Ok confirm(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        return service.confirmFromNotification(UUID.fromString(jwt.getSubject()), id);
    }
}
