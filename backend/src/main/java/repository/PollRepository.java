package repository;

import models.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public interface PollRepository extends JpaRepository<Poll, Integer> {

    List<Poll> findByEndDateAfter(LocalDateTime date);
}
