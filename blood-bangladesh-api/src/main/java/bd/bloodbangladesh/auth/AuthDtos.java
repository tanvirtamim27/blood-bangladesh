package bd.bloodbangladesh.auth;

import jakarta.validation.constraints.*;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @Pattern(regexp = "^(\\+8801|01)[3-9]\\d{8}$", message = "Invalid BD mobile number") String phone,
            @NotBlank @Size(min = 8, max = 72) String password) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {}

    public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds,
                               String fullName, String role) {}

    // সার্ভারের ভেতরে ব্যবহার: JSON বডি + কুকিতে যাবে এমন refresh token
    public record Session(AuthResponse body, String refreshToken) {}

    public record ForgotRequest(@NotBlank @Email String email) {}

    public record ResetRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 8, max = 72) String password) {}
}