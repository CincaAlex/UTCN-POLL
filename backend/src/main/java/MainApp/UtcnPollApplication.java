package MainApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "repository")
@EntityScan(basePackages = "models")
@ComponentScan(basePackages = {"controller", "service", "repository", "models", "security", "utils"})
public class UtcnPollApplication {
    public static void main(String[] args) {
        SpringApplication.run(UtcnPollApplication.class, args);
    }
}
