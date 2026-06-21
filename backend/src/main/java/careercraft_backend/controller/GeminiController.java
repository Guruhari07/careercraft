package careercraft_backend.controller;

import careercraft_backend.dto.AiResumeAnalysisResponse;
import careercraft_backend.dto.ResumeRequest;
import careercraft_backend.service.GeminiService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/resume-analysis")
    public AiResumeAnalysisResponse analyzeResume(
            @RequestBody ResumeRequest request) {

        return geminiService.analyzeResume(
                request.getResumeText()
        );
    }
}