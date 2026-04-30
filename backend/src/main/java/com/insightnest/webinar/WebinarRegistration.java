package com.insightnest.webinar;

import com.insightnest.common.BaseEntity;
import com.insightnest.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "webinar_registrations")
public class WebinarRegistration extends BaseEntity {
    @ManyToOne
    private Webinar webinar;

    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private WebinarRegistrationStatus status = WebinarRegistrationStatus.REGISTERED;

    public Webinar getWebinar() {
        return webinar;
    }

    public void setWebinar(Webinar webinar) {
        this.webinar = webinar;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WebinarRegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(WebinarRegistrationStatus status) {
        this.status = status;
    }
}
