package com.smruti.codemate.controller;

import com.smruti.codemate.model.Problem;
import com.smruti.codemate.repository.ProblemRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemRepository problemRepository;

    public ProblemController(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    @PostMapping
    public Problem addProblem(@RequestBody Problem problem) {
        return problemRepository.save(problem);
    }

    @GetMapping
    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    @GetMapping("/{id}")
    public Problem getProblemById(@PathVariable Long id) {
        return problemRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Problem updateProblem(
            @PathVariable Long id,
            @RequestBody Problem updatedProblem) {

        return problemRepository.findById(id)
                .map(problem -> {
                    problem.setTitle(updatedProblem.getTitle());
                    problem.setCategory(updatedProblem.getCategory());
                    problem.setTopic(updatedProblem.getTopic());
                    problem.setDifficulty(updatedProblem.getDifficulty());
                    problem.setPlatform(updatedProblem.getPlatform());
                    problem.setDateSolved(updatedProblem.getDateSolved());

                    return problemRepository.save(problem);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteProblem(@PathVariable Long id) {
        problemRepository.deleteById(id);
    }
}