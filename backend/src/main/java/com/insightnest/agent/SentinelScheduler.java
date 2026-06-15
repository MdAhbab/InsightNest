package com.insightnest.agent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Weekly Deadline Sentinel fan-out (agents.md §4: Mon 07:00 server time). Created only when
 * {@code agent.sentinel.enabled=true}, so it never runs by surprise in local dev. The on-demand
 * {@code POST /api/v1/agent/sentinel/run} endpoint works regardless of this flag.
 */
@Component
@ConditionalOnProperty(prefix = "agent.sentinel", name = "enabled", havingValue = "true")
public class SentinelScheduler {

    private static final Logger log = LoggerFactory.getLogger(SentinelScheduler.class);

    private final SentinelService sentinelService;

    public SentinelScheduler(SentinelService sentinelService) {
        this.sentinelService = sentinelService;
    }

    @Scheduled(cron = "${agent.sentinel.cron:0 0 7 * * MON}")
    public void weeklyDigest() {
        int delivered = sentinelService.runForAllActiveUsers();
        log.info("Deadline Sentinel delivered {} weekly digest notification(s)", delivered);
    }
}
