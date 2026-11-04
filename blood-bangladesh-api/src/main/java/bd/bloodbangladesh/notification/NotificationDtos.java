package bd.bloodbangladesh.notification;

public class NotificationDtos {

    public record NotificationItem(
            String id, String type,
            String responderName, String responderPhone,
            String patientName, String bloodGroup, String hospitalName,
            boolean read, String createdAt) {}

    public record CountResponse(long count) {}

    public record Ok(boolean ok) {}
}
