package com.holyplay.infrastructure.video;

import com.holyplay.domain.video.VideoCategory;
import com.holyplay.domain.video.VideoCategoryAssignment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class VideoCategoryJdbcRepository {

    private final JdbcTemplate jdbcTemplate;

    public VideoCategoryJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<VideoCategory> CATEGORY_MAPPER = new RowMapper<>() {
        @Override
        public VideoCategory mapRow(ResultSet rs, int rowNum) throws SQLException {
            Long id = rs.getLong("id");
            String name = rs.getString("name");
            String slug = rs.getString("slug");
            var ts = rs.getTimestamp("created_at");
            LocalDateTime createdAt = ts != null ? ts.toLocalDateTime() : null;
            return new VideoCategory(id, name, slug, createdAt);
        }
    };

    public List<VideoCategory> findAllCategories() {
        String sql = "SELECT id, name, slug, created_at FROM public.video_category ORDER BY name";
        return jdbcTemplate.query(sql, CATEGORY_MAPPER);
    }

    public Optional<VideoCategory> findCategoryById(Long id) {
        String sql = "SELECT id, name, slug, created_at FROM public.video_category WHERE id = ?";
        var list = jdbcTemplate.query(sql, CATEGORY_MAPPER, id);
        return list.stream().findFirst();
    }

    public Optional<VideoCategory> findCategoryBySlug(String slug) {
        String sql = "SELECT id, name, slug, created_at FROM public.video_category WHERE slug = ?";
        var list = jdbcTemplate.query(sql, CATEGORY_MAPPER, slug);
        return list.stream().findFirst();
    }

    public Optional<VideoCategoryAssignment> findAssignmentByVideoId(String videoId) {
        String sql = "SELECT video_id, category_id, created_at, updated_at FROM public.video_category_assignment WHERE video_id = ?";
        var list = jdbcTemplate.query(sql, (rs, rowNum) -> new VideoCategoryAssignment(
                rs.getString("video_id"),
                rs.getLong("category_id"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        ), videoId);
        return list.stream().findFirst();
    }

    public VideoCategory createCategory(String name, String slug) {
        String sql = "INSERT INTO public.video_category (name, slug, created_at) " +
                "VALUES (?, ?, NOW()) " +
                "RETURNING id, name, slug, created_at";

        return jdbcTemplate.queryForObject(sql, CATEGORY_MAPPER, name, slug);
    }

    public VideoCategoryAssignment upsertAssignment(String videoId, Long categoryId) {
        String sql = "INSERT INTO public.video_category_assignment (video_id, category_id) " +
                "VALUES (?, ?) " +
                "ON CONFLICT (video_id) DO UPDATE SET category_id = EXCLUDED.category_id, updated_at = NOW() " +
                "RETURNING video_id, category_id, created_at, updated_at";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new VideoCategoryAssignment(
                rs.getString("video_id"),
                rs.getLong("category_id"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        ), videoId, categoryId);
    }

    public List<VideoWithCategoryInfo> findAllVideosWithCategories() {
        String sql = """
            SELECT DISTINCT
                COALESCE(vd.video_id, vca.video_id) as video_id,
                vd.description,
                vc.id as category_id,
                vc.name as category_name,
                vc.slug as category_slug
            FROM public.video_category_assignment vca
            FULL OUTER JOIN public.video_description vd ON vca.video_id = vd.video_id
            LEFT JOIN public.video_category vc ON vca.category_id = vc.id
            WHERE COALESCE(vd.video_id, vca.video_id) IS NOT NULL
            ORDER BY COALESCE(vd.video_id, vca.video_id)
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String videoId = rs.getString("video_id");
            String description = rs.getString("description");
            Long categoryId = rs.getObject("category_id", Long.class);
            String categoryName = rs.getString("category_name");
            String categorySlug = rs.getString("category_slug");
            
            return new VideoWithCategoryInfo(videoId, description, categoryId, categoryName, categorySlug);
        });
    }

    public static class VideoWithCategoryInfo {
        private final String videoId;
        private final String description;
        private final Long categoryId;
        private final String categoryName;
        private final String categorySlug;

        public VideoWithCategoryInfo(String videoId, String description, Long categoryId, String categoryName, String categorySlug) {
            this.videoId = videoId;
            this.description = description;
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.categorySlug = categorySlug;
        }

        public String getVideoId() { return videoId; }
        public String getDescription() { return description; }
        public Long getCategoryId() { return categoryId; }
        public String getCategoryName() { return categoryName; }
        public String getCategorySlug() { return categorySlug; }
    }
}
