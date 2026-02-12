package kevink27.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "assignments")
public class Assignment {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignmentID", nullable = false)
    private Integer assignmentID;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "userID",
        referencedColumnName = "userID",
        nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "courseID",
        referencedColumnName = "courseID",
        nullable = false
    )
    private Course course;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private float grade;

    @Column(nullable = false)
    private int weight;

    public Assignment() {}

    public Assignment(Integer assignmentID, User user, Course course, String description, float grade, int weight) {
        this.assignmentID = assignmentID;
        this.user = user;
        this.course = course;
        this.description = description;
        this.grade = grade;
        this.weight = weight;
    }
}
