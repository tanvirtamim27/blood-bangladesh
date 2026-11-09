package bd.bloodbangladesh.admin;

import bd.bloodbangladesh.admin.AdminDtos.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public Stats stats() {
        return service.stats();
    }

    @GetMapping("/users")
    public List<AdminUser> users(@RequestParam(required = false) String q) {
        return service.users(q);
    }

    @PatchMapping("/users/{id}/enabled")
    public Ok enabled(@PathVariable String id, @RequestBody EnabledRequest req) {
        return service.setEnabled(id, req.enabled());
    }

    @PatchMapping("/users/{id}/admin")
    public Ok admin(@AuthenticationPrincipal Jwt jwt, @PathVariable String id,
                    @RequestBody AdminRoleRequest req) {
        return service.setAdmin(UUID.fromString(jwt.getSubject()), id, req.admin());
    }

    @PatchMapping("/donors/{id}/verified")
    public Ok verified(@PathVariable String id, @RequestBody VerifiedRequest req) {
        return service.setVerified(id, req.verified());
    }

    @GetMapping("/requests")
    public List<AdminRequest> requests() {
        return service.requests();
    }

    @DeleteMapping("/requests/{id}")
    public Ok remove(@PathVariable String id) {
        return service.removeRequest(id);
    }
}