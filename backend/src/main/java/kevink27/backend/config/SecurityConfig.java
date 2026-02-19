package kevink27.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Make Spring Security use the CorsConfigurationSource bean
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable()) // dev only for JSON + sessions; add proper CSRF in prod
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(authz -> authz
                // Allow preflight (OPTIONS) to pass
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Allow all requests - we'll handle auth manually in each controller
                .anyRequest().permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/controller/logout")     // Your frontend should POST to /controller/logout
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessUrl("http://localhost:5173/login") // or your frontend login route
            );

        return http.build();
    }
}