package bd.bloodbangladesh.location;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {

    private final JdbcClient jdbc;

    public LocationController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/divisions")
    public List<Map<String, Object>> divisions() {
        return jdbc.sql("SELECT id, name_en AS \"nameEn\", name_bn AS \"nameBn\" FROM divisions ORDER BY name_en")
                .query().listOfRows();
    }

    @GetMapping("/divisions/{id}/districts")
    public List<Map<String, Object>> districts(@PathVariable int id) {
        return jdbc.sql("SELECT id, name_en AS \"nameEn\", name_bn AS \"nameBn\" FROM districts WHERE division_id = :id ORDER BY name_en")
                .param("id", id).query().listOfRows();
    }

    @GetMapping("/districts/{id}/upazilas")
    public List<Map<String, Object>> upazilas(@PathVariable int id) {
        return jdbc.sql("SELECT id, name_en AS \"nameEn\", name_bn AS \"nameBn\" FROM upazilas WHERE district_id = :id ORDER BY name_en")
                .param("id", id).query().listOfRows();
    }
}
