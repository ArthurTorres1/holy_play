package com.holyplay.infrastructure.user;

import com.holyplay.domain.user.Role;
import com.holyplay.domain.user.User;
import com.holyplay.domain.user.UserRepository;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class UserJdbcRepository implements UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<User> USER_MAPPER = new RowMapper<>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            Long id = rs.getLong("id");
            String name = rs.getString("name");
            String email = rs.getString("email");
            String password = rs.getString("password");
            Role role = Role.fromString(rs.getString("role"));
            boolean active = rs.getBoolean("active");
            LocalDateTime createdAt = rs.getTimestamp("created_at").toLocalDateTime();
            return new User(id, name, email, password, role, active, createdAt);
        }
    };

    @Override
    public User save(User user) {
        String sql = "INSERT INTO public.users (name, email, password, role, active, created_at) VALUES (?, ?, ?, ?, ?, NOW()) RETURNING id, created_at";
        
        try {
            return jdbcTemplate.queryForObject(sql, 
                (rs, rowNum) -> {
                    user.setId(rs.getLong("id"));
                    user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    return user;
                },
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getRole().getValue(),
                user.isActive()
            );
        } catch (Exception e) {
            System.err.println("❌ ERRO ao salvar usuário: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao salvar usuário: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<User> findById(Long id) {
        String sql = "SELECT id, name, email, password, role, active, created_at FROM public.users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, USER_MAPPER, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, name, email, password, role, active, created_at FROM public.users WHERE email = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, USER_MAPPER, email);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<User> findAll() {
        String sql = "SELECT id, name, email, password, role, active, created_at FROM public.users ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, USER_MAPPER);
    }

    @Override
    public List<User> findByRole(Role role) {
        String sql = "SELECT id, name, email, password, role, active, created_at FROM public.users WHERE role = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, USER_MAPPER, role.getValue());
    }

    @Override
    public List<User> findByActive(boolean active) {
        String sql = "SELECT id, name, email, password, role, active, created_at FROM public.users WHERE active = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, USER_MAPPER, active);
    }

    @Override
    public User update(User user) {
        String sql = "UPDATE public.users SET name = ?, email = ?, password = ?, role = ?, active = ? WHERE id = ?";
        
        int rowsAffected = jdbcTemplate.update(sql, 
            user.getName(), 
            user.getEmail(), 
            user.getPassword(), 
            user.getRole().getValue(), 
            user.isActive(), 
            user.getId()
        );
        
        if (rowsAffected == 0) {
            throw new RuntimeException("Usuário não encontrado para atualização: " + user.getId());
        }
        
        return user;
    }

    @Override
    public void deleteById(Long id) {
        String sql = "DELETE FROM public.users WHERE id = ?";
        int rowsAffected = jdbcTemplate.update(sql, id);
        
        if (rowsAffected == 0) {
            throw new RuntimeException("Usuário não encontrado para exclusão: " + id);
        }
    }

    @Override
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM public.users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }
}
