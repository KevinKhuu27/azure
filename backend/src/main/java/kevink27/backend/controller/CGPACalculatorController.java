package kevink27.backend.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import kevink27.backend.model.Semester;
import kevink27.backend.repository.SemesterRepository;
import kevink27.backend.repository.UserRepository;

@RestController
@RequestMapping("/cgpa-calculator")
public class CGPACalculatorController {

    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;

    public CGPACalculatorController(SemesterRepository semesterRepository, UserRepository userRepository) {
        this.semesterRepository = semesterRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/get-semesters")
    public ResponseEntity<?> getSemesters(HttpServletRequest req) {
        // Check authentication
        var httpSession = req.getSession(false);        
        if (httpSession == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        Integer userID = (Integer) httpSession.getAttribute("userID");
        if (userID == null) {
            return ResponseEntity.status(401).body("Not logged in");
        }
        
        var list = semesterRepository.findRecentByUserId(userID);
        var rows = list.stream().map(a -> new RowDto(
            a.getSemesterID(),
            a.getSemester(),
            a.getGrade()
        )).toList();

        return ResponseEntity.ok(rows);
    }

    @PutMapping("/save-semesters")
    @Transactional
    public ResponseEntity<?> saveSemesters(@RequestBody RowsDto request, HttpServletRequest req) {
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
        var existing = semesterRepository.findRecentByUserId(userID);
        var existingById = existing.stream()
            .collect(java.util.stream.Collectors.toMap(Semester::getSemesterID, a -> a));

        // Track ids that remain after update to detect deletions
        var seenIds = new java.util.HashSet<Integer>();

        // Upsert
        for (var r : incoming) {
            Integer id = r.semesterID();
            if (id != null && existingById.containsKey(id)) {
                // update
                var entity = existingById.get(id);
                entity.setSemester(r.semester());
                entity.setGrade(r.grade());
                seenIds.add(id);
            } else {
                // insert
                var entity = new Semester(null, user, r.semester(), r.grade());
                entity = semesterRepository.save(entity);
                seenIds.add(entity.getSemesterID());
            }
        }

        // Optional: delete rows removed in UI (enable if you want a true "sync")
        for (var a : existing) {
            if (!seenIds.contains(a.getSemesterID())) {
                semesterRepository.delete(a);
            }
        }

        return ResponseEntity.ok(Map.of(
            "updated", seenIds.size()
        ));
    }

    public record RowsDto(java.util.List<RowDto> rows) {}
    public record RowDto(Integer semesterID, String semester, Float grade) {}

}
