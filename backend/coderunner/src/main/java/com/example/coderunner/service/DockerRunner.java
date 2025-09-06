package com.example.coderunner.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class DockerRunner {
    private static final Map<String, String> IMAGE_MAP = Map.of(
            "python", "python-code-runner",
            "cpp",    "cpp-code-runner",
            "java",   "java-code-runner"
      );

    private final ObjectMapper mapper = new ObjectMapper();

    public Map<String, Object> runInDocker(String language, String code, String userInput) {
        if (!IMAGE_MAP.containsKey(language)) {
            return Map.of("error", "Unsupported language");
        }

        String image = IMAGE_MAP.get(language);
        Map<String, Object> payload = new HashMap<>();
        payload.put("code", code != null ? code : "");
        payload.put("input", userInput != null ? userInput : "");

        byte[] stdinJson;
        try {
            stdinJson = mapper.writeValueAsBytes(payload);
        } catch (Exception e) {
            return Map.of("error", "Failed to serialize input JSON", "details", e.getMessage());
        }

        List<String> cmd = List.of(
                "docker", "run", "-i", "--rm",
                "--network", "none",
                "--cpus", "1", "-m", "256m", "--pids-limit", "64",
                image
        );

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(false); // keep stdout/stderr separate

        try {
            Process p = pb.start();

            // write JSON to container stdin
            try (OutputStream os = p.getOutputStream()) {
                os.write(stdinJson);
                os.flush();
            }

            boolean finished = p.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return Map.of("error", "Execution timed out (orchestration)");
            }

            String stdout = readAll(p.getInputStream());
            String stderr = readAll(p.getErrorStream());

            if (stdout == null || stdout.isBlank()) {
                // If container didn't return JSON, surface stderr
                return Map.of(
                        "error", "Container returned no output",
                        "stderr", stderr == null ? "" : stderr
                );
            }

            try {
                // Parse the JSON the runner prints
                Map<String, Object> result = mapper.readValue(stdout, new TypeReference<>(){});
                // Optionally attach raw stderr for debugging visibility
                if (stderr != null && !stderr.isBlank() && !result.containsKey("stderr")) {
                    result.put("stderr", stderr);
                }
                return result;
            } catch (Exception parse) {
                // Not valid JSON — return what we got to help debug
                return Map.of(
                        "error", "Invalid JSON from container",
                        "raw", stdout,
                        "stderr", stderr
                );
            }
        } catch (IOException ioe) {
            return Map.of("error", "Failed to start docker process", "details", ioe.getMessage());
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            return Map.of("error", "Interrupted while waiting for docker");
        }
    }

    private static String readAll(InputStream is) throws IOException {
        if (is == null) return null;
        try (BufferedInputStream bis = new BufferedInputStream(is)) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int r;
            while ((r = bis.read(buf)) != -1) baos.write(buf, 0, r);
            return baos.toString(StandardCharsets.UTF_8);
        }
    }
}

