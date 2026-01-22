package controller;

import models.Poll;
import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import repository.UserRepository;
import service.PollService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/polls")
@CrossOrigin(origins = "*")
public class PollController {

    private final PollService pollService;
    private final UserRepository userRepository;

    public PollController(PollService pollService, UserRepository userRepository) {
        this.pollService = pollService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Poll>> getAllPolls() {
        System.out.println("🗳️ [BACKEND] Fetching all polls");
        List<Poll> polls = pollService.getAllPolls();
        System.out.println("🗳️ [BACKEND] Found " + polls.size() + " polls");
        return ResponseEntity.ok(polls);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Poll>> getActivePolls() {
        return ResponseEntity.ok(pollService.getActivePolls());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getPollById(@PathVariable int id) {
        Optional<Poll> poll = pollService.getPollById(id);
        return poll.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Poll not found"));
    }

    @PostMapping
    public ResponseEntity<?> createPoll(@RequestBody Poll poll, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            String email = auth.getName();
            Optional<User> creatorOpt = userRepository.findByEmail(email);

            if (creatorOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new ResultError(false, "User not found"));
            }

            User creator = creatorOpt.get();

            // Check if user is admin
            if (!"ADMIN".equals(creator.getUserType())) {
                return ResponseEntity.status(403).body(new ResultError(false, "Only admins can create polls"));
            }

            ResultError result = pollService.createPoll(poll, creator);

            if (result.isSuccess()) {
                return ResponseEntity.ok(poll);
            }
            return ResponseEntity.badRequest().body(result);

        } catch (Exception e) {
            System.err.println("Error creating poll: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ResultError(false, "Error creating poll: " + e.getMessage()));
        }
    }

    @PostMapping("/{pollId}/vote")
    public ResponseEntity<?> vote(
            @PathVariable int pollId,
            @RequestBody VoteRequest voteRequest,
            Authentication auth) {

        if (auth == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new ResultError(false, "User not found"));
            }

            User user = userOpt.get();

            ResultError result = pollService.vote(
                    pollId,
                    user,
                    voteRequest.optionId(),
                    voteRequest.betAmount()
            );

            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.badRequest().body(result);

        } catch (Exception e) {
            System.err.println("Error voting: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ResultError(false, "Error voting: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{pollId}")
    public ResponseEntity<?> deletePoll(@PathVariable int pollId, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(new ResultError(false, "Unauthorized"));
        }

        try {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body(new ResultError(false, "User not found"));
            }

            User user = userOpt.get();
            Optional<Poll> pollOpt = pollService.getPollById(pollId);

            if (pollOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new ResultError(false, "Poll not found"));
            }

            Poll poll = pollOpt.get();

            // Check permissions: must be poll creator OR admin
            boolean isCreator = poll.getCreatorId() == user.getId();
            boolean isAdmin = "ADMIN".equals(user.getUserType());

            if (!isCreator && !isAdmin) {
                return ResponseEntity.status(403).body(new ResultError(false, "Forbidden: You don't have permission to delete this poll"));
            }

            ResultError result = pollService.deletePoll(pollId);

            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            }
            return ResponseEntity.badRequest().body(result);

        } catch (Exception e) {
            System.err.println("Error deleting poll: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ResultError(false, "Error deleting poll: " + e.getMessage()));
        }
    }

    @GetMapping("/{pollId}/results")
    public ResponseEntity<Map<String, Double>> getResults(@PathVariable int pollId) {
        Optional<Poll> pollOpt = pollService.getPollById(pollId);
        if (pollOpt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        Map<String, Double> results = pollOpt.get().calculateResults();
        return ResponseEntity.ok(results);
    }

    // DTO for vote request
    public record VoteRequest(int optionId, int betAmount) {}
}