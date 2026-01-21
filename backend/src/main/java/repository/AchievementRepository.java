package repository;

import models.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Integer> {

    // Find only active achievements
    List<Achievement> findByIsActiveTrue();

    // Find active achievement by ID
    Optional<Achievement> findByIdAndIsActiveTrue(int id);

    // Find achievements by type and active status
    List<Achievement> findByTypeAndIsActiveTrue(Achievement.AchievementType type);

    // Find achievements by tier and active status
    List<Achievement> findByTierAndIsActiveTrue(Achievement.BadgeTier tier);

    // Admin methods (no active filter)
    List<Achievement> findByType(Achievement.AchievementType type);
    List<Achievement> findByTier(Achievement.BadgeTier tier);

    // Find achievements by multiple types
    @Query("SELECT a FROM Achievement a WHERE a.type IN :types AND a.isActive = true")
    List<Achievement> findByTypesAndIsActive(@Param("types") List<Achievement.AchievementType> types);

    // Find achievements with points requirement less than or equal to given points
    @Query("SELECT a FROM Achievement a WHERE a.pointsRequired <= :points AND a.isActive = true")
    List<Achievement> findEligibleByPoints(@Param("points") int points);

    // Find achievements by minimum tier (higher or equal rank)
    @Query("SELECT a FROM Achievement a WHERE a.tier IN :tiers AND a.isActive = true")
    List<Achievement> findByTiersAndIsActive(@Param("tiers") List<Achievement.BadgeTier> tiers);

    // Count achievements by type
    @Query("SELECT COUNT(a) FROM Achievement a WHERE a.type = :type AND a.isActive = true")
    long countByTypeAndIsActiveTrue(@Param("type") Achievement.AchievementType type);

    // Find achievements that require specific action count
    @Query("SELECT a FROM Achievement a WHERE a.actionCountRequired <= :count AND a.isActive = true")
    List<Achievement> findEligibleByActionCount(@Param("count") int count);

    // Find achievements by type and minimum tier
    @Query("SELECT a FROM Achievement a WHERE a.type = :type AND a.tier = :tier AND a.isActive = true")
    List<Achievement> findByTypeAndTierAndIsActive(
            @Param("type") Achievement.AchievementType type,
            @Param("tier") Achievement.BadgeTier tier);

    // Check if achievement name exists excluding a specific ID (for updates)
    @Query("SELECT COUNT(a) > 0 FROM Achievement a WHERE a.name = :name AND a.id != :excludeId")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("excludeId") int excludeId);
}