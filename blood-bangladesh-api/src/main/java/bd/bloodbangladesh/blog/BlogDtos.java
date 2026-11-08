package bd.bloodbangladesh.blog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BlogDtos {

    public record PostSummary(String id, String slug, String titleEn, String titleBn,
                              String summaryEn, String summaryBn, String createdAt) {}

    public record PostDetail(String id, String slug, String titleEn, String titleBn,
                             String summaryEn, String summaryBn,
                             String contentEn, String contentBn,
                             boolean published, String createdAt) {}

    public record PostRequest(
            @NotBlank @Size(max = 200) String titleEn,
            @Size(max = 200) String titleBn,
            @Size(max = 300) String summaryEn,
            @Size(max = 300) String summaryBn,
            @NotBlank @Size(max = 20000) String contentEn,
            @Size(max = 20000) String contentBn,
            @Size(max = 160) String slug,
            boolean published) {}

    public record Ok(boolean ok) {}
}
