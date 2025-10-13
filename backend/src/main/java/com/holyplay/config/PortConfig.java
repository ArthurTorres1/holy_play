package com.holyplay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class PortConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
    
    @Value("${SERVER_PORT:7695}")
    private int serverPort;
    
    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        factory.setPort(serverPort);
        System.out.println("🚀 Servidor configurado para porta: " + serverPort);
    }
}
