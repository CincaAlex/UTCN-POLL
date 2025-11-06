package repository;

import models.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface AchievementRepository extends JpaRepository<Achievement, Integer> {
}
