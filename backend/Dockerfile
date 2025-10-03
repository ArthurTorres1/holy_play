# ---- Build stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copia pom e resolve dependências em cache
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline

# Copia o restante do código e faz o build do jar
COPY src ./src
RUN mvn -q -DskipTests package && \
    echo "Arquivos gerados em target:" && ls -la target && \
    # Seleciona o JAR executável (exclui sources/original) e renomeia para app.jar
    JAR_FILE=$(ls target/*.jar | grep -Ev '(sources|original)') && \
    cp "$JAR_FILE" /app/app.jar && \
    ls -la /app

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Variáveis em runtime (sobreponha pelo EasyPanel)
ENV JAVA_OPTS="" \
    SERVER_PORT=8080

# Copia o JAR renomeado pelo stage de build
COPY --from=build /app/app.jar /app/app.jar

EXPOSE 8080

# Usa JAVA_OPTS para tunar memória, etc
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
