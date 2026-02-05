package kevink27.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "semesters")
public class Semester {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "semesterID", nullable = false)
    private Integer semesterID;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "userID",
        referencedColumnName = "userID",
        nullable = false
    )
    private User user;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private float grade;

    public Semester() {}

    public Semester(Integer semesterID, User user, String semester, float grade) {
        this.semesterID = semesterID;
        this.user = user;
        this.semester = semester;
        this.grade = grade;
    }
}
