package com.insightnest.forum;

import com.insightnest.exception.ApiException;
import com.insightnest.forum.dto.CommentRequest;
import com.insightnest.forum.dto.CommentResponse;
import com.insightnest.forum.dto.ThreadRequest;
import com.insightnest.forum.dto.ThreadResponse;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/forums")
public class ForumController {
    private final ForumThreadRepository threadRepository;
    private final ForumCommentRepository commentRepository;
    private final UserService userService;

    public ForumController(ForumThreadRepository threadRepository,
                           ForumCommentRepository commentRepository,
                           UserService userService) {
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
    }

    @GetMapping("/threads")
    public Page<ThreadResponse> listThreads(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return threadRepository.findAll(pageable).map(t ->
                ThreadResponse.from(t, commentRepository.countByThreadId(t.getId()),
                        commentRepository.findLastReplyAt(t.getId())));
    }

    @GetMapping("/threads/{id}")
    public ThreadResponse getThread(@PathVariable Long id) {
        ForumThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Thread not found"));
        return ThreadResponse.from(thread, commentRepository.countByThreadId(id),
                commentRepository.findLastReplyAt(id));
    }

    @PostMapping("/threads")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ThreadResponse createThread(@Valid @RequestBody ThreadRequest request) {
        User user = userService.getCurrentUser();
        ForumThread thread = new ForumThread();
        thread.setTitle(request.getTitle());
        thread.setBody(request.getBody());
        thread.setCategory(request.getCategory());
        thread.setAuthor(user);
        return ThreadResponse.from(threadRepository.save(thread));
    }

    @GetMapping("/threads/{id}/comments")
    public List<CommentResponse> listComments(@PathVariable Long id) {
        return commentRepository.findByThreadIdOrderByCreatedAtAsc(id).stream()
                .map(CommentResponse::from).toList();
    }

    @PostMapping("/threads/{id}/comments")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public CommentResponse addComment(@PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        User user = userService.getCurrentUser();
        ForumThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Thread not found"));
        ForumComment comment = new ForumComment();
        comment.setThread(thread);
        comment.setBody(request.getBody());
        comment.setAuthor(user);
        return CommentResponse.from(commentRepository.save(comment));
    }
}
