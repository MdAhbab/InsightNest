package com.insightnest.agent.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Fallback provider: OpenAI Chat Completions API. Active only when an API key is set
 * (key lives in {@code backend/.env}, never committed).
 */
@Component
public class OpenAiChatModel extends AbstractHttpChatModel {

    public OpenAiChatModel(ObjectMapper mapper, AgentLlmProperties props) {
        super(mapper, props);
    }

    @Override
    public String providerName() {
        return "openai";
    }

    @Override
    public boolean isConfigured() {
        return notBlank(props.getOpenai().getApiKey());
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        AgentLlmProperties.Provider c = props.getOpenai();
        ObjectNode body = mapper.createObjectNode();
        body.put("model", c.getModel());
        body.put("temperature", props.getLlm().getTemperature());

        ArrayNode messages = body.putArray("messages");
        if (notBlank(systemPrompt)) {
            ObjectNode sys = messages.addObject();
            sys.put("role", "system");
            sys.put("content", systemPrompt);
        }
        ObjectNode user = messages.addObject();
        user.put("role", "user");
        user.put("content", userPrompt);

        JsonNode root = postJson(c.normalizedBaseUrl() + "/chat/completions", body,
                Map.of("Authorization", "Bearer " + c.getApiKey()));

        JsonNode choices = root.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw new LlmException("openai returned no choices");
        }
        String out = sanitize(choices.get(0).path("message").path("content").asText(""));
        if (out.isBlank()) {
            throw new LlmException("openai returned an empty completion");
        }
        return out;
    }
}
