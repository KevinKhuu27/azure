package kevink27.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kevink27.backend.model.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
  @Query("select a from Assignment a where a.user.id = :userID order by a.assignmentID desc")
  List<Assignment> findRecentByUserId(@Param("userID") Integer userID);
}

