package com.insightnest.messaging;

import com.insightnest.common.events.AuditEvent;
import com.insightnest.common.events.NewMessageEvent;
import com.insightnest.exception.ApiException;
import com.insightnest.messaging.dto.ConversationSummaryResponse;
import com.insightnest.messaging.dto.ConversationThreadResponse;
import com.insightnest.messaging.dto.MessageResponse;
import com.insightnest.messaging.dto.NewConversationRequest;
import com.insightnest.messaging.dto.ReplyRequest;
import com.insightnest.user.User;
import com.insightnest.user.UserRepository;
import com.insightnest.user.UserService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class MessagingService {
    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    public MessagingService(ConversationRepository conversationRepository,
                            ConversationMessageRepository messageRepository,
                            UserRepository userRepository,
                            UserService userService,
                            ApplicationEventPublisher eventPublisher) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.eventPublisher = eventPublisher;
    }

    public Page<ConversationSummaryResponse> listMyConversations(Pageable pageable) {
        User me = userService.getCurrentUser();
        return conversationRepository.findByParticipant(me, pageable).map(conv -> {
            boolean isInitiator = conv.getInitiator().getId().equals(me.getId());
            long unread = messageRepository.countUnreadForUser(conv, me);
            List<ConversationMessage> lastMsgs = messageRepository.findLastMessage(conv, PageRequest.of(0, 1));
            String preview = lastMsgs.isEmpty() ? "" : lastMsgs.get(0).getBody();
            if (preview.length() > 100) preview = preview.substring(0, 100) + "…";
            return ConversationSummaryResponse.from(conv, unread, preview, isInitiator);
        });
    }

    @Transactional
    public ConversationSummaryResponse startConversation(NewConversationRequest request) {
        User me = userService.getCurrentUser();
        // Resolve recipient — exactly one of recipientId / recipientEmail must be provided
        if (request.getRecipientId() == null && (request.getRecipientEmail() == null || request.getRecipientEmail().isBlank())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Provide either recipientId or recipientEmail");
        }
        if (request.getRecipientId() != null && request.getRecipientEmail() != null && !request.getRecipientEmail().isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Provide only one of recipientId or recipientEmail");
        }

        User recipient;
        if (request.getRecipientId() != null) {
            recipient = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recipient not found"));
        } else {
            recipient = userRepository.findByEmail(request.getRecipientEmail().trim().toLowerCase())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recipient not found"));
        }

        Conversation conv = new Conversation();
        conv.setSubject(request.getSubject());
        conv.setInitiator(me);
        conv.setRecipient(recipient);
        conv.setLastMessageAt(Instant.now());
        conv = conversationRepository.save(conv);

        ConversationMessage msg = new ConversationMessage();
        msg.setConversation(conv);
        msg.setSender(me);
        msg.setBody(request.getBody());
        msg.setSentAt(Instant.now());
        messageRepository.save(msg);

        // Notify recipient
        String preview = request.getBody().length() > 100 ? request.getBody().substring(0, 100) + "…" : request.getBody();
        eventPublisher.publishEvent(new NewMessageEvent(recipient, me.getFullName(), request.getSubject(), preview));
        eventPublisher.publishEvent(new AuditEvent(me, "MESSAGE_SENT", "Conversation", conv.getId(), request.getSubject()));

        return ConversationSummaryResponse.from(conv, 1L, preview, true);
    }

    @Transactional
    public ConversationThreadResponse getThread(Long conversationId) {
        User me = userService.getCurrentUser();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
        assertParticipant(conv, me);

        // Mark incoming messages as read
        messageRepository.markReadForUser(conv, me);

        List<MessageResponse> messages = messageRepository.findByConversationOrderBySentAtAsc(conv)
                .stream().map(MessageResponse::from).toList();
        return ConversationThreadResponse.from(conv, messages);
    }

    @Transactional
    public MessageResponse reply(Long conversationId, ReplyRequest request) {
        User me = userService.getCurrentUser();
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
        assertParticipant(conv, me);

        ConversationMessage msg = new ConversationMessage();
        msg.setConversation(conv);
        msg.setSender(me);
        msg.setBody(request.getBody());
        msg.setSentAt(Instant.now());
        ConversationMessage saved = messageRepository.save(msg);

        // Update conversation's lastMessageAt
        conv.setLastMessageAt(saved.getSentAt());
        conversationRepository.save(conv);

        // Notify the other party
        User otherParty = conv.getInitiator().getId().equals(me.getId()) ? conv.getRecipient() : conv.getInitiator();
        String preview = request.getBody().length() > 100 ? request.getBody().substring(0, 100) + "…" : request.getBody();
        eventPublisher.publishEvent(new NewMessageEvent(otherParty, me.getFullName(), conv.getSubject(), preview));
        eventPublisher.publishEvent(new AuditEvent(me, "MESSAGE_SENT", "Conversation", conv.getId(), conv.getSubject()));

        return MessageResponse.from(saved);
    }

    private void assertParticipant(Conversation conv, User user) {
        boolean isParticipant = conv.getInitiator().getId().equals(user.getId())
                || conv.getRecipient().getId().equals(user.getId());
        if (!isParticipant) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not a participant in this conversation");
        }
    }
}
