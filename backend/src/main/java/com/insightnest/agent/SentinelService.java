package com.insightnest.agent;

import com.insightnest.agent.dto.DigestItem;
import com.insightnest.agent.dto.DigestResponse;
import com.insightnest.notification.NotificationService;
import com.insightnest.user.User;
import com.insightnest.user.UserRepository;
import com.insightnest.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.IsoFields;
import java.util.List;

/**
 * Deadline Sentinel (agents.md §4). Turns a user's deadline digest into an in-app
 * notification. Idempotent per ISO week — the notification title carries the week, and
 * {@link NotificationService#notifyReplacingByTitle} deletes any existing same-title
 * notification first, so re-runs replace rather than duplicate (key SENTINEL-{user}-{isoWeek}).
 */
@Service
public class SentinelService {

    private static final Logger log = LoggerFactory.getLogger(SentinelService.class);

    private final AgentBrain brain;
    private final NotificationService notificationService;
    private final UserService userService;
    private final UserRepository userRepository;

    public SentinelService(AgentBrain brain,
                           NotificationService notificationService,
                           UserService userService,
                           UserRepository userRepository) {
        this.brain = brain;
        this.notificationService = notificationService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    /** On-demand run for the signed-in user; also returns the digest for immediate display. */
    public DigestResponse runForCurrentUser() {
        return runForUser(userService.getCurrentUser());
    }

    public DigestResponse runForUser(User user) {
        DigestResponse digest = brain.digest(user);
        notificationService.notifyReplacingByTitle(user, weeklyTitle(), compose(digest));
        return digest;
    }

    /** Scheduled fan-out across active users; resilient to a single user's failure. */
    public int runForAllActiveUsers() {
        List<User> users = userRepository.findActiveUsers();
        int delivered = 0;
        for (User user : users) {
            try {
                runForUser(user);
                delivered++;
            } catch (RuntimeException e) {
                log.warn("Sentinel digest failed for user {}: {}", user.getId(), e.getMessage());
            }
        }
        return delivered;
    }

    private static String weeklyTitle() {
        LocalDate today = LocalDate.now();
        int week = today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        int year = today.get(IsoFields.WEEK_BASED_YEAR);
        return String.format("Deadline Sentinel — %d-W%02d", year, week);
    }

    private static String compose(DigestResponse digest) {
        int u = sizeOf(digest.urgent());
        int a = sizeOf(digest.approaching());
        int w = sizeOf(digest.webinars());
        if (u == 0 && a == 0 && w == 0) {
            return "No tracked deadlines are approaching this week. "
                    + "Explore new programmes and scholarships on InsightNest to plan ahead.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("This week: ").append(u).append(" urgent, ")
                .append(a).append(" approaching, ").append(w).append(" webinar(s).");
        appendItems(sb, "Urgent", digest.urgent());
        appendItems(sb, "Approaching", digest.approaching());
        sb.append(" Open the Digest page for the full bulletin.");
        return sb.toString();
    }

    private static void appendItems(StringBuilder sb, String label, List<DigestItem> items) {
        if (items == null || items.isEmpty()) {
            return;
        }
        sb.append(" ").append(label).append(": ");
        int shown = Math.min(3, items.size());
        for (int i = 0; i < shown; i++) {
            DigestItem item = items.get(i);
            if (i > 0) {
                sb.append("; ");
            }
            sb.append(item.title());
            if (item.deadline() != null) {
                sb.append(" (").append(item.deadline()).append(")");
            }
        }
        sb.append(".");
    }

    private static int sizeOf(List<?> list) {
        return list == null ? 0 : list.size();
    }
}
