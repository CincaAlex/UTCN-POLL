package security;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class MailService {

    private final JavaMailSender mailSender;
    private final Random random = new Random();

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendMail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public int sendVerificationCode(String to) {
        int code = 100000 + random.nextInt(900000); // cod 6 cifre
        String subject = "Cod de verificare UTCN Poll";
        String text = "Codul tau de verificare este: " + code;
        sendMail(to, subject, text);
        return code;
    }
}