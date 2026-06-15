package com.insightnest.agent.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Fallback provider: Google Gemini (Generative Language API {@code :generateContent}).
 * Gemini has no "assistant"/"system" message roles — the system prompt is sent as
 * {@code systemInstruction} and the user turn as a {@code user} content part. Active only
 * when an API key is set (key lives in {@code backend/.env}, never committed).
 */
@Component
public class GeminiChatModel extends AbstractHttpChatModel {

    public GeminiChatModel(ObjectMapper mapper, AgentLlmProperties props) {
        super(mapper, props);
    }

    @Override
    public String providerName() {
        return "gemini";
    }

    @Override
    public boolean isConfigured() {
        return notBlank(props.getGemini().getApiKey());
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        AgentLlmProperties.Provider c = props.getGemini();
        ObjectNode body = mapper.createObjectNode();

        if (notBlank(systemPrompt)) {
            ObjectNode sysInstruction = body.putObject("systemInstruction");
            sysInstruction.putArray("parts").addObject().put("text", systemPrompt);
        }
        ArrayNode contents = body.putArray("contents");
        ObjectNode turn = contents.addObject();
        turn.put("role", "user");
        turn.putArray("parts").addObject().put("text", userPrompt);

        ObjectNode generationConfig = body.putObject("generationConfig");
        generationConfig.put("temperature", props.getLlm().getTemperature());

        String url = c.normalizedBaseUrl() + "/models/" + c.getModel() + ":generateContent";
        JsonNode root = postJson(url, body, Map.of("x-goog-api-key", c.getApiKey()));

        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new LlmException("gemini returned no candidates");
        }
        StringBuilder sb = new StringBuilder();
        for (JsonNode part : candidates.get(0).path("content").path("parts")) {
            sb.append(part.path("text").asText(""));
        }
        String out = sanitize(sb.toString());
        if (out.isBlank()) {
            throw new LlmException("gemini returned an empty completion");
        }
        return out;
    }
}
