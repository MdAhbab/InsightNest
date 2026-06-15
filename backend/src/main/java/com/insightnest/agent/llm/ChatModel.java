package com.insightnest.agent.llm;

/**
 * A single-turn chat completion provider. Implementations wrap one LLM backend
 * (local Ollama, OpenAI, Gemini). All InsightNest agent prompts are assembled into
 * a system + user pair, so a single-turn contract is sufficient — any prior
 * conversation is folded into the user prompt by the caller.
 */
public interface ChatModel {

    /** Lower-case provider id used for ordering/logging, e.g. {@code "ollama"}. */
    String providerName();

    /** True when this provider has the configuration it needs to be called. */
    boolean isConfigured();

    /**
     * Run a completion. Returns the assistant text (already stripped of any
     * model "thinking" markup). Throws {@link LlmException} on transport,
     * timeout, non-2xx, or empty-response failures so the caller can fall back.
     */
    String complete(String systemPrompt, String userPrompt);
}
