package com.holyplay.infrastructure.video;

import com.holyplay.domain.video.VideoDescription;
import com.holyplay.domain.video.VideoDescriptionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class VideoDescriptionJdbcRepository implements VideoDescriptionRepository {

    private final JdbcTemplate jdbcTemplate;

    public VideoDescriptionJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<VideoDescription> MAPPER = new RowMapper<>() {
        @Override
        public VideoDescription mapRow(ResultSet rs, int rowNum) throws SQLException {
            Long id = rs.getLong("id");
            String videoId = rs.getString("video_id");
            String description = rs.getString("description");
            LocalDateTime createdAt = rs.getTimestamp("created_at").toLocalDateTime();
            LocalDateTime updatedAt = rs.getTimestamp("updated_at").toLocalDateTime();
            return new VideoDescription(id, videoId, description, createdAt, updatedAt);
        }
    };

    @Override
    public Optional<VideoDescription> findByVideoId(String videoId) {
        var sql = "SELECT id, video_id, description, created_at, updated_at FROM public.video_description WHERE video_id = ?";
        var list = jdbcTemplate.query(sql, MAPPER, videoId);
        return list.stream().findFirst();
    }

    @Override
    public VideoDescription upsert(String videoId, String description) {
        // PostgreSQL upsert
        var sql = "INSERT INTO public.video_description (video_id, description)\n" +
                "VALUES (?, ?)\n" +
                "ON CONFLICT (video_id) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()\n" +
                "RETURNING id, video_id, description, created_at, updated_at";
        return jdbcTemplate.queryForObject(sql, MAPPER, videoId, description);
    }
}
