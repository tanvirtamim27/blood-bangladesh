package bd.bloodbangladesh.donor;

import bd.bloodbangladesh.donor.DonorDtos.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

    private final DonorService service;

    public UserController(DonorService service) {
        this.service = service;
    }

    @GetMapping
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return service.me(UUID.fromString(jwt.getSubject()));
    }

    @PutMapping("/contact")
    public MeResponse contact(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ContactRequest req) {
        return service.updateContact(UUID.fromString(jwt.getSubject()), req);
    }

    @PutMapping("/donor-profile")
    public DonorProfileResponse saveProfile(@AuthenticationPrincipal Jwt jwt,
                                            @Valid @RequestBody DonorProfileRequest req) {
        return service.saveProfile(UUID.fromString(jwt.getSubject()), req);
    }

    @PatchMapping("/interest")
    public DonorProfileResponse interest(@AuthenticationPrincipal Jwt jwt,
                                         @RequestBody InterestRequest req) {
        return service.setInterest(UUID.fromString(jwt.getSubject()), req.interested());
    }
}