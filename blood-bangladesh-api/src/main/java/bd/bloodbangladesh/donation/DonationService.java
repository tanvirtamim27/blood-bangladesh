package bd.bloodbangladesh.donation;

import bd.bloodbangladesh.donation.DonationDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Date;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
public class DonationService {

    private final JdbcClient jdbc;

    private record Resp(String requestId, String donorId) {}
    private record Req(String hospital) {}

    public DonationService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public Overview overview(UUID userId) {
        String uid = userId.toString();
        boolean hasProfile = jdbc.sql("SELECT count(*) FROM donor_profiles WHERE id = CAST(:uid AS uuid)")
                .param("uid", uid).query(Long.class).single() > 0;

        List<DonationItem> items = jdbc.sql("""
                SELECT id::text AS id, donation_date, hospital_name, notes
                FROM donation_history
                WHERE donor_id = CAST(:uid AS uuid)
                ORDER BY donation_date DESC
                LIMIT 200
                """)
                .param("uid", uid)
                .query((rs, i) -> new DonationItem(
                        rs.getString("id"),
                        rs.getObject("donation_date", LocalDate.class).toString(),
                        rs.getString("hospital_name"),
                        rs.getString("notes")))
                .list();

        List<BadgeItem> badges = jdbc.sql("""
                SELECT b.code, b.name_en, b.name_bn, b.min_donations, b.icon,
                       (ub.user_id IS NOT NULL) AS earned
                FROM badges b
                LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = CAST(:uid AS uuid)
                ORDER BY b.min_donations
                """)
                .param("uid", uid)
                .query((rs, i) -> new BadgeItem(
                        rs.getString("code"), rs.getString("name_en"), rs.getString("name_bn"),
                        rs.getInt("min_donations"), rs.getString("icon"), rs.getBoolean("earned")))
                .list();

        return new Overview(hasProfile, items.size(), items, badges);
    }

    @Transactional
    public Ok add(UUID userId, AddDonationRequest req) {
        String uid = userId.toString();
        LocalDate date = req.donationDate();
        if (date.isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Donation date cannot be in the future");
        }
        if (!hasProfile(uid)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Create your donor profile first");
        }
        if (nearDonation(uid, date)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another donation is within 90 days");
        }

        jdbc.sql("""
                INSERT INTO donation_history (donor_id, donation_date, hospital_name, notes)
                VALUES (CAST(:uid AS uuid), :date, :hospital, :notes)
                """)
                .param("uid", uid)
                .param("date", Date.valueOf(date))
                .param("hospital", blankToNull(req.hospitalName()))
                .param("notes", blankToNull(req.notes()))
                .update();

        updateLastDate(uid, date);
        syncTotalsAndBadges(uid);
        return new Ok(true);
    }

    // অনুরোধকারী 🔔 নোটিফিকেশন থেকে দাতার রক্তদান নিশ্চিত করেন
    @Transactional
    public Ok confirmFromNotification(UUID requesterId, String notificationId) {
        String rid = requesterId.toString();
        String nid;
        try {
            nid = UUID.fromString(notificationId).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }

        Resp resp = jdbc.sql("""
                SELECT payload->>'requestId' AS request_id, payload->>'responderId' AS donor_id
                FROM notifications
                WHERE id = CAST(:id AS uuid) AND user_id = CAST(:uid AS uuid) AND type = 'DONOR_RESPONSE'
                """)
                .param("id", nid).param("uid", rid)
                .query((rs, i) -> new Resp(rs.getString("request_id"), rs.getString("donor_id")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
        if (resp.requestId() == null || resp.donorId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }

        Req req = jdbc.sql("""
                SELECT hospital_name FROM blood_requests
                WHERE id = CAST(:r AS uuid) AND requester_id = CAST(:uid AS uuid)
                """)
                .param("r", resp.requestId()).param("uid", rid)
                .query((rs, i) -> new Req(rs.getString("hospital_name")))
                .optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        String did = resp.donorId();
        if (!hasProfile(did)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Donor has no profile");
        }
        Long dup = jdbc.sql("""
                SELECT count(*) FROM donation_history
                WHERE request_id = CAST(:r AS uuid) AND donor_id = CAST(:d AS uuid)
                """)
                .param("r", resp.requestId()).param("d", did)
                .query(Long.class).single();
        if (dup > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already confirmed");
        }

        LocalDate date = LocalDate.now(ZoneId.of("Asia/Dhaka"));
        if (nearDonation(did, date)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Donor already has a donation within 90 days");
        }

        jdbc.sql("""
                INSERT INTO donation_history
                  (donor_id, request_id, donation_date, hospital_name, notes, confirmed_by_requester)
                VALUES (CAST(:d AS uuid), CAST(:r AS uuid), :date, :hospital, :notes, TRUE)
                """)
                .param("d", did).param("r", resp.requestId())
                .param("date", Date.valueOf(date))
                .param("hospital", req.hospital())
                .param("notes", "Confirmed by requester / অনুরোধকারী নিশ্চিত করেছেন")
                .update();

        updateLastDate(did, date);
        syncTotalsAndBadges(did);

        // দাতাকে ধন্যবাদ জানিয়ে নোটিফিকেশন
        jdbc.sql("""
                INSERT INTO notifications (user_id, type, payload)
                SELECT CAST(:d AS uuid), 'DONATION_CONFIRMED',
                       jsonb_build_object('requestId', CAST(:r AS text), 'requesterName', u.full_name)
                FROM users u WHERE u.id = CAST(:uid AS uuid)
                """)
                .param("d", did).param("r", resp.requestId()).param("uid", rid)
                .update();
        return new Ok(true);
    }

    @Transactional
    public Ok delete(UUID userId, String donationId) {
        String uid = userId.toString();
        String did;
        try {
            did = UUID.fromString(donationId).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        int rows = jdbc.sql("""
                DELETE FROM donation_history
                WHERE id = CAST(:id AS uuid) AND donor_id = CAST(:uid AS uuid)
                """)
                .param("id", did).param("uid", uid).update();
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
        }
        jdbc.sql("""
                UPDATE donor_profiles
                SET last_donation_date = (SELECT max(donation_date) FROM donation_history
                                          WHERE donor_id = donor_profiles.id)
                WHERE id = CAST(:uid AS uuid)
                """)
                .param("uid", uid).update();
        syncTotalsAndBadges(uid);
        return new Ok(true);
    }

    private boolean hasProfile(String uid) {
        return jdbc.sql("SELECT count(*) FROM donor_profiles WHERE id = CAST(:uid AS uuid)")
                .param("uid", uid).query(Long.class).single() > 0;
    }

    private boolean nearDonation(String uid, LocalDate date) {
        Long near = jdbc.sql("""
                SELECT count(*) FROM donation_history
                WHERE donor_id = CAST(:uid AS uuid)
                  AND donation_date > :from AND donation_date < :to
                """)
                .param("uid", uid)
                .param("from", Date.valueOf(date.minusDays(90)))
                .param("to", Date.valueOf(date.plusDays(90)))
                .query(Long.class).single();
        return near > 0;
    }

    // শেষ রক্তদানের তারিখ কখনো পিছিয়ে যাবে না
    private void updateLastDate(String uid, LocalDate date) {
        jdbc.sql("""
                UPDATE donor_profiles
                SET last_donation_date = GREATEST(COALESCE(last_donation_date, :d), :d)
                WHERE id = CAST(:uid AS uuid)
                """)
                .param("d", Date.valueOf(date))
                .param("uid", uid)
                .update();
    }

    private void syncTotalsAndBadges(String uid) {
        jdbc.sql("""
                UPDATE donor_profiles
                SET total_donations = (SELECT count(*) FROM donation_history
                                       WHERE donor_id = donor_profiles.id)
                WHERE id = CAST(:uid AS uuid)
                """)
                .param("uid", uid).update();

        jdbc.sql("""
                INSERT INTO user_badges (user_id, badge_id)
                SELECT CAST(:uid AS uuid), b.id FROM badges b
                WHERE b.min_donations <= (SELECT total_donations FROM donor_profiles
                                          WHERE id = CAST(:uid AS uuid))
                ON CONFLICT DO NOTHING
                """)
                .param("uid", uid).update();

        jdbc.sql("""
                DELETE FROM user_badges
                WHERE user_id = CAST(:uid AS uuid)
                  AND badge_id IN (SELECT b.id FROM badges b
                                   WHERE b.min_donations > (SELECT total_donations FROM donor_profiles
                                                            WHERE id = CAST(:uid AS uuid)))
                """)
                .param("uid", uid).update();
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}