package com.holyplay.infrastructure.health;

import com.holyplay.domain.health.DatabaseProbe;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Adapter de infraestrutura que verifica a disponibilidade do PostgreSQL via JdbcTemplate.
 * (DDD: Infrastructure -> implementa a porta do domínio)
 */
@Component
public class PostgresDatabaseProbe implements DatabaseProbe {

    private final JdbcTemplate jdbcTemplate;

    public PostgresDatabaseProbe(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean isAlive() {
        try {
            Integer one = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return one != null && one == 1;
        } catch (Exception e) {
            return false;
        }
    }
}
