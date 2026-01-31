package service;

import models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repository.PollRepository;
import repository.UserBetRepository;
import repository.UserRepository;

import javax.xml.transform.Result;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PollService {

    private final PollRepository pollRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserBetRepository userBetRepository;

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

        UserBet userBet = new UserBet(user.getId(), selectedOption.getId(), betAmount);
        userBetRepository.save(userBet);

        user.decreasePoints(betAmount);
        userRepository.save(user);

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

    private int getUserBetAmount(int voteId, int userId) {

        List<UserBet> bets = userBetRepository.findByVoteId(voteId);

        int amount = bets.stream()
                .filter(bet -> bet.getUserId() == userId)
                .mapToInt(UserBet::getBetAmount)
                .findFirst()
                .orElse(0);
        return amount;
    }

    public ResultError resolvePoll(int pollId, int winningOptionId) {

        Optional<Poll> pollOpt = pollRepository.findById(pollId);
        if (pollOpt.isEmpty()) {
            System.err.println("[RESOLVE] Poll not found!");
            return new ResultError(false, "Poll not found");
        }

        Poll poll = pollOpt.get();

        if (!poll.isExpired()) {
            System.err.println("[RESOLVE] Poll is still active!");
            return new ResultError(false, "Poll is still active");
        }

        Vote winningOption = poll.getVoteOptionById(winningOptionId);
        if (winningOption == null) {
            System.err.println("[RESOLVE] Invalid winning option!");
            return new ResultError(false, "Invalid winning option");
        }

        int winnerPool = winningOption.getTotalBets();
        int loserPool = 0;

        for (Vote option : poll.getOptions()) {
            if (option.getId() != winningOptionId) {
                loserPool += option.getTotalBets();
            }
        }

        if (loserPool == 0) {

            for (Integer userId : winningOption.getListUsers()) {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    int userBet = getUserBetAmount(winningOption.getId(), userId);
                    user.addPoints(userBet);
                    userRepository.save(user);
                } else {
                    System.err.println("[RESOLVE] User " + userId + " not found!");
                }
            }

            poll.setResolved(true);
            pollRepository.save(poll);

            return new ResultError(true, "Poll resolved - no losers, bets returned");
        }

        if (winnerPool > 0) {

            for (Integer userId : winningOption.getListUsers()) {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    int userBet = getUserBetAmount(winningOption.getId(), userId);

                    double userPercentage = (double) userBet / winnerPool;

                    int winnings = (int) Math.round(userBet + (userPercentage * loserPool));

                    user.addPoints(winnings);
                    userRepository.save(user);

                } else {
                    System.err.println("[RESOLVE] Winner user " + userId + " not found!");
                }
            }
        }

        poll.setWinningOptionId(winningOptionId);
        poll.setResolved(true);
        pollRepository.save(poll);

        return new ResultError(true, "Poll resolved successfully. Winners rewarded!");
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
