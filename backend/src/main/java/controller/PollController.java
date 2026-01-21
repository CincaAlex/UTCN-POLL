package controller;

import models.Poll;
import models.ResultError;
import models.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.PollService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/polls")
public class PollController {

    public PollController(){}

    private PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    @GetMapping
    public List<Poll> getAllPolls() {
        return pollService.getAllPolls();
    }

    @GetMapping("/active")
    public List<Poll> getActivePolls() {
        return pollService.getActivePolls();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getPollById(@PathVariable int id) {
        Optional<Poll> poll = pollService.getPollById(id);
        return poll.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Poll not found"));
    }

    @PostMapping("/create")
    public ResponseEntity<ResultError> createPoll(@RequestBody Poll poll, @RequestParam int creatorId) {
        User creator = new User(); // TODO: înlocuiește cu fetch din DB
        ResultError result = pollService.createPoll(poll, creator);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{pollId}/vote")
    public ResponseEntity<ResultError> vote(
            @PathVariable int pollId,
            @RequestParam int userId,
            @RequestParam int optionId,
            @RequestParam int betAmount) {

        //obtine user din db
        User user = new User();
        ResultError result = pollService.vote(pollId, user, optionId, betAmount);
        return ResponseEntity.ok(result);
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
}
