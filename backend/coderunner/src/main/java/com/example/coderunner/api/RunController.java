package com.example.coderunner.api;

import com.example.coderunner.model.CodeRunRequest;
import com.example.coderunner.service.DockerRunner;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/run")
@CrossOrigin(origins = "*") // allow all origins like Flask+CORS
public class RunController {
    private final DockerRunner dockerRunner;

    public RunController(DockerRunner dockerRunner) {
        this.dockerRunner = dockerRunner;
    }

    @PostMapping("/{language}")
    public ResponseEntity<Map<String, Object>> run(@PathVariable String language,
                                                   @Valid @RequestBody CodeRunRequest body) {
        Map<String, Object> result = dockerRunner.runInDocker(language, body.getCode(), body.getInput());
        return ResponseEntity.ok(result);
    }
}

