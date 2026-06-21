package careercraft_backend.dto;

public class AiResumeResponse {

    private String analysis;

    public AiResumeResponse() {
    }

    public AiResumeResponse(String analysis) {
        this.analysis = analysis;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }
}