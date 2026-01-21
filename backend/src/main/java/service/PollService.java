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
import java.util.Map;
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

        poll.setCreator(user);
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

    public ResultError deletePoll(int pollId){
        Poll poll = pollRepository.findById(pollId).orElse(null);
        if (poll == null) {
            return new ResultError(false, "Poll not found");
        }

        pollRepository.delete(poll);

        return new ResultError(true, "");
    }

    public ResultError updatePoll(int pollId, Poll updatedPoll, User user) {
        Optional<Poll> existingPollOpt = pollRepository.findById(pollId);
        if (existingPollOpt.isEmpty()) return new ResultError(false, "Poll not found");

        Poll existingPoll = existingPollOpt.get();
        if (existingPoll.isExpired()) return new ResultError(false, "Poll already closed");
        if (existingPoll.getCreatorId() != user.getId()) return new ResultError(false, "Unauthorized");

        existingPoll.setTitle(updatedPoll.getTitle());
        existingPoll.setOptions(updatedPoll.getOptions());
        existingPoll.setEndDate(updatedPoll.getEndDate());
        pollRepository.save(existingPoll);

        return new ResultError(true, "Poll updated successfully");
    }

    public Optional<Poll> getVotesForPoll(int pollId) {
        return pollRepository.findById(pollId);
    }

    public Map<String, Double> getResults(int pollId) {
        Optional<Poll> pollOpt = pollRepository.findById(pollId);
        if (pollOpt.isEmpty()) return Map.of();

        Poll poll = pollOpt.get();
        return poll.calculateResults();
    }

    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }
}
