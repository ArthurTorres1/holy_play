package com.holyplay.config;

import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class ServerConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
    
    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        String port = System.getenv("SERVER_PORT");
        if (port != null && !port.trim().isEmpty()) {
            try {
                factory.setPort(Integer.parseInt(port));
                System.out.println("🚀 Configurando porta do servidor para: " + port);
            } catch (NumberFormatException e) {
                System.err.println("❌ Porta inválida no SERVER_PORT: " + port + ", usando padrão 8080");
            }
        }
    }
}
