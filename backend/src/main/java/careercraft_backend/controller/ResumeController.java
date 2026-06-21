package careercraft_backend.controller;

import careercraft_backend.dto.ResumeRequest;
import careercraft_backend.dto.ResumeResponse;
import careercraft_backend.service.ResumeService;
import careercraft_backend.util.PdfUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import careercraft_backend.dto.AiResumeAnalysisResponse;
import careercraft_backend.service.GeminiService;

import java.io.File;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/analyze")
    public ResumeResponse analyze(
            @RequestBody ResumeRequest request) {

        return resumeService.analyzeResume(
                request.getResumeText()
        );
    }

    @PostMapping("/upload")
    public AiResumeAnalysisResponse uploadResume(
            @RequestParam("file") MultipartFile file) {

        try {

            File tempFile =
                    File.createTempFile(
                            "resume",
                            ".pdf"
                    );

            file.transferTo(tempFile);

            String resumeText =
                    PdfUtil.extractText(tempFile);

            return geminiService
                    .analyzeResume(resumeText);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Resume upload failed",
                    e
            );
        }
    }
}