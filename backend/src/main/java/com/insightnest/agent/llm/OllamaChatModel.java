package com.insightnest.agent.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Primary provider: a local Ollama daemon (OpenAI-style {@code /api/chat}).
 * {@code think:false} suppresses chain-of-thought for reasoning-capable tags such as
 * {@code gemma4:e4b}; Ollama ignores the field on models/versions that don't support it.
 */
@Component
public class OllamaChatModel extends AbstractHttpChatModel {

    public OllamaChatModel(ObjectMapper mapper, AgentLlmProperties props) {
        super(mapper, props);
    }

    @Override
    public String providerName() {
        return "ollama";
    }

    @Override
    public boolean isConfigured() {
        AgentLlmProperties.Provider o = props.getOllama();
        return notBlank(o.getBaseUrl()) && notBlank(o.getModel());
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        AgentLlmProperties.Provider o = props.getOllama();
        ObjectNode body = mapper.createObjectNode();
        body.put("model", o.getModel());
        body.put("stream", false);
        body.put("think", false);

        ArrayNode messages = body.putArray("messages");
        if (notBlank(systemPrompt)) {
            ObjectNode sys = messages.addObject();
            sys.put("role", "system");
            sys.put("content", systemPrompt);
        }
        ObjectNode user = messages.addObject();
        user.put("role", "user");
        user.put("content", userPrompt);

        ObjectNode options = body.putObject("options");
        options.put("temperature", props.getLlm().getTemperature());

        JsonNode root = postJson(o.normalizedBaseUrl() + "/api/chat", body, Map.of());
        String content = root.path("message").path("content").asText("");
        String out = sanitize(content);
        if (out.isBlank()) {
            throw new LlmException("ollama returned an empty completion");
        }
        return out;
    }
}
