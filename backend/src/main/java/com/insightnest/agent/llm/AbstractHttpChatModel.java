package com.insightnest.agent.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Shared JSON-over-HTTP plumbing for the chat providers: one reusable {@link HttpClient},
 * a guarded POST that maps non-2xx/transport/timeout failures to {@link LlmException},
 * and a sanitizer that strips {@code <think>…</think>} blocks emitted by reasoning models
 * (e.g. {@code gemma4}) so only the final answer reaches the UI.
 */
abstract class AbstractHttpChatModel implements ChatModel {

    private static final Pattern THINK = Pattern.compile("(?is)<think>.*?</think>");

    protected final ObjectMapper mapper;
    protected final AgentLlmProperties props;
    private final HttpClient http;

    protected AbstractHttpChatModel(ObjectMapper mapper, AgentLlmProperties props) {
        this.mapper = mapper;
        this.props = props;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    protected JsonNode postJson(String url, ObjectNode body, Map<String, String> headers) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(Math.max(5, props.getLlm().getTimeoutSeconds())))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
            headers.forEach(builder::header);

            HttpResponse<String> response = http.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new LlmException(providerName() + " HTTP " + response.statusCode()
                        + ": " + truncate(response.body(), 300));
            }
            return mapper.readTree(response.body());
        } catch (LlmException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException(providerName() + " call interrupted", e);
        } catch (Exception e) {
            throw new LlmException(providerName() + " call failed: " + e.getMessage(), e);
        }
    }

    /** Removes model "thinking" markup and trims; never returns null. */
    protected static String sanitize(String s) {
        if (s == null) {
            return "";
        }
        return THINK.matcher(s).replaceAll("").trim();
    }

    protected static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }

    protected static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
