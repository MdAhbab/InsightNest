package com.insightnest.forum;

import com.insightnest.common.BaseEntity;
import com.insightnest.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "forum_comments")
public class ForumComment extends BaseEntity {
    @ManyToOne
    private ForumThread thread;

    @Column(columnDefinition = "TEXT")
    private String body;

    @ManyToOne
    private User author;

    public ForumThread getThread() {
        return thread;
    }

    public void setThread(ForumThread thread) {
        this.thread = thread;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }
}
