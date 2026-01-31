package repository;

import models.UserBet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserBetRepository extends JpaRepository<UserBet, Integer> {
    List<UserBet> findByVoteId(int voteId);
    List<UserBet> findByUserId(int userId);
}