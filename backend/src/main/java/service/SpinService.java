package service;

import models.User;
import org.springframework.stereotype.Service;
import repository.UserRepository;

import java.time.LocalDate;
import java.util.Random;

@Service
public class SpinService {

    private final UserRepository userRepository;
    private final Random random = new Random();

    public SpinService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public int dailySpin(User user) {
        LocalDate today = LocalDate.now();

        if (user.getLastSpinDate() != null && user.getLastSpinDate().isEqual(today)) {
            return -1;
        }

        int points = 5 + random.nextInt(16);
        user.addPoints(points);
        user.setLastSpinDate(today);
        userRepository.save(user);

        return points;
    }
}
