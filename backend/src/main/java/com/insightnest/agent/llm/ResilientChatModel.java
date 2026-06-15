package com.insightnest.agent.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Calls the configured chat providers in {@code agent.llm.providers} order, skipping any
 * that aren't configured, and returns the first non-blank completion. Each provider failure
 * is logged and the next is tried; if every configured provider fails it throws
 * {@link LlmException} so the caller ({@code GemmaBrain}) can fall back to the heuristic.
 *
 * <p>Deliberately not a {@link ChatModel} itself, so injecting the concrete providers here
 * cannot pull this orchestrator back in on itself.
 */
@Component
public class ResilientChatModel {

    private static final Logger log = LoggerFactory.getLogger(ResilientChatModel.class);

    private final List<ChatModel> providers;
    private final AgentLlmProperties props;

    public ResilientChatModel(OllamaChatModel ollama,
                              OpenAiChatModel openai,
                              GeminiChatModel gemini,
                              AgentLlmProperties props) {
        this.providers = List.of(ollama, openai, gemini);
        this.props = props;
    }

    public String complete(String systemPrompt, String userPrompt) {
        List<ChatModel> ordered = ordered();
        LlmException last = null;
        boolean anyConfigured = false;

        for (ChatModel model : ordered) {
            if (!model.isConfigured()) {
                continue;
            }
            anyConfigured = true;
            try {
                String out = model.complete(systemPrompt, userPrompt);
                if (out != null && !out.isBlank()) {
                    log.debug("agent completion served by provider '{}'", model.providerName());
                    return out;
                }
            } catch (RuntimeException e) {
                last = (e instanceof LlmException le) ? le
                        : new LlmException(model.providerName() + " failed: " + e.getMessage(), e);
                log.warn("LLM provider '{}' failed, trying next: {}", model.providerName(), e.getMessage());
            }
        }

        if (!anyConfigured) {
            throw new LlmException("no LLM provider is configured (check agent.llm.providers and API keys)");
        }
        throw (last != null) ? last : new LlmException("all LLM providers returned empty completions");
    }

    /** Providers in configured precedence; any not named are appended in declaration order. */
    private List<ChatModel> ordered() {
        Map<String, ChatModel> byName = new LinkedHashMap<>();
        for (ChatModel m : providers) {
            byName.put(m.providerName(), m);
        }
        List<ChatModel> result = new ArrayList<>();
        String configured = props.getLlm().getProviders();
        if (configured != null) {
            for (String token : configured.split(",")) {
                ChatModel m = byName.get(token.trim().toLowerCase());
                if (m != null && !result.contains(m)) {
                    result.add(m);
                }
            }
        }
        for (ChatModel m : providers) {
            if (!result.contains(m)) {
                result.add(m);
            }
        }
        return result;
    }
}
