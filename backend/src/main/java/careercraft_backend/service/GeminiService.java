package careercraft_backend.service;

import careercraft_backend.dto.AiResumeAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate =
            new RestTemplate();

    public AiResumeAnalysisResponse analyzeResume(String resumeText) {

        String prompt = """
                Analyze this resume.

                Return ONLY raw JSON.
                Do not use markdown.
                Do not use ```json.
                Do not add explanations.

                Format:

                {
                  "atsScore": 0,
                  "strengths": [],
                  "weaknesses": [],
                  "suggestions": []
                }

                Resume:
                """ + resumeText;

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                        + apiKey;

        Map<String, Object> body = Map.of(
                "contents",
                new Object[]{
                        Map.of(
                                "parts",
                                new Object[]{
                                        Map.of(
                                                "text",
                                                prompt
                                        )
                                }
                        )
                }
        );

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(
                        body,
                        headers
                );

        try {

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            url,
                            entity,
                            String.class
                    );

            ObjectMapper mapper =
                    new ObjectMapper();

            JsonNode root =
                    mapper.readTree(
                            response.getBody()
                    );

            String result = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            result = result
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return mapper.readValue(
                    result,
                    AiResumeAnalysisResponse.class
            );

        } catch (Exception e) {

            AiResumeAnalysisResponse errorResponse =
                    new AiResumeAnalysisResponse();

            errorResponse.setAtsScore(0);

            errorResponse.setStrengths(
                    java.util.List.of(
                            "Unable to analyze resume"
                    )
            );

            errorResponse.setWeaknesses(
                    java.util.List.of(
                            "Gemini Error: " + e.getMessage()
                    )
            );

            errorResponse.setSuggestions(
                    java.util.List.of(
                            "Try again later"
                    )
            );

            return errorResponse;
        }
    }
}