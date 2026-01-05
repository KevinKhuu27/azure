package kevink27.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import kevink27.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmailAndPassword(String email, String password);
}