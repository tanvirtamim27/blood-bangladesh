package bd.bloodbangladesh.message;

import bd.bloodbangladesh.message.MessageDtos.MessageRequest;
import bd.bloodbangladesh.message.MessageDtos.Ok;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/donors")
public class MessageController {

    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public Ok send(@AuthenticationPrincipal Jwt jwt, @PathVariable String id,
                   @Valid @RequestBody MessageRequest req) {
        return service.send(UUID.fromString(jwt.getSubject()), id, req.body());
    }
}
