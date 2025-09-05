FROM gcc:13
RUN apt-get update && apt-get install -y --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY runner.py .
ENTRYPOINT ["python3", "runner.py"]
