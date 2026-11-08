package bd.bloodbangladesh.blog;

import bd.bloodbangladesh.blog.BlogDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class BlogController {

    private final BlogService service;

    public BlogController(BlogService service) {
        this.service = service;
    }

    // ---- সবার জন্য ----
    @GetMapping("/blog")
    public List<PostSummary> list() {
        return service.listPublished();
    }

    @GetMapping("/blog/{slug}")
    public PostDetail get(@PathVariable String slug) {
        return service.getPublished(slug);
    }

    // ---- শুধু অ্যাডমিন (/api/v1/admin/** আগে থেকেই সুরক্ষিত) ----
    @GetMapping("/admin/blog")
    public List<PostDetail> adminList() {
        return service.adminList();
    }

    @PostMapping("/admin/blog")
    @ResponseStatus(HttpStatus.CREATED)
    public PostDetail create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PostRequest req) {
        return service.create(UUID.fromString(jwt.getSubject()), req);
    }

    @PutMapping("/admin/blog/{id}")
    public PostDetail update(@PathVariable String id, @Valid @RequestBody PostRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/admin/blog/{id}")
    public Ok delete(@PathVariable String id) {
        return service.delete(id);
    }
}
