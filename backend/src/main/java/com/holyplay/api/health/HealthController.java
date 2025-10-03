package com.holyplay.api.health;

import com.holyplay.application.health.CheckDatabaseHealthUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final CheckDatabaseHealthUseCase checkDatabaseHealthUseCase;

    public HealthController(CheckDatabaseHealthUseCase checkDatabaseHealthUseCase) {
        this.checkDatabaseHealthUseCase = checkDatabaseHealthUseCase;
    }

    @GetMapping("/db")
    public ResponseEntity<String> db() {
        boolean ok = checkDatabaseHealthUseCase.execute();
        return ok ? ResponseEntity.ok("DB OK") : ResponseEntity.status(503).body("DB DOWN");
    }
}
