package bd.bloodbangladesh.blog;

import bd.bloodbangladesh.blog.BlogDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BlogService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private static final String DETAIL = """
            SELECT id::text AS id, slug, title_en, title_bn, summary_en, summary_bn,
                   content, content_bn, published, created_at
            FROM blog_posts
            """;

    private static final RowMapper<PostDetail> DETAIL_MAPPER = (rs, i) -> new PostDetail(
            rs.getString("id"), rs.getString("slug"),
            rs.getString("title_en"), rs.getString("title_bn"),
            rs.getString("summary_en"), rs.getString("summary_bn"),
            rs.getString("content"), rs.getString("content_bn"),
            rs.getBoolean("published"),
            rs.getObject("created_at", OffsetDateTime.class).toString());

    private final JdbcClient jdbc;

    public BlogService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<PostSummary> listPublished() {
        return jdbc.sql("""
                SELECT id::text AS id, slug, title_en, title_bn, summary_en, summary_bn, created_at
                FROM blog_posts WHERE published = TRUE
                ORDER BY created_at DESC LIMIT 100
                """)
                .query((rs, i) -> new PostSummary(
                        rs.getString("id"), rs.getString("slug"),
                        rs.getString("title_en"), rs.getString("title_bn"),
                        rs.getString("summary_en"), rs.getString("summary_bn"),
                        rs.getObject("created_at", OffsetDateTime.class).toString()))
                .list();
    }

    public PostDetail getPublished(String slug) {
        return jdbc.sql(DETAIL + " WHERE slug = :s AND published = TRUE")
                .param("s", slug)
                .query(DETAIL_MAPPER).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public List<PostDetail> adminList() {
        return jdbc.sql(DETAIL + " ORDER BY created_at DESC LIMIT 200")
                .query(DETAIL_MAPPER).list();
    }

    public PostDetail create(UUID authorId, PostRequest req) {
        String slug = uniqueSlug(req.slug() == null || req.slug().isBlank() ? req.titleEn() : req.slug());
        String id = jdbc.sql("""
                INSERT INTO blog_posts
                  (slug, title_en, title_bn, summary_en, summary_bn, content, content_bn, author_id, published)
                VALUES (:slug, :te, :tb, :se, :sb, :ce, :cb, CAST(:a AS uuid), :pub)
                RETURNING id::text
                """)
                .param("slug", slug)
                .param("te", req.titleEn().trim())
                .param("tb", blankToNull(req.titleBn()))
                .param("se", blankToNull(req.summaryEn()))
                .param("sb", blankToNull(req.summaryBn()))
                .param("ce", req.contentEn().trim())
                .param("cb", blankToNull(req.contentBn()))
                .param("a", authorId.toString())
                .param("pub", req.published())
                .query(String.class).single();
        return byId(id);
    }

    public PostDetail update(String id, PostRequest req) {
        String pid = parseId(id);
        PostDetail current = byId(pid);
        String slug = current.slug();
        if (req.slug() != null && !req.slug().isBlank()) {
            String wanted = slugify(req.slug());
            if (!wanted.equals(current.slug())) {
                Long taken = jdbc.sql("SELECT count(*) FROM blog_posts WHERE slug = :s AND id <> CAST(:id AS uuid)")
                        .param("s", wanted).param("id", pid).query(Long.class).single();
                if (taken > 0) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already used");
                }
                slug = wanted;
            }
        }
        jdbc.sql("""
                UPDATE blog_posts
                SET slug = :slug, title_en = :te, title_bn = :tb, summary_en = :se, summary_bn = :sb,
                    content = :ce, content_bn = :cb, published = :pub
                WHERE id = CAST(:id AS uuid)
                """)
                .param("slug", slug)
                .param("te", req.titleEn().trim())
                .param("tb", blankToNull(req.titleBn()))
                .param("se", blankToNull(req.summaryEn()))
                .param("sb", blankToNull(req.summaryBn()))
                .param("ce", req.contentEn().trim())
                .param("cb", blankToNull(req.contentBn()))
                .param("pub", req.published())
                .param("id", pid)
                .update();
        return byId(pid);
    }

    public Ok delete(String id) {
        int rows = jdbc.sql("DELETE FROM blog_posts WHERE id = CAST(:id AS uuid)")
                .param("id", parseId(id)).update();
        if (rows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        return new Ok(true);
    }

    private PostDetail byId(String id) {
        return jdbc.sql(DETAIL + " WHERE id = CAST(:id AS uuid)")
                .param("id", id)
                .query(DETAIL_MAPPER).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private String uniqueSlug(String source) {
        String base = slugify(source);
        String slug = base;
        while (jdbc.sql("SELECT count(*) FROM blog_posts WHERE slug = :s")
                .param("s", slug).query(Long.class).single() > 0) {
            slug = base + "-" + (1000 + RANDOM.nextInt(9000));
        }
        return slug;
    }

    private String slugify(String s) {
        String out = s.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        if (out.length() > 120) out = out.substring(0, 120).replaceAll("-+$", "");
        return out.isEmpty() ? "post" : out;
    }

    private String parseId(String id) {
        try {
            return UUID.fromString(id).toString();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
