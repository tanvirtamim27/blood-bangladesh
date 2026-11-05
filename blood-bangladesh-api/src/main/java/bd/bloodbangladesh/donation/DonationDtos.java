package bd.bloodbangladesh.donation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public class DonationDtos {

    public record AddDonationRequest(
            @NotNull LocalDate donationDate,
            @Size(max = 160) String hospitalName,
            @Size(max = 500) String notes) {}

    public record DonationItem(String id, String donationDate, String hospitalName, String notes) {}

    public record BadgeItem(String code, String nameEn, String nameBn,
                            int minDonations, String icon, boolean earned) {}

    public record Overview(boolean hasProfile, int total,
                           List<DonationItem> items, List<BadgeItem> badges) {}

    public record Ok(boolean ok) {}
}