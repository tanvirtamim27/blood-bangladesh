package bd.bloodbangladesh.request;

import bd.bloodbangladesh.request.RequestDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.*;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class RequestService {

    private static final Set<String> GROUPS =
            Set.of("A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG");
    private static final ZoneId DHAKA = ZoneId.of("Asia/Dhaka");

    private static final String BASE = """
            SELECT r.id::text AS id, r.patient_name, r.blood_group, r.units_needed, r.hospital_name,
                   di.name_en AS district_name, di.name_bn AS district_name_bn,
                   up.name_en AS upazila_name, up.name_bn AS upazila_name_bn,
                   r.contact_number, r.needed_at, r.note, r.urgent, r.status, r.created_at
            FROM blood_requests r
            LEFT JOIN districts di ON di.id = r.district_id
            LEFT JOIN upazilas up ON up.id = r.upazila_id
            """;

    private final JdbcClient jdbc;

    public RequestService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<RequestCard> list(String bloodGroup, Integer districtId, int limit, boolean loggedIn) {
        String group = (bloodGroup == null || bloodGroup.isBlank()) ? null : bloodGroup;
        if (group != null && !GROUPS.contains(group)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid blood group");
        }
        limit = Math.min(Math.max(limit, 1), 50);
        return jdbc.sql(BASE + """
                WHERE r.status = 'OPEN'
                  AND r.needed_at > now() - interval '12 hours'
                  AND (CAST(:bg AS VARCHAR) IS NULL OR r.blood_group = :bg)
                  AND (CAST(:district AS INT) IS NULL OR r.district_id = :district)
                ORDER BY r.urgent DESC, r.needed_at ASC
                LIMIT :limit
                """)
                .param("bg", group)
                .param("district", districtId)
                .param("limit", limit)
                .query((rs, n) -> map(rs, loggedIn))
                .list();
    }

    public List<RequestCard> mine(UUID userId) {
        return jdbc.sql(BASE + """
                WHERE r.requester_id = CAST(:uid AS uuid)
                ORDER BY r.created_at DESC
                LIMIT 100
                """)
                .param("uid", userId.toString())
                .query((rs, n) -> map(rs, true))
                .list();
    }

    public IdResponse create(UUID userId, CreateRequest req) {
        OffsetDateTime neededAt = req.neededAt().atZone(DHAKA).toOffsetDateTime();
        if (neededAt.isBefore(OffsetDateTime.now().minusHours(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Needed time is in the past");
        }
        String id = jdbc.sql("""
                INSERT INTO blood_requests
                  (requester_id, patient_name, blood_group, units_needed, hospital_name,
                   district_id, upazila_id, contact_number, needed_at, note, urgent)
                VALUES
                  (CAST(:uid AS uuid), :patient, :bg, :units, :hospital,
                   CAST(:district AS INT), CAST(:upazila AS INT), :contact, :needed, :note, :urgent)
                RETURNING id::text
                """)
                .param("uid", userId.toString())
                .param("patient", req.patientName().trim())
                .param("bg", req.bloodGroup())
                .param("units", req.unitsNeeded())
                .param("hospital", req.hospitalName().trim())
                .param("district", req.districtId())
                .param("upazila", req.upazilaId())
                .param("contact", normalizePhone(req.contactNumber()))
                .param("needed", neededAt)
                .param("note", req.note() == null || req.note().isBlank() ? null : req.note().trim())
                .param("urgent", req.urgent())
                .query(String.class).single();
        return new IdResponse(id);
    }

    public Ok setStatus(UUID userId, String requestId, String status) {
        if (!status.equals("FULFILLED") && !status.equals("CANCELLED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        int rows = jdbc.sql("""
                UPDATE blood_requests SET status = :status
                WHERE id = CAST(:id AS uuid) AND requester_id = CAST(:uid AS uuid) AND status = 'OPEN'
                """)
                .param("status", status)
                .param("id", parseId(requestId))
                .param("uid", userId.toString())
                .update();
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        return new Ok(true);
    }

    public Ok respond(UUID userId, String requestId) {
        String rid = parseId(requestId);
        String uid = userId.toString();

        String requester = jdbc.sql("""
                SELECT requester_id::text FROM blood_requests
                WHERE id = CAST(:id AS uuid) AND status = 'OPEN'
                """)
                .param("id", rid).query(String.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (requester.equals(uid)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot respond to your own request");
        }
        Long profile = jdbc.sql("SELECT count(*) FROM donor_profiles WHERE id = CAST(:u AS uuid)")
                .param("u", uid).query(Long.class).single();
        if (profile == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Create your donor profile first");
        }
        Long dup = jdbc.sql("""
                SELECT count(*) FROM notifications
                WHERE user_id = CAST(:r AS uuid) AND type = 'DONOR_RESPONSE'
                  AND payload->>'requestId' = :rid AND payload->>'responderId' = :uid
                """)
                .param("r", requester).param("rid", rid).param("uid", uid)
                .query(Long.class).single();
        if (dup > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already responded");
        }
        jdbc.sql("""
                INSERT INTO notifications (user_id, type, payload)
                SELECT CAST(:r AS uuid), 'DONOR_RESPONSE',
                       jsonb_build_object('requestId', CAST(:rid AS text),
                                          'responderId', CAST(:uid AS text),
                                          'responderName', u.full_name,
                                          'responderPhone', u.phone)
                FROM users u WHERE u.id = CAST(:uid AS uuid)
                """)
                .param("r", requester).param("rid", rid).param("uid", uid)
                .update();
        return new Ok(true);
    }

    private RequestCard map(ResultSet rs, boolean full) throws SQLException {
        String contact = rs.getString("contact_number");
        return new RequestCard(
                rs.getString("id"),
                rs.getString("patient_name"),
                rs.getString("blood_group"),
                rs.getInt("units_needed"),
                rs.getString("hospital_name"),
                rs.getString("district_name"), rs.getString("district_name_bn"),
                rs.getString("upazila_name"), rs.getString("upazila_name_bn"),
                full ? contact : mask(contact),
                rs.getObject("needed_at", OffsetDateTime.class).toString(),
                rs.getString("note"),
                rs.getBoolean("urgent"),
                rs.getString("status"),
                rs.getObject("created_at", OffsetDateTime.class).toString());
    }

    private String parseId(String id) {
        try {
            return UUID.fromString(id).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
    }

    private String normalizePhone(String p) {
        return p.startsWith("01") ? "+88" + p : p;
    }

    private String mask(String phone) {
        if (phone == null || phone.length() < 8) return null;
        return phone.substring(0, 6) + "****" + phone.substring(phone.length() - 3);
    }
}
