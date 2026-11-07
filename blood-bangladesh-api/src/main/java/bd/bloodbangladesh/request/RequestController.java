package bd.bloodbangladesh.request;

import bd.bloodbangladesh.notification.ResponseMailer;
import bd.bloodbangladesh.request.RequestDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class RequestController {

    private final RequestService service;
    private final ResponseMailer mailer;

    public RequestController(RequestService service, ResponseMailer mailer) {
        this.service = service;
        this.mailer = mailer;
    }

    @GetMapping("/requests")
    public List<RequestCard> list(@RequestParam(required = false) String bloodGroup,
                                  @RequestParam(required = false) Integer districtId,
                                  @RequestParam(defaultValue = "20") int limit,
                                  Authentication auth) {
        boolean loggedIn = auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal());
        return service.list(bloodGroup, districtId, limit, loggedIn);
    }

    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    public IdResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateRequest req) {
        return service.create(UUID.fromString(jwt.getSubject()), req);
    }

    @GetMapping("/users/me/requests")
    public List<RequestCard> mine(@AuthenticationPrincipal Jwt jwt) {
        return service.mine(UUID.fromString(jwt.getSubject()));
    }

    @PatchMapping("/requests/{id}/status")
    public Ok status(@AuthenticationPrincipal Jwt jwt, @PathVariable String id,
                     @Valid @RequestBody StatusRequest req) {
        return service.setStatus(UUID.fromString(jwt.getSubject()), id, req.status());
    }

    @PostMapping("/requests/{id}/respond")
    public Ok respond(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        UUID uid = UUID.fromString(jwt.getSubject());
        Ok ok = service.respond(uid, id);
        mailer.donorResponded(uid, id);
        return ok;
    }
}