package kevink27.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "courses")
public class Course {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courseID", nullable = false)
    private Integer courseID;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "userID",
        referencedColumnName = "userID",
        nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(
        name = "semesterID",
        referencedColumnName = "semesterID",
        nullable = true
    )
    private Semester semester;

    @Column(nullable = false)
    private String course;

    @Column(nullable = false)
    private float grade;

    public Course() {}

    public Course(Integer courseID, User user, Semester semester, String course, float grade) {
        this.courseID = courseID;
        this.user = user;
        this.semester = semester;
        this.course = course;
        this.grade = grade;
    }
}
