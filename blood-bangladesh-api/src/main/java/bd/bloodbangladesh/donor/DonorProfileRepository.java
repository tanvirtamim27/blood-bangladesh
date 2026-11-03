package bd.bloodbangladesh.donor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, UUID> {
}
