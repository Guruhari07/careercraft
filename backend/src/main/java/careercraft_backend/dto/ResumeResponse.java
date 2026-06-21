package careercraft_backend.dto;

import java.util.List;

public class ResumeResponse {

    private int score;
    private int wordCount;
    private List<String> suggestions;

    public ResumeResponse(
            int score,
            int wordCount,
            List<String> suggestions) {

        this.score = score;
        this.wordCount = wordCount;
        this.suggestions = suggestions;
    }

    public int getScore() {
        return score;
    }

    public int getWordCount() {
        return wordCount;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }
}