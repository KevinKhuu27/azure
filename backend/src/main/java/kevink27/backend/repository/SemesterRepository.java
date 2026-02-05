package kevink27.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kevink27.backend.model.Semester;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
  @Query("select a from Semester a where a.user.id = :userID order by a.semesterID desc")
  List<Semester> findRecentByUserId(@Param("userID") Integer userID);
}

