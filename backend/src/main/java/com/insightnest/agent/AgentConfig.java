package com.insightnest.agent;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AgentConfig {
    @Value("${agent.gemma.base-url:#{null}}")
    private String gemmaBaseUrl;

    @Value("${agent.gemma.model:gemma-3b}")
    private String gemmaModel;

    public String getGemmaBaseUrl() {
        return gemmaBaseUrl;
    }

    public String getGemmaModel() {
        return gemmaModel;
    }

    public boolean isGemmaEnabled() {
        return gemmaBaseUrl != null && !gemmaBaseUrl.isBlank();
    }
}
