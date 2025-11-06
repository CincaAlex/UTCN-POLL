package repository;

import models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);
    Optional<User> findById(int id);
    User save(User user);

    //top leaderboard with a 'limit' of users
    @Query("SELECT u FROM User u ORDER BY u.points DESC")
    List<User> findTopByOrderByPointsDesc(int limit);

    @Query("SELECT u FROM User u ORDER BY u.points DESC")
    List<User> findAllByOrderByPointsDesc();

}
