package bd.bloodbangladesh.donation;

import bd.bloodbangladesh.donation.DonationDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me/donations")
public class DonationController {

    private final DonationService service;

    public DonationController(DonationService service) {
        this.service = service;
    }

    private UUID uid(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    @GetMapping
    public Overview overview(@AuthenticationPrincipal Jwt jwt) {
        return service.overview(uid(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ok add(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AddDonationRequest req) {
        return service.add(uid(jwt), req);
    }

    @DeleteMapping("/{id}")
    public Ok delete(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        return service.delete(uid(jwt), id);
    }
}