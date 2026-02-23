package kevink27.backend.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import kevink27.backend.model.Course;
import kevink27.backend.repository.CourseRepository;
import kevink27.backend.repository.UserRepository;
import kevink27.backend.repository.AssignmentRepository;

@RestController
@RequestMapping("/gpa-calculator")
public class GPACalculatorController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;

    public GPACalculatorController(CourseRepository courseRepository, UserRepository userRepository, AssignmentRepository assignmentRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @GetMapping("/get-courses")
    public ResponseEntity<?> getCourses(HttpServletRequest req) {
        // Check authentication
        var httpSession = req.getSession(false);        
        if (httpSession == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        Integer userID = (Integer) httpSession.getAttribute("userID");
        if (userID == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        
        var list = courseRepository.findRecentByUserId(userID);
        var rows = list.stream().map(a -> new RowDto(
            a.getCourseID(),
            a.getCourse(),
            a.getGrade()
        )).toList();

        return ResponseEntity.ok(rows);
    }

    @PutMapping("/save-courses")
    @Transactional
    public ResponseEntity<?> saveCourses(@RequestBody RowsDto request, HttpServletRequest req) {
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
        if (incoming == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "rows must not be empty"));
        }
            
        // Fetch existing assignments for this user
        var existing = courseRepository.findRecentByUserId(userID);
        var existingById = existing.stream()
            .collect(java.util.stream.Collectors.toMap(Course::getCourseID, a -> a));

        // Track ids that remain after update to detect deletions
        var seenIds = new java.util.HashSet<Integer>();

        // Upsert
        for (var r : incoming) {
            Integer id = r.courseID();
            if (id != null && existingById.containsKey(id)) {
                // update
                var entity = existingById.get(id);
                entity.setCourse(r.course());
                entity.setGrade(r.grade());
                seenIds.add(id);
            } else {
                // insert
                var entity = new Course(null, user, r.course(), r.grade());
                entity = courseRepository.save(entity);
                seenIds.add(entity.getCourseID());
            }
        }

        // Optional: delete rows removed in UI (enable if you want a true "sync")
        for (var a : existing) {
            if (!seenIds.contains(a.getCourseID())) {
                // Delete dependent assignments first
                assignmentRepository.deleteByCourseId(a.getCourseID());
                courseRepository.delete(a);
            }
        }

        return ResponseEntity.ok(Map.of(
            "updated", seenIds.size()
        ));
    }

    public record RowsDto(java.util.List<RowDto> rows) {}
    public record RowDto(Integer courseID, String course, Float grade) {}

}
