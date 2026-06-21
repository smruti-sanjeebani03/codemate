package com.smruti.codemate.controller; 

import com.smruti.codemate.model.User; 
import com.smruti.codemate.repository.UserRepository; 
import org.springframework.web.bind.annotation.*;
 
import java.util.List;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userRepository.findById(id).orElse(null);
    }

    @GetMapping("/count")
    public long countUsers() {
        return userRepository.count();
    }
}