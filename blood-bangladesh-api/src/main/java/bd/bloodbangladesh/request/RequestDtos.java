package bd.bloodbangladesh.request;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class RequestDtos {

    public record CreateRequest(
            @NotBlank @Size(max = 120) String patientName,
            @NotBlank @Pattern(regexp = "^(A|B|AB|O)_(POS|NEG)$", message = "Invalid blood group") String bloodGroup,
            @Min(1) @Max(10) int unitsNeeded,
            @NotBlank @Size(max = 160) String hospitalName,
            Integer districtId,
            Integer upazilaId,
            @NotBlank @Pattern(regexp = "^(\\+8801|01)[3-9]\\d{8}$", message = "Invalid BD mobile number") String contactNumber,
            @NotNull LocalDateTime neededAt,
            @Size(max = 1000) String note,
            boolean urgent) {}

    public record StatusRequest(@NotBlank String status) {}

    public record RequestCard(
            String id, String patientName, String bloodGroup, int unitsNeeded,
            String hospitalName,
            String districtName, String districtNameBn,
            String upazilaName, String upazilaNameBn,
            String contactNumber, String neededAt, String note,
            boolean urgent, String status, String createdAt) {}

    public record IdResponse(String id) {}

    public record Ok(boolean ok) {}
}
