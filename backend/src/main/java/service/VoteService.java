package service;

import models.Poll;
import models.ResultError;
import models.User;
import models.Vote;
import org.springframework.stereotype.Service;
import repository.PollRepository;

import java.util.Optional;

@Service
public class VoteService {

    public VoteService() {}
    private PollRepository pollRepository;

    public VoteService(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    public ResultError vote(Poll poll, User user, int optionId, int betAmount) {
        if (poll == null || poll.isExpired()) {
            return new ResultError(false, "Invalid poll");
        }

        if (betAmount <= 0 || user.getPoints() < betAmount) {
            return new ResultError(false, "Invalid bet");
        }

        Optional<Vote> optionOpt = poll.getOptions().stream()
                .filter(opt -> opt.getId() == optionId)
                .findFirst();

        if (optionOpt.isEmpty()) return new ResultError(false, "Invalid option");

        Vote option = optionOpt.get();

        if (option.getListUsers().contains(user.getId())) {
            return new ResultError(false, "You can't vote another user");
        }

        option.addVote(user.getId(), betAmount);
        user.decreasePoints(betAmount);

        pollRepository.save(poll);

        return new ResultError(true, "");
    }
}
