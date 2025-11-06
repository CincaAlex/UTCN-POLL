package service;

import models.Poll;
import models.User;
import models.ResultError;
import models.Vote;
import org.springframework.stereotype.Service;
import repository.PollRepository;

import javax.xml.transform.Result;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PollService {

    private final PollRepository pollRepository;

    public PollService(PollRepository pollRepository){
        this.pollRepository = pollRepository;
    }

    public ResultError createPoll(Poll poll, User user){

        if(poll.getTitle() == null || poll.getTitle().isEmpty()){
            return new ResultError(false, "Question cannot be empty");
        }

        poll.setCreatorId(user.getId());
        pollRepository.save(poll);

        return new ResultError(true, "");
    }

    public List<Poll> getActivePolls(){
        LocalDateTime now = LocalDateTime.now();
        return pollRepository.findByEndDateAfter(now);
    }

    public Optional<Poll> getPollById(int pollId){
        return pollRepository.findById(pollId);
    }

    public ResultError vote(int pollId, User user, int optionId, int betAmount) {
        Poll poll = pollRepository.findById(pollId).orElse(null);
        if (poll == null) {
            return new ResultError(false, "Poll not found");
        }

        if (poll.isExpired()) {
            return new ResultError(false, "Poll is closed");
        }

        if (betAmount <= 0) {
            return new ResultError(false, "Invalid bet amount");
        }

        if (user.getPoints() < betAmount) {
            return new ResultError(false, "Not enough points");
        }

        Vote selectedOption = poll.getOptions()
                .stream()
                .filter(opt -> opt.getId() == optionId)
                .findFirst()
                .orElse(null);

        if (selectedOption == null) {
            return new ResultError(false, "Option not found");
        }

        selectedOption.addVote(user.getId(), betAmount);
        user.decreasePoints(betAmount);

        pollRepository.save(poll);

        return new ResultError(true, "Vote successfully registered");
    }

}
