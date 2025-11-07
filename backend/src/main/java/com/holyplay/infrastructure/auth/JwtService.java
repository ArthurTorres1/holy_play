package com.holyplay.infrastructure.auth;

import com.holyplay.domain.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final String secretKey;
    private final long expirationTimeInHours;

    public JwtService(
            @Value("${jwt.secret:holyplay-super-secret-key-that-should-be-changed-in-production}") String secretKey,
            @Value("${jwt.expiration-hours:24}") long expirationTimeInHours
    ) {
        this.secretKey = secretKey;
        this.expirationTimeInHours = expirationTimeInHours;
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("name", user.getName());
        claims.put("role", user.getRole().getValue());
        claims.put("active", user.isActive());

        Instant now = Instant.now();
        Instant expiration = now.plus(expirationTimeInHours, ChronoUnit.HOURS);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return !isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractClaims(token);
            return isTokenExpired(claims);
        } catch (Exception e) {
            return true;
        }
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public long getExpirationTimeInSeconds() {
        return expirationTimeInHours * 3600;
    }
}
