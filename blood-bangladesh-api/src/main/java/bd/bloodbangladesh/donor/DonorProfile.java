package bd.bloodbangladesh.donor;

import bd.bloodbangladesh.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "donor_profiles")
@Getter @Setter @NoArgsConstructor
public class DonorProfile {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "blood_group", nullable = false)
    private String bloodGroup;

    @Column(name = "division_id")
    private Integer divisionId;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "upazila_id")
    private Integer upazilaId;

    @Column(name = "address_detail")
    private String addressDetail;

    @Column(nullable = false)
    private boolean interested = true;

    @Column(name = "verified_by_admin", nullable = false)
    private boolean verifiedByAdmin = false;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(name = "total_donations", nullable = false)
    private int totalDonations = 0;
}