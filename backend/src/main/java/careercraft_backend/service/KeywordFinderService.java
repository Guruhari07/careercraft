package careercraft_backend.service;

import careercraft_backend.dto.KeywordResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class KeywordFinderService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate =
            new RestTemplate();

    public KeywordResponse findKeywords(String jobTitle) {

        String prompt = """
                For the given job title, return the most important
                technical skills and ATS keywords.

                Return ONLY valid JSON.

                Format:

                {
                  "keywords":[]
                }

                Job Title:
                """ + jobTitle;

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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        try {

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            url,
                            entity,
                            String.class
                    );

            ObjectMapper mapper =
                    new ObjectMapper();

            String json =
                    mapper.readTree(response.getBody())
                            .path("candidates")
                            .get(0)
                            .path("content")
                            .path("parts")
                            .get(0)
                            .path("text")
                            .asText();

            json = json
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return mapper.readValue(
                    json,
                    KeywordResponse.class
            );

        } catch (Exception e) {

            KeywordResponse error =
                    new KeywordResponse();

            error.setKeywords(
                    List.of(
                            "Unable to generate keywords"
                    )
            );

            return error;
        }
    }
}