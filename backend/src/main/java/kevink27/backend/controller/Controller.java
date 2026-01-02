package kevink27.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import kevink27.backend.model.User;
import kevink27.backend.repository.UserRepository;

@RestController
@RequestMapping("/controller")
public class Controller {

    private final UserRepository userRepository;

    @Autowired
    public Controller(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // create new user
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        userRepository.save(user);
        return ResponseEntity.ok("User created successfully");
    }
    //TODO: input validation
}
