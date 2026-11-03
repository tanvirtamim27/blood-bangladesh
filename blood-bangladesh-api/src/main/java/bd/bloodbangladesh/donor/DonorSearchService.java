package bd.bloodbangladesh.donor;

import bd.bloodbangladesh.donor.DonorSearchDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class DonorSearchService {

    private static final Set<String> GROUPS =
            Set.of("A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG");

    private final JdbcClient jdbc;

    public DonorSearchService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public SearchResult search(String bloodGroup, Integer districtId, Integer upazilaId,
                               int page, int size, boolean loggedIn) {
        if (!GROUPS.contains(bloodGroup)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid blood group");
        }
        page = Math.max(page, 0);
        size = Math.min(Math.max(size, 1), 50);
        LocalDate cutoff = LocalDate.now().minusDays(90);

        String where = """
                FROM donor_profiles d
                JOIN users u ON u.id = d.id
                LEFT JOIN districts di ON di.id = d.district_id
                LEFT JOIN upazilas up ON up.id = d.upazila_id
                WHERE d.interested = TRUE
                  AND u.enabled = TRUE
                  AND d.blood_group = :bg
                  AND (CAST(:district AS INT) IS NULL OR d.district_id = :district)
                  AND (CAST(:upazila AS INT) IS NULL OR d.upazila_id = :upazila)
                """;

        Long total = jdbc.sql("SELECT count(*) " + where)
                .param("bg", bloodGroup)
                .param("district", districtId)
                .param("upazila", upazilaId)
                .query(Long.class).single();

        List<DonorCard> items = jdbc.sql("""
                SELECT d.id, u.full_name, u.phone, d.blood_group,
                       d.division_id, d.district_id, d.upazila_id,
                       di.name_en AS district_name, up.name_en AS upazila_name,
                       d.last_donation_date, d.total_donations, d.verified_by_admin,
                       (d.last_donation_date IS NULL OR d.last_donation_date <= :cutoff) AS available
                """ + where + """
                ORDER BY (d.last_donation_date IS NULL OR d.last_donation_date <= :cutoff) DESC,
                         d.last_donation_date ASC NULLS FIRST
                LIMIT :size OFFSET :offset
                """)
                .param("bg", bloodGroup)
                .param("district", districtId)
                .param("upazila", upazilaId)
                .param("cutoff", Date.valueOf(cutoff))
                .param("size", size)
                .param("offset", page * size)
                .query((rs, n) -> new DonorCard(
                        rs.getString("id"),
                        rs.getString("full_name"),
                        loggedIn ? rs.getString("phone") : mask(rs.getString("phone")),
                        rs.getString("blood_group"),
                        (Integer) rs.getObject("division_id"),
                        (Integer) rs.getObject("district_id"),
                        (Integer) rs.getObject("upazila_id"),
                        rs.getString("district_name"),
                        rs.getString("upazila_name"),
                        rs.getObject("last_donation_date", LocalDate.class),
                        rs.getInt("total_donations"),
                        rs.getBoolean("verified_by_admin"),
                        rs.getBoolean("available")))
                .list();

        int totalPages = (int) Math.ceil(total / (double) size);
        return new SearchResult(items, page, size, total, totalPages);
    }

    private String mask(String phone) {
        if (phone == null || phone.length() < 8) return null;
        return phone.substring(0, 6) + "****" + phone.substring(phone.length() - 3);
    }
}