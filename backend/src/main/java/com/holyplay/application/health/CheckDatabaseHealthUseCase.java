package com.holyplay.application.health;

import com.holyplay.domain.health.DatabaseProbe;
import org.springframework.stereotype.Service;

/**
 * Caso de uso de verificação de saúde do banco (DDD - Application Service).
 * Princípios SOLID: Depende da abstração (DatabaseProbe), não de implementação.
 */
@Service
public class CheckDatabaseHealthUseCase {

    private final DatabaseProbe databaseProbe;

    public CheckDatabaseHealthUseCase(DatabaseProbe databaseProbe) {
        this.databaseProbe = databaseProbe;
    }

    public boolean execute() {
        return databaseProbe.isAlive();
    }
}
