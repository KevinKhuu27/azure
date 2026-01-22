package kevink27.backend.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import kevink27.backend.model.Assignment;
import kevink27.backend.repository.AssignmentRepository;
import kevink27.backend.repository.UserRepository;

@RestController
@RequestMapping("/grade-calculator")
public class GradeCalculatorController {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public GradeCalculatorController(AssignmentRepository assignmentRepository, UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/get-assignments")
    public ResponseEntity<?> getAssignments(HttpServletRequest req) {
        // Check authentication
        var httpSession = req.getSession(false);        
        if (httpSession == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        Integer userID = (Integer) httpSession.getAttribute("userID");
        if (userID == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        
        var list = assignmentRepository.findRecentByUserId(userID);
        var rows = list.stream().map(a -> new RowDto(
            a.getAssignmentID(),
            a.getDescription(),
            a.getGrade(),
            a.getWeight()
        )).toList();

        return ResponseEntity.ok(rows);
    }

    @PutMapping("/save-assignments")
    @Transactional
    public ResponseEntity<?> saveAssignments(@RequestBody RowsDto request, HttpServletRequest req) {
        // Check authentication
        var httpSession = req.getSession(false);
        if (httpSession == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        Integer userID = (Integer) httpSession.getAttribute("userID");
        if (userID == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        var user = userRepository.findById(userID.longValue())
            .orElseThrow(() -> new RuntimeException("User not found"));

        var incoming = request.rows();
        if (incoming == null || incoming.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "rows must not be empty"));
        }
            
        // Fetch existing assignments for this user
        var existing = assignmentRepository.findRecentByUserId(userID);
        var existingById = existing.stream()
            .collect(java.util.stream.Collectors.toMap(Assignment::getAssignmentID, a -> a));

        // Track ids that remain after update to detect deletions
        var seenIds = new java.util.HashSet<Integer>();

        // Upsert
        for (var r : incoming) {
            Integer id = r.assignmentID();
            if (id != null && existingById.containsKey(id)) {
                // update
                var entity = existingById.get(id);
                entity.setDescription(r.description());
                entity.setGrade(r.grade());
                entity.setWeight(r.weight());
                seenIds.add(id);
            } else {
                // insert
                var entity = new Assignment(null, user, r.description(), r.grade(), r.weight());
                entity = assignmentRepository.save(entity);
                seenIds.add(entity.getAssignmentID());
            }
        }

        // Optional: delete rows removed in UI (enable if you want a true "sync")
        for (var a : existing) {
            if (!seenIds.contains(a.getAssignmentID())) {
                assignmentRepository.delete(a);
            }
        }

        return ResponseEntity.ok(Map.of(
            "updated", seenIds.size()
        ));
    }

    public record RowsDto(java.util.List<RowDto> rows) {}
    public record RowDto(Integer assignmentID, String description, Float grade, Integer weight) {}

}
