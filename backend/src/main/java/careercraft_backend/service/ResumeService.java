package careercraft_backend.service;

import careercraft_backend.dto.ResumeResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResumeService {

    public ResumeResponse analyzeResume(String text) {

        int score = 0;

        List<String> suggestions = new ArrayList<>();

        String lowerText = text.toLowerCase();

        // Education Section
        if (lowerText.contains("education")) {
            score += 25;
        } else {
            suggestions.add("Add Education Section");
        }

        // Skills Section
        if (lowerText.contains("skills")) {
            score += 25;
        } else {
            suggestions.add("Add Skills Section");
        }

        // Projects Section
        if (lowerText.contains("projects")) {
            score += 25;
        } else {
            suggestions.add("Add Projects Section");
        }

        // Experience Section
        if (lowerText.contains("experience")) {
            score += 25;
        } else {
            suggestions.add("Add Experience Section");
        }

        // Word Count
        int wordCount = 0;

        if (text != null && !text.trim().isEmpty()) {
            wordCount = text.trim().split("\\s+").length;
        }

        // Additional Suggestion
        if (wordCount < 50) {
            suggestions.add("Resume is too short. Add more details.");
        }

        return new ResumeResponse(
                score,
                wordCount,
                suggestions
        );
    }
}