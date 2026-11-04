package bd.bloodbangladesh.notification;

import bd.bloodbangladesh.notification.NotificationDtos.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    private UUID uid(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }

    @GetMapping("/notifications")
    public List<NotificationItem> list(@AuthenticationPrincipal Jwt jwt) {
        return service.list(uid(jwt));
    }

    @GetMapping("/notifications/unread-count")
    public CountResponse unread(@AuthenticationPrincipal Jwt jwt) {
        return service.unreadCount(uid(jwt));
    }

    @PatchMapping("/notifications/{id}/read")
    public Ok read(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        return service.markRead(uid(jwt), id);
    }

    @PostMapping("/notifications/read-all")
    public Ok readAll(@AuthenticationPrincipal Jwt jwt) {
        return service.markAllRead(uid(jwt));
    }

    @GetMapping("/users/me/responded-requests")
    public List<String> responded(@AuthenticationPrincipal Jwt jwt) {
        return service.respondedRequestIds(uid(jwt));
    }
}