package kevink27.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
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

    // register new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    // login existing user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletRequest request) {
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
        }
        
        User foundUser = userRepository.findByEmailAndPassword(user.getEmail(), user.getPassword());
        if (foundUser == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }

        HttpSession session = request.getSession(true);
        session.setAttribute("userID", foundUser.getUserID());

        return ResponseEntity.ok(Map.of("message", "Login successful"));
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpServletRequest request) {
        // check if a session exists, but don't make a new one if it doesn't
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userID") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }

        Integer userID = (Integer) session.getAttribute("userID");
        return ResponseEntity.ok("Logged in as user " + userID);
    }
}
