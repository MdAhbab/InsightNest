package com.insightnest.messaging;

import com.insightnest.messaging.dto.ConversationSummaryResponse;
import com.insightnest.messaging.dto.ConversationThreadResponse;
import com.insightnest.messaging.dto.MessageResponse;
import com.insightnest.messaging.dto.NewConversationRequest;
import com.insightnest.messaging.dto.ReplyRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/messages")
public class MessagingController {
    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping
    public Page<ConversationSummaryResponse> listConversations(
            @PageableDefault(size = 20, sort = "lastMessageAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return messagingService.listMyConversations(pageable);
    }

    @PostMapping
    public ConversationSummaryResponse startConversation(@Valid @RequestBody NewConversationRequest request) {
        return messagingService.startConversation(request);
    }

    @GetMapping("/{id}")
    public ConversationThreadResponse getThread(@PathVariable Long id) {
        return messagingService.getThread(id);
    }

    @PostMapping("/{id}/reply")
    public MessageResponse reply(@PathVariable Long id, @Valid @RequestBody ReplyRequest request) {
        return messagingService.reply(id, request);
    }
}
