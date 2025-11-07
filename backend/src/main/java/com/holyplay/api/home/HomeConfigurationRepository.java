package com.holyplay.api.home;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HomeConfigurationRepository extends JpaRepository<HomeConfiguration, String> {
    // Métodos personalizados podem ser adicionados aqui se necessário
}
