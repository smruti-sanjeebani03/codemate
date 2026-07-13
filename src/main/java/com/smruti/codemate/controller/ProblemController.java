package com.smruti.codemate.controller;

import com.smruti.codemate.model.Problem;
import com.smruti.codemate.repository.ProblemRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemRepository problemRepository;

    // Constructor Injection
    public ProblemController(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    // Create a new problem
    @PostMapping
    public Problem createProblem(@RequestBody Problem problem) {

        // If user doesn't select a date,
        // automatically use today's date.
        if (problem.getDateSolved() == null) {
            problem.setDateSolved(LocalDate.now());
        }

        return problemRepository.save(problem);
    }

    // Get all problems
    @GetMapping
    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    // Get problem by ID
    @GetMapping("/{id}")
    public Problem getProblemById(@PathVariable String id) {
        return problemRepository.findById(id).orElse(null);
    }

    // Update a problem
    @PutMapping("/{id}")
    public Problem updateProblem(@PathVariable String id,
                                 @RequestBody Problem updatedProblem) {

        return problemRepository.findById(id)
                .map(problem -> {

                    problem.setTitle(updatedProblem.getTitle());
                    problem.setCategory(updatedProblem.getCategory());
                    problem.setTopic(updatedProblem.getTopic());
                    problem.setDifficulty(updatedProblem.getDifficulty());
                    problem.setPlatform(updatedProblem.getPlatform());
                    problem.setProblemLink(updatedProblem.getProblemLink());
                    problem.setLanguageUsed(updatedProblem.getLanguageUsed());
                    problem.setDateSolved(updatedProblem.getDateSolved());

                    return problemRepository.save(problem);

                }).orElse(null);
    }

    // Delete a problem
    @DeleteMapping("/{id}")
    public void deleteProblem(@PathVariable String id) {
        problemRepository.deleteById(id);
    }
}