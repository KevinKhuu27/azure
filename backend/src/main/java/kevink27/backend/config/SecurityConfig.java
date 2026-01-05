package kevink27.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults()) // enable CORS using default configuration or your CorsConfigurationSource bean
            .csrf(csrf -> csrf.disable()) // disable CSRF for simplicity in dev
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll() // allow all requests for now
            );

        return http.build();
    }
}