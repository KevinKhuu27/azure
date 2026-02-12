package kevink27.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import kevink27.backend.model.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
  @Query("select a from Assignment a where a.user.id = :userID order by a.assignmentID desc")
  List<Assignment> findRecentByUserId(@Param("userID") Integer userID);
  
  @Query("select a from Assignment a where a.user.id = :userID and a.course.id = :courseID order by a.assignmentID desc")
  List<Assignment> findByCourseIdAndUserId(@Param("courseID") Integer courseID, @Param("userID") Integer userID);
  
  @Modifying
  @Transactional
  @Query("DELETE FROM Assignment a WHERE a.course.courseID = :courseID")
  void deleteByCourseId(@Param("courseID") Integer courseID);
}

