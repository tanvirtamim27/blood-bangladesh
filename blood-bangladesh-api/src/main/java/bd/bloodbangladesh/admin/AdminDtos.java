package bd.bloodbangladesh.admin;

import java.util.List;

public class AdminDtos {

    public record GroupCount(String group, long count) {}

    public record Stats(long users, long donors, long verifiedDonors,
                        long openRequests, long fulfilledRequests, long totalRequests,
                        List<GroupCount> byGroup) {}

    public record AdminUser(String id, String fullName, String email, String phone,
                            String role, boolean enabled, boolean hasProfile,
                            boolean verified, String createdAt) {}

    public record AdminRequest(String id, String patientName, String bloodGroup,
                               String hospitalName, String districtName, String status,
                               boolean urgent, String requesterName, String requesterEmail,
                               String neededAt, String createdAt) {}

    public record EnabledRequest(boolean enabled) {}

    public record VerifiedRequest(boolean verified) {}

    public record AdminRoleRequest(boolean admin) {}

    public record Ok(boolean ok) {}
}