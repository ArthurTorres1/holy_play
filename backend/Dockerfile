# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copia pom e resolve dependências em cache
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline

# Copia o restante do código e faz o build do jar
COPY src ./src
RUN mvn -q -DskipTests package && \
    ls -la target

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Variáveis em runtime (sobreponha pelo EasyPanel)
ENV JAVA_OPTS="" \
    SERVER_PORT=8080

# Copia o jar produzido
COPY --from=build /app/target/*-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

# Usa JAVA_OPTS para tunar memória, etc
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
