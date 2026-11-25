package bd.bloodbangladesh.admin;

import bd.bloodbangladesh.admin.AdminDtos.*;
import bd.bloodbangladesh.auth.RefreshTokenService;
import bd.bloodbangladesh.security.EnabledUserFilter;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final JdbcClient jdbc;
    private final RefreshTokenService refreshTokens;
    private final EnabledUserFilter userFilter;

    public AdminService(JdbcClient jdbc, RefreshTokenService refreshTokens, EnabledUserFilter userFilter) {
        this.jdbc = jdbc;
        this.refreshTokens = refreshTokens;
        this.userFilter = userFilter;
    }

    private long count(String sql) {
        return jdbc.sql(sql).query(Long.class).single();
    }

    public Stats stats() {
        List<GroupCount> byGroup = jdbc.sql("""
                SELECT blood_group, count(*) AS c FROM donor_profiles
                GROUP BY blood_group ORDER BY blood_group
                """)
                .query((rs, i) -> new GroupCount(rs.getString("blood_group"), rs.getLong("c")))
                .list();
        return new Stats(
                count("SELECT count(*) FROM users"),
                count("SELECT count(*) FROM donor_profiles"),
                count("SELECT count(*) FROM donor_profiles WHERE verified_by_admin = TRUE"),
                count("SELECT count(*) FROM blood_requests WHERE status = 'OPEN'"),
                count("SELECT count(*) FROM blood_requests WHERE status = 'FULFILLED'"),
                count("SELECT count(*) FROM blood_requests"),
                byGroup);
    }

    public List<AdminUser> users(String q) {
        String pattern = (q == null || q.isBlank()) ? null : "%" + q.trim() + "%";
        return jdbc.sql("""
                SELECT u.id::text AS id, u.full_name, u.email, u.phone, u.role, u.enabled,
                       (d.id IS NOT NULL) AS has_profile,
                       COALESCE(d.verified_by_admin, FALSE) AS verified,
                       u.created_at
                FROM users u
                LEFT JOIN donor_profiles d ON d.id = u.id
                WHERE (CAST(:q AS VARCHAR) IS NULL
                       OR u.full_name ILIKE :q OR u.email ILIKE :q OR u.phone ILIKE :q)
                ORDER BY (u.role = 'ROLE_ADMIN') DESC, u.created_at DESC
                LIMIT 50
                """)
                .param("q", pattern)
                .query((rs, i) -> new AdminUser(
                        rs.getString("id"), rs.getString("full_name"), rs.getString("email"),
                        rs.getString("phone"), rs.getString("role"), rs.getBoolean("enabled"),
                        rs.getBoolean("has_profile"), rs.getBoolean("verified"),
                        rs.getObject("created_at", OffsetDateTime.class).toString()))
                .list();
    }

    public Ok setEnabled(String id, boolean enabled) {
        String uid = parseId(id);
        String role = jdbc.sql("SELECT role FROM users WHERE id = CAST(:id AS uuid)")
                .param("id", uid).query(String.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if ("ROLE_ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Remove admin role first");
        }
        jdbc.sql("UPDATE users SET enabled = :e, updated_at = now() WHERE id = CAST(:id AS uuid)")
                .param("e", enabled).param("id", uid).update();
        userFilter.evict(uid);
        if (!enabled) refreshTokens.revokeAll(UUID.fromString(uid));
        return new Ok(true);
    }

    // Assign or remove admin role
    @Transactional
    public Ok setAdmin(UUID actorId, String id, boolean makeAdmin) {
        String uid = parseId(id);

        // Row-level lock to avoid race conditions leaving zero admins
        jdbc.sql("SELECT id FROM users WHERE role = 'ROLE_ADMIN' FOR UPDATE").query(String.class).list();

        record Target(String role, boolean enabled) {}
        Target t = jdbc.sql("SELECT role, enabled FROM users WHERE id = CAST(:id AS uuid)")
                .param("id", uid)
                .query((rs, i) -> new Target(rs.getString("role"), rs.getBoolean("enabled")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isAdmin = "ROLE_ADMIN".equals(t.role());
        if (makeAdmin == isAdmin) {
            return new Ok(true);
        }

        if (makeAdmin) {
            if (!t.enabled()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot make a banned user admin");
            }
        } else {
            if (actorId.toString().equals(uid)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot remove your own admin role");
            }
            Long admins = jdbc.sql("SELECT count(*) FROM users WHERE role = 'ROLE_ADMIN' AND enabled = TRUE")
                    .query(Long.class).single();
            if (admins <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot remove the last admin");
            }
        }

        jdbc.sql("UPDATE users SET role = :r, updated_at = now() WHERE id = CAST(:id AS uuid)")
                .param("r", makeAdmin ? "ROLE_ADMIN" : "ROLE_USER")
                .param("id", uid).update();

        userFilter.evict(uid);
        refreshTokens.revokeAll(UUID.fromString(uid));
        return new Ok(true);
    }

    public Ok setVerified(String id, boolean verified) {
        int rows = jdbc.sql("UPDATE donor_profiles SET verified_by_admin = :v WHERE id = CAST(:id AS uuid)")
                .param("v", verified).param("id", parseId(id)).update();
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor profile not found");
        }
        return new Ok(true);
    }

    public List<AdminRequest> requests() {
        return jdbc.sql("""
                SELECT r.id::text AS id, r.patient_name, r.blood_group, r.hospital_name,
                       di.name_en AS district_name, r.status, r.urgent,
                       u.full_name AS requester_name, u.email AS requester_email,
                       r.needed_at, r.created_at
                FROM blood_requests r
                JOIN users u ON u.id = r.requester_id
                LEFT JOIN districts di ON di.id = r.district_id
                ORDER BY r.created_at DESC
                LIMIT 100
                """)
                .query((rs, i) -> new AdminRequest(
                        rs.getString("id"), rs.getString("patient_name"), rs.getString("blood_group"),
                        rs.getString("hospital_name"), rs.getString("district_name"),
                        rs.getString("status"), rs.getBoolean("urgent"),
                        rs.getString("requester_name"), rs.getString("requester_email"),
                        rs.getObject("needed_at", OffsetDateTime.class).toString(),
                        rs.getObject("created_at", OffsetDateTime.class).toString()))
                .list();
    }

    public Ok removeRequest(String id) {
        int rows = jdbc.sql("""
                UPDATE blood_requests SET status = 'REMOVED_BY_ADMIN'
                WHERE id = CAST(:id AS uuid) AND status <> 'REMOVED_BY_ADMIN'
                """)
                .param("id", parseId(id)).update();
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        }
        return new Ok(true);
    }

    private String parseId(String id) {
        try {
            return UUID.fromString(id).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
    }
}
