package bd.bloodbangladesh.notification;

public class NotificationDtos {

    public record NotificationItem(
            String id, String type,
            String otherName, String otherPhone,
            String message, String requestId,
            String patientName, String bloodGroup, String hospitalName,
            boolean confirmed, boolean read, String createdAt) {}

    public record CountResponse(long count) {}

    public record Ok(boolean ok) {}
}