package com.insightnest.forum;

import com.insightnest.exception.ApiException;
import com.insightnest.forum.dto.CommentRequest;
import com.insightnest.forum.dto.ThreadRequest;
import com.insightnest.user.User;
import com.insightnest.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forums")
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
    public List<ForumThread> listThreads() {
        return threadRepository.findAll();
    }

    @GetMapping("/threads/{id}")
    public ForumThread getThread(@PathVariable Long id) {
        return threadRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Thread not found"));
    }

    @PostMapping("/threads")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ForumThread createThread(@RequestBody ThreadRequest request) {
        User user = userService.getCurrentUser();
        ForumThread thread = new ForumThread();
        thread.setTitle(request.getTitle());
        thread.setBody(request.getBody());
        thread.setAuthor(user);
        return threadRepository.save(thread);
    }

    @GetMapping("/threads/{id}/comments")
    public List<ForumComment> listComments(@PathVariable Long id) {
        return commentRepository.findByThreadId(id);
    }

    @PostMapping("/threads/{id}/comments")
    @PreAuthorize("hasAnyRole('LEARNER','FACULTY')")
    public ForumComment addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        User user = userService.getCurrentUser();
        ForumThread thread = threadRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Thread not found"));
        ForumComment comment = new ForumComment();
        comment.setThread(thread);
        comment.setBody(request.getBody());
        comment.setAuthor(user);
        return commentRepository.save(comment);
    }
}
