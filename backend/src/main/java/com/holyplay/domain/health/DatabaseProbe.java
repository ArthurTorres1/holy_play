package com.holyplay.domain.health;

/**
 * Porta de domínio para verificar saúde do banco de dados (DDD - Domain -> Port).
 */
public interface DatabaseProbe {
    boolean isAlive();
}
