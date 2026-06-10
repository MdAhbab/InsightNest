package com.insightnest.saved;

import com.insightnest.exception.ApiException;
import com.insightnest.program.ProgramRepository;
import com.insightnest.research.ResearchProjectRepository;
import com.insightnest.saved.dto.SavedItemRequest;
import com.insightnest.scholarship.ScholarshipRepository;
import com.insightnest.university.UniversityRepository;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import com.insightnest.webinar.WebinarRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavedItemService {
    private final SavedItemRepository savedItemRepository;
    private final UserService userService;
    private final UniversityRepository universityRepository;
    private final ProgramRepository programRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final ResearchProjectRepository researchProjectRepository;
    private final WebinarRepository webinarRepository;

    public SavedItemService(SavedItemRepository savedItemRepository,
                            UserService userService,
                            UniversityRepository universityRepository,
                            ProgramRepository programRepository,
                            ScholarshipRepository scholarshipRepository,
                            ResearchProjectRepository researchProjectRepository,
                            WebinarRepository webinarRepository) {
        this.savedItemRepository = savedItemRepository;
        this.userService = userService;
        this.universityRepository = universityRepository;
        this.programRepository = programRepository;
        this.scholarshipRepository = scholarshipRepository;
        this.researchProjectRepository = researchProjectRepository;
        this.webinarRepository = webinarRepository;
    }

    public List<SavedItem> listMine() {
        return savedItemRepository.findByUserOrderByCreatedAtDesc(userService.getCurrentUser());
    }

    public SavedItem save(SavedItemRequest request) {
        User user = userService.getCurrentUser();
        if (!targetExists(request.getItemType(), request.getItemId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Item to save not found");
        }
        if (savedItemRepository.existsByUserAndItemTypeAndItemId(user, request.getItemType(), request.getItemId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Item already saved");
        }
        SavedItem item = new SavedItem();
        item.setUser(user);
        item.setItemType(request.getItemType());
        item.setItemId(request.getItemId());
        return savedItemRepository.save(item);
    }

    public void delete(Long id) {
        SavedItem item = savedItemRepository.findByIdAndUser(id, userService.getCurrentUser())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Saved item not found"));
        savedItemRepository.delete(item);
    }

    private boolean targetExists(SavedItemType type, Long id) {
        return switch (type) {
            case UNIVERSITY -> universityRepository.existsById(id);
            case PROGRAM -> programRepository.existsById(id);
            case SCHOLARSHIP -> scholarshipRepository.existsById(id);
            case RESEARCH_PROJECT -> researchProjectRepository.existsById(id);
            case WEBINAR -> webinarRepository.existsById(id);
        };
    }
}
