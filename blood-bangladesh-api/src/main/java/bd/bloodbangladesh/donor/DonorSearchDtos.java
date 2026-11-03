
package bd.bloodbangladesh.donor;

import java.time.LocalDate;
import java.util.List;

public class DonorSearchDtos {

    public record DonorCard(
            String id, String fullName, String phone, String bloodGroup,
            Integer divisionId, Integer districtId, Integer upazilaId,
            String districtName, String upazilaName,
            LocalDate lastDonationDate, int totalDonations,
            boolean verified, boolean available) {}

    public record SearchResult(List<DonorCard> items, int page, int size,
                               long total, int totalPages) {}
}