FROM eclipse-temurin:21-jdk
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Runner.java .
RUN curl -L -o jackson-core.jar        https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.17.0/jackson-core-2.17.0.jar \
 && curl -L -o jackson-annotations.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.17.0/jackson-annotations-2.17.0.jar \
 && curl -L -o jackson-databind.jar    https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.17.0/jackson-databind-2.17.0.jar
RUN javac -cp .:jackson-core.jar:jackson-annotations.jar:jackson-databind.jar Runner.java
ENTRYPOINT ["java","-cp",".:jackson-core.jar:jackson-annotations.jar:jackson-databind.jar","Runner"]

