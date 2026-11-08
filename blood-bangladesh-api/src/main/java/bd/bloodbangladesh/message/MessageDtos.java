package bd.bloodbangladesh.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MessageDtos {

    public record MessageRequest(@NotBlank @Size(max = 500) String body) {}

    public record Ok(boolean ok) {}
}
