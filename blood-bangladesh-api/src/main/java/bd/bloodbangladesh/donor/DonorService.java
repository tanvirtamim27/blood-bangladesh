package bd.bloodbangladesh.donor;

import bd.bloodbangladesh.donor.DonorDtos.*;
import bd.bloodbangladesh.user.User;
import bd.bloodbangladesh.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class DonorService {

    private final UserRepository users;
    private final DonorProfileRepository profiles;

    public DonorService(UserRepository users, DonorProfileRepository profiles) {
        this.users = users;
        this.profiles = profiles;
    }

    @Transactional(readOnly = true)
    public MeResponse me(UUID userId) {
        User u = findUser(userId);
        DonorProfile p = profiles.findById(userId).orElse(null);
        return toMe(u, p);
    }

    @Transactional
    public DonorProfileResponse saveProfile(UUID userId, DonorProfileRequest req) {
        if (req.lastDonationDate() != null && req.lastDonationDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Last donation date cannot be in the future");
        }
        User u = findUser(userId);
        DonorProfile p = profiles.findById(userId).orElseGet(() -> {
            DonorProfile np = new DonorProfile();
            np.setUser(u);
            return np;
        });
        p.setBloodGroup(req.bloodGroup());
        p.setDivisionId(req.divisionId());
        p.setDistrictId(req.districtId());
        p.setUpazilaId(req.upazilaId());
        p.setAddressDetail(req.addressDetail());
        p.setLastDonationDate(req.lastDonationDate());
        return toResponse(profiles.save(p));
    }

    @Transactional
    public DonorProfileResponse setInterest(UUID userId, boolean interested) {
        DonorProfile p = profiles.findById(userId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Create your donor profile first"));
        p.setInterested(interested);
        return toResponse(profiles.save(p));
    }

    private User findUser(UUID id) {
        return users.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private MeResponse toMe(User u, DonorProfile p) {
        return new MeResponse(u.getId().toString(), u.getFullName(), u.getEmail(), u.getPhone(),
                u.getRole(), p == null ? null : toResponse(p));
    }

    static boolean isEligible(LocalDate last) {
        return last == null || !last.plusDays(90).isAfter(LocalDate.now());
    }

    private DonorProfileResponse toResponse(DonorProfile p) {
        return new DonorProfileResponse(p.getBloodGroup(), p.getDivisionId(), p.getDistrictId(),
                p.getUpazilaId(), p.getAddressDetail(), p.isInterested(), p.isVerifiedByAdmin(),
                p.getLastDonationDate(), p.getTotalDonations(), isEligible(p.getLastDonationDate()));
    }
}
