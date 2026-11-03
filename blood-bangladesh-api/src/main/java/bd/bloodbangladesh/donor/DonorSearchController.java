package bd.bloodbangladesh.donor;

import bd.bloodbangladesh.donor.DonorSearchDtos.SearchResult;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/donors")
public class DonorSearchController {

    private final DonorSearchService service;

    public DonorSearchController(DonorSearchService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public SearchResult search(@RequestParam String bloodGroup,
                               @RequestParam(required = false) Integer districtId,
                               @RequestParam(required = false) Integer upazilaId,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size,
                               Authentication auth) {
        boolean loggedIn = auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal());
        return service.search(bloodGroup, districtId, upazilaId, page, size, loggedIn);
    }
}