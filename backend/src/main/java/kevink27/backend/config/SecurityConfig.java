package kevink27.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    // ✅ CORS Configuration (REQUIRED for Spring Security)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://wonderful-stone-00103ee0f.4.azurestaticapps.net"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // REQUIRED for session cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Make Spring Security use the CorsConfigurationSource bean
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable()) // dev only for JSON + sessions; add proper CSRF in prod
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .authorizeHttpRequests(auth -> auth
                // Allow preflight (OPTIONS) to pass
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints (adjust as needed)
                .requestMatchers(HttpMethod.POST, "/controller/login", "/controller/register").permitAll()

                // Allow all requests - we'll handle auth manually in each controller
                .anyRequest().permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/controller/logout")     // Your frontend should POST to /controller/logout
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200);
                })
            );

        return http.build();
    }
}