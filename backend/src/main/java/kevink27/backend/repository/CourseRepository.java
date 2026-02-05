package kevink27.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kevink27.backend.model.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
  @Query("select a from Course a where a.user.id = :userID order by a.courseID desc")
  List<Course> findRecentByUserId(@Param("userID") Integer userID);
}

