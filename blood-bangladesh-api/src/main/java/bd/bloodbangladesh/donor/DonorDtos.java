
package bd.bloodbangladesh.donor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public class DonorDtos {

    public record DonorProfileRequest(
            @NotBlank
            @Pattern(regexp = "^(A|B|AB|O)_(POS|NEG)$", message = "Invalid blood group")
            String bloodGroup,
            Integer divisionId,
            Integer districtId,
            Integer upazilaId,
            String addressDetail,
            LocalDate lastDonationDate) {}

    public record InterestRequest(boolean interested) {}

    public record DonorProfileResponse(
            String bloodGroup, Integer divisionId, Integer districtId, Integer upazilaId,
            String addressDetail, boolean interested, boolean verifiedByAdmin,
            LocalDate lastDonationDate, int totalDonations, boolean eligible) {}

    public record MeResponse(
            String id, String fullName, String email, String phone, String role,
            DonorProfileResponse donorProfile) {}
}