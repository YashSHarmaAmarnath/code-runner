FROM golang:1.22

RUN apt-get update && apt-get install -y --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*

RUN echo 'package main; func main(){}' > /tmp/dummy.go && go build /tmp/dummy.go

WORKDIR /app
COPY runner.py .
ENTRYPOINT ["python3","runner.py"]