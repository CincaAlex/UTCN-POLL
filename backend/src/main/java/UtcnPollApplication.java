import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"controller", "service", "repository", "models", "security", "utils"})
public class UtcnPollApplication {
    public static void main(String[] args) {
        SpringApplication.run(UtcnPollApplication.class, args);
    }
}
