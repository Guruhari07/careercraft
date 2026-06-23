package careercraft_backend.controller;

import careercraft_backend.dto.KeywordRequest;
import careercraft_backend.dto.KeywordResponse;
import careercraft_backend.service.KeywordFinderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class KeywordFinderController {

    @Autowired
    private KeywordFinderService keywordFinderService;

    @PostMapping("/keywords")
    public KeywordResponse findKeywords(
            @RequestBody KeywordRequest request
    ) {

        return keywordFinderService.findKeywords(
                request.getJobTitle()
        );
    }
}