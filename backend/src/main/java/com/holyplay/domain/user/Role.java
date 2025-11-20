package com.holyplay.domain.user;

public enum Role {
    ADMIN("ADMIN"),
    USER("USER"),
    ASSINANTE_ANUAL("ASSINANTE_ANUAL");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Role inválido: " + value);
    }
}
