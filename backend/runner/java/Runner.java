import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Runner {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        String inputJson = new String(System.in.readAllBytes());
        Map<String, String> event = mapper.readValue(inputJson, Map.class);

        String code = event.getOrDefault("code", "");
        String userInput = event.getOrDefault("input", "");

        Map<String, Object> result = runCode(code, userInput);
        System.out.println(mapper.writeValueAsString(result));
    }

    private static Map<String, Object> runProcess(List<String> command, String input, long timeoutSeconds) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        Process p = pb.start();

        try (OutputStream os = p.getOutputStream()) {
            if (input != null) os.write(input.getBytes());
        }

        boolean finished = p.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            p.destroyForcibly();
            return Map.of("error", "Execution timed out");
        }

        String stdout = new String(p.getInputStream().readAllBytes());
        String stderr = new String(p.getErrorStream().readAllBytes());

        return Map.of("stdout", stdout, "stderr", stderr, "returncode", p.exitValue());
    }

    private static Map<String, Object> runCode(String code, String userInput) {
        try {
            Path src = Files.createTempFile("Main", ".java");
            Files.writeString(src, code);

            // Compile
            Map<String, Object> compileResult = runProcess(List.of("javac", src.toString()), null, 5);
            if ((int)compileResult.getOrDefault("returncode", 1) != 0) {
                return Map.of("error", "Compilation failed", "stderr", compileResult.get("stderr"));
            }

            // Run
            return runProcess(List.of("java", "-cp", src.getParent().toString(), "Main"), userInput, 5);
        } catch (Exception e) {
            return Map.of("error", e.toString());
        }
    }
}

