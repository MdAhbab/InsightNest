package com.insightnest.agent.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds the {@code agent.*} configuration block. Drives whether the LLM brain is
 * active, the provider fallback order, per-provider endpoints/keys, and call limits.
 * Defaults keep a fresh clone runnable with no LLM (heuristic brain) and no secrets.
 */
@Component
@ConfigurationProperties(prefix = "agent")
public class AgentLlmProperties {

    private Llm llm = new Llm();
    private Provider ollama = new Provider("http://localhost:11434", "gemma4:e4b", "");
    private Provider openai = new Provider("https://api.openai.com/v1", "gpt-4o-mini", "");
    private Provider gemini = new Provider("https://generativelanguage.googleapis.com/v1beta", "gemini-2.0-flash", "");

    public Llm getLlm() { return llm; }
    public void setLlm(Llm llm) { this.llm = llm; }
    public Provider getOllama() { return ollama; }
    public void setOllama(Provider ollama) { this.ollama = ollama; }
    public Provider getOpenai() { return openai; }
    public void setOpenai(Provider openai) { this.openai = openai; }
    public Provider getGemini() { return gemini; }
    public void setGemini(Provider gemini) { this.gemini = gemini; }

    public static class Llm {
        /** Master switch. When false, the heuristic brain remains the sole AgentBrain. */
        private boolean enabled = false;
        /** Comma-separated provider order, e.g. {@code ollama,openai,gemini}. */
        private String providers = "ollama,openai,gemini";
        /** Per-call hard timeout. */
        private int timeoutSeconds = 60;
        private double temperature = 0.4;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getProviders() { return providers; }
        public void setProviders(String providers) { this.providers = providers; }
        public int getTimeoutSeconds() { return timeoutSeconds; }
        public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }
        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }
    }

    public static class Provider {
        private String baseUrl;
        private String model;
        /** Required for OpenAI/Gemini; unused by a local Ollama install. */
        private String apiKey;

        public Provider() {}
        public Provider(String baseUrl, String model, String apiKey) {
            this.baseUrl = baseUrl;
            this.model = model;
            this.apiKey = apiKey;
        }

        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }

        /** Endpoint with any trailing slash removed. */
        public String normalizedBaseUrl() {
            if (baseUrl == null) return "";
            return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        }
    }
}
