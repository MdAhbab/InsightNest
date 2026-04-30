# InsightNest: Development-Ready Project Specification

**Slogan:** Insight for your higher studies.

**Preferred Domain Direction:** Use a simple `.com` domain for broad public reach. Keep `.study`, `.academy`, and `.org` as backup options. Do not use `.edu` unless the team can meet education-domain eligibility rules.

**Team Members:**
- Md Ahbab Hamid Khan (0112230869)
- Samiul Ahmed Tamim (0112230689)
- Md. Jamiul Hasan Shishir (0112230871)

**Technology Stack:**
- **Frontend:** React
- **Backend:** Java Spring Boot
- **Database:** MySQL
- **Authentication:** JWT-based authentication with role-based access control
- **File Storage:** Local storage for development; configurable cloud/object storage for production

## 1. Project Overview

InsightNest is an academic opportunity platform for learners, faculty, and administrators. It helps users discover universities and programs, apply for programs and scholarships, collaborate on research, access academic resources, participate in forums, and attend webinars.

**Vision:** To create a global academic ecosystem that improves access to education, research, collaboration, and academic funding.

**Mission:** To empower learners and faculty with practical tools that make higher-study planning, academic networking, and research collaboration easier.

**Primary Users:**
- **Public Visitor:** Browses public information without login.
- **Learner:** Builds a profile, applies to programs/scholarships, joins research, uses resources, and participates in community features.
- **Faculty:** Publishes academic profile details, creates research projects, manages join requests, uploads resources, and hosts webinars.
- **Admin:** Manages users, platform content, applications, moderation, settings, and reports.

## 2. Scope and Release Phases

### 2.1 MVP Scope

The MVP must include only the features required for a usable academic platform:
- Authentication and role-based access.
- Public university and program directory.
- Learner and faculty profile management.
- University program applications.
- Scholarship listing and scholarship applications.
- Research project listing, creation, and join-request workflow.
- Resource library with upload/download support.
- Community forum with threads and comments.
- Webinar listing and registration.
- Admin dashboard for moderation, approvals, and user management.
- Contact form and FAQ pages.

### 2.2 Phase 2 Scope

Add after the MVP is stable:
- Job board with 30-day auto-expire behavior.
- Academic loan application workflow.
- Textbook physical/digital loan workflow.
- Notifications for application, research, webinar, and moderation updates.
- Saved universities, saved programs, and saved scholarships.
- Improved dashboard analytics summaries.
- Faculty data-correction suggestions for university/program/research paper information.

### 2.3 Future Scope

Keep these outside MVP unless the team has extra time:
- AI-enhanced academic chat assistant.
- Gamification with points, badges, and achievements.
- Advanced cross-platform search with recommendations.
- Personalized newsfeed.
- Advanced learner/faculty analytics.
- Publisher partnership flow for premium journals.
- Live chat rooms beyond basic community messaging.

## 3. Theme and UI/UX Guidelines

### 3.1 Color Palette

**Primary Colors**
- **Deep Blue (#2B3A67):** Header, sidebar, navigation, primary buttons.
- **Soft White (#F9FAFB):** Main page backgrounds and content areas.
- **Vibrant Green (#3CB371):** Success states and positive status indicators.
- **Golden Yellow (#F9A825):** Highlight badges and important prompts.

**Secondary Colors**
- **Steel Grey (#6C757D):** Secondary text, borders, helper text.
- **Crisp Red (#E13946):** Errors, destructive actions, rejected statuses.
- **Cool Cyan (#00BFFF):** Links and hover/focus states.

### 3.2 Design Principles

- Keep dashboards clean, practical, and information-dense.
- Use clear spacing, predictable navigation, and readable typography.
- Use consistent status colors across the whole app.
- All forms must show required fields, validation errors, and success/error messages.
- Every table must support pagination and meaningful empty states.
- Every page must work on mobile, tablet, and desktop.
- All interactive controls must have visible focus states for keyboard users.

## 4. Feature Requirements by Role

### 4.1 Public Visitor Features

- Browse universities with filters by country, city, department, program type, and ranking.
- Browse programs and view linked universities.
- View scholarships and eligibility criteria.
- View public research projects.
- View public resources and book lists.
- Read forum threads but cannot post without login.
- View webinar listings.
- Read FAQ, About, Contact, and Services pages.
- Submit a contact request with name, email, subject, and message.

### 4.2 Learner Features

- Register, login, logout, reset password, and manage account settings.
- Maintain learner profile: education history, CGPA, IELTS score, projects, publications, hobbies, nationality, social links, and bio.
- Browse and apply to university programs.
- Track program application statuses.
- Browse and apply for scholarships.
- Track scholarship application statuses.
- Propose research projects or request to join existing projects.
- Download resources and request textbook loans in Phase 2.
- Create forum threads and comments.
- Register for webinars.
- View dashboard summary of applications, research requests, webinars, and saved items.

### 4.3 Faculty Features

- Register or be created by admin, login, logout, and manage account settings.
- Maintain faculty profile: expertise, research interests, department, website, LinkedIn, taught courses, and publications.
- Create, update, open, and close research projects.
- Review learner join requests for faculty-owned research projects.
- Upload research papers and academic resources.
- Recommend course materials.
- Create and manage webinars.
- Participate in forums.
- Suggest data corrections for university, program, or academic paper records in Phase 2.

### 4.4 Admin Features

- Manage learners, faculty, and admin users.
- Suspend, reactivate, or soft-delete users.
- Create, edit, archive, and restore universities and programs.
- Manage scholarships and review scholarship applications.
- Review university program applications where platform approval is required.
- Moderate forum threads and comments.
- Moderate uploaded resources.
- Manage webinars and registrations.
- Manage FAQs and contact requests.
- View audit logs, activity summaries, and backup status.
- Export reports for applications, users, scholarships, research projects, and webinars.

## 5. Role Permission Matrix

| Module | Public | Learner | Faculty | Admin |
|---|---|---|---|---|
| Universities | View | View, save | View, suggest correction | Create, update, archive |
| Programs | View | View, apply, save | View, suggest correction | Create, update, archive |
| Learner Profile | None | Create, view, update own | View limited public profile | View, update, suspend |
| Faculty Profile | View public profile | View public profile | Create, view, update own | View, update, suspend |
| Scholarships | View | Apply, track own | View | Create, update, approve/reject applications |
| Program Applications | None | Create, track own | View only if assigned later | Review/manage |
| Research Projects | View public | Create, request join, comment if member | Create, manage owned projects, approve requests | Moderate/archive |
| Resources | View public | Upload, download, manage own uploads | Upload, download, manage own uploads | Approve, archive, delete |
| Forums | Read | Create, comment, edit own | Create, comment, edit own | Moderate/archive |
| Webinars | View | Register, cancel own registration | Create, update owned webinars | Manage all webinars |
| Users | None | Manage own account | Manage own account | Create, update, suspend, delete |
| Reports | None | None | View own project/webinar summaries | View/export platform reports |

## 6. Navigation and User Flows

### 6.1 Public Flow

```text
Homepage
  -> Search Universities
    -> University Detail
      -> Program Detail
        -> Login/Register to Apply
  -> Scholarships
    -> Scholarship Detail
      -> Login/Register to Apply
  -> Research Projects
    -> Project Detail
      -> Login/Register to Request Join
  -> Resources
    -> Resource Detail
      -> Login/Register to Download if restricted
  -> Forums
    -> Thread Detail
      -> Login/Register to Comment
  -> Webinars
    -> Webinar Detail
      -> Login/Register to Register
  -> FAQ / Contact / About / Services
```

### 6.2 Learner Flow

```text
Login
  -> Learner Dashboard
    -> Complete/Edit Profile
    -> Browse Universities and Programs
      -> Submit Program Application
      -> Track Application Status
    -> Browse Scholarships
      -> Submit Scholarship Application
      -> Track Scholarship Status
    -> Browse Research Projects
      -> Request to Join Project
      -> Track Join Request
    -> Resource Library
      -> Download Resource / Upload Resource
    -> Forums
      -> Create Thread / Comment
    -> Webinars
      -> Register / Cancel Registration
    -> Notifications
    -> Account Settings
```

### 6.3 Faculty Flow

```text
Login
  -> Faculty Dashboard
    -> Complete/Edit Profile
    -> My Research Projects
      -> Create Project
      -> Review Join Requests
      -> Update Project Status
    -> Resource Library
      -> Upload Research Paper / Course Material
    -> Webinars
      -> Create Webinar
      -> Manage Registrations
    -> Forums
      -> Create Thread / Comment
    -> Data Correction Suggestions
    -> Notifications
    -> Account Settings
```

### 6.4 Admin Flow

```text
Login
  -> Admin Dashboard
    -> User Management
    -> University and Program Management
    -> Scholarship Management
    -> Application Review Queues
    -> Research Project Moderation
    -> Resource Moderation
    -> Forum Moderation
    -> Webinar Management
    -> FAQ and Contact Management
    -> Reports and Audit Logs
    -> System Settings and Backups
```

### 6.5 Research Collaboration Flow

```text
Faculty or Learner creates project
  -> Project appears as Open after approval rule is satisfied
  -> Learner views project detail
  -> Learner submits join request with message and skills
  -> Project owner reviews request
    -> Approve: learner becomes project member
    -> Reject: learner receives reason
  -> Members can view project resources and updates
  -> Owner closes or archives project when complete
```

### 6.6 Application Flow

```text
Learner selects program or scholarship
  -> System checks profile completeness
  -> Learner fills application form
  -> System validates required data and deadline
  -> Application is submitted as Pending
  -> Admin reviews
    -> Approved / Rejected / Needs Info
  -> Learner receives notification and sees status on dashboard
```

## 7. Page-Level Requirements

### 7.1 Homepage

**Purpose:** Give public users immediate access to universities, programs, scholarships, research, resources, and webinars.

**Visible Data:**
- Search bar.
- Featured universities.
- Open scholarships.
- Recent research projects.
- Upcoming webinars.
- FAQ/contact entry points.

**Actions:**
- Search.
- Filter.
- View details.
- Login/register.

**Empty State:** Show helpful text and direct users to browse all universities, scholarships, or resources.

### 7.2 Login and Registration

**Fields:**
- Registration: name, email, password, confirm password, role.
- Login: email and password.

**Validation:**
- Email must be valid and unique.
- Password minimum 8 characters.
- Password and confirm password must match.
- Role must be learner or faculty for self-registration.
- Admin accounts must be created by an existing admin.

**Success State:** Redirect user to role-specific dashboard.

**Error State:** Show invalid credentials, duplicate email, disabled account, or validation messages.

### 7.3 University Directory

**Visible Data:**
- University name, country, city, ranking, website, available programs.

**Filters:**
- Country.
- City.
- Department.
- Program type.
- Ranking range.

**Actions:**
- View university.
- View programs.
- Save university after login.

**Empty State:** Show "No universities match your filters" and a clear reset-filter action.

### 7.4 Program Detail and Application

**Visible Data:**
- Program name, type, department, duration, description, university, scholarships, loan option if available.

**Application Fields:**
- Education summary.
- Statement of purpose.
- Supporting document upload.
- Optional notes.

**Validation:**
- Learner must be logged in.
- Profile must include required education data.
- Supporting documents must match allowed file types.
- Duplicate active application for same program is not allowed.

### 7.5 Learner Dashboard

**Visible Data:**
- Profile completion percentage.
- Pending program applications.
- Pending scholarship applications.
- Research join requests.
- Upcoming webinars.
- Recent notifications.

**Actions:**
- Complete profile.
- Continue application.
- View status.
- Browse opportunities.

### 7.6 Faculty Dashboard

**Visible Data:**
- Owned research projects.
- Pending join requests.
- Uploaded resources.
- Upcoming webinars.
- Recent notifications.

**Actions:**
- Create project.
- Review join requests.
- Upload resource.
- Create webinar.

### 7.7 Admin Dashboard

**Visible Data:**
- Total users by role.
- Pending applications.
- Pending moderation items.
- Open scholarships.
- Upcoming webinars.
- Recent audit log entries.

**Actions:**
- Review queues.
- Manage records.
- Export reports.
- Create FAQ.
- Resolve contact requests.

### 7.8 Research Project Pages

**Visible Data:**
- Title, owner, research area, description, project status, funding status, members, created date.

**Actions:**
- Create project.
- Edit own project.
- Request to join.
- Approve/reject requests.
- Close/archive project.

**Validation:**
- Title and research area are required.
- Join request message is required.
- Only project owner or admin can approve/reject requests.

### 7.9 Resource Library

**Visible Data:**
- Title, category, uploaded by, file type, visibility, upload date, download count.

**Actions:**
- Search resources.
- Filter by category, department, program, file type.
- Upload resource.
- Download resource.
- Admin approve/archive resource.

**Validation:**
- Allowed file types: PDF, DOC, DOCX, PPT, PPTX.
- Maximum file size: 20 MB.
- Title and category are required.

### 7.10 Forums

**Visible Data:**
- Thread title, author, status, comment count, created date, latest activity.

**Actions:**
- Create thread.
- Edit own thread before archived.
- Comment.
- Admin archive thread or comment.

**Validation:**
- Title and body are required.
- Archived threads cannot receive new comments.

### 7.11 Webinars

**Visible Data:**
- Title, host, description, start date, end date, registration status, capacity.

**Actions:**
- Register.
- Cancel registration.
- Faculty create/update own webinar.
- Admin manage all webinars.

**Validation:**
- End date must be after start date.
- Registration closes after start date.
- Capacity cannot be negative.

## 8. Spring Boot API Plan

Use `/api/v1` as the base path. All protected endpoints require JWT authentication.

### 8.1 Authentication

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register learner/faculty |
| POST | `/api/v1/auth/login` | Public | Login and return token |
| POST | `/api/v1/auth/logout` | Authenticated | Invalidate/logout token client-side or server-side if token blacklist is used |
| POST | `/api/v1/auth/password-reset/request` | Public | Request password reset |
| POST | `/api/v1/auth/password-reset/confirm` | Public | Confirm password reset |
| GET | `/api/v1/auth/me` | Authenticated | Return current user profile summary |

### 8.2 Users and Profiles

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/users` | Admin | List users |
| POST | `/api/v1/users` | Admin | Create user manually |
| PATCH | `/api/v1/users/{id}/status` | Admin | Suspend/reactivate user |
| GET | `/api/v1/learners/me` | Learner | View own learner profile |
| PUT | `/api/v1/learners/me` | Learner | Update own learner profile |
| GET | `/api/v1/faculty/{id}` | Public | View public faculty profile |
| GET | `/api/v1/faculty/me` | Faculty | View own faculty profile |
| PUT | `/api/v1/faculty/me` | Faculty | Update own faculty profile |

### 8.3 Universities, Programs, and Scholarships

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/universities` | Public | List/filter universities |
| GET | `/api/v1/universities/{id}` | Public | View university detail |
| POST | `/api/v1/universities` | Admin | Create university |
| PUT | `/api/v1/universities/{id}` | Admin | Update university |
| GET | `/api/v1/programs` | Public | List/filter programs |
| GET | `/api/v1/programs/{id}` | Public | View program detail |
| POST | `/api/v1/programs` | Admin | Create program |
| PUT | `/api/v1/programs/{id}` | Admin | Update program |
| GET | `/api/v1/scholarships` | Public | List/filter scholarships |
| GET | `/api/v1/scholarships/{id}` | Public | View scholarship detail |
| POST | `/api/v1/scholarships` | Admin | Create scholarship |
| PUT | `/api/v1/scholarships/{id}` | Admin | Update scholarship |

### 8.4 Applications

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/program-applications` | Learner | Apply to a program |
| GET | `/api/v1/program-applications/me` | Learner | List own program applications |
| GET | `/api/v1/program-applications` | Admin | List/review all program applications |
| PATCH | `/api/v1/program-applications/{id}/status` | Admin | Approve/reject/request info |
| POST | `/api/v1/scholarship-applications` | Learner | Apply for scholarship |
| GET | `/api/v1/scholarship-applications/me` | Learner | List own scholarship applications |
| GET | `/api/v1/scholarship-applications` | Admin | List/review all scholarship applications |
| PATCH | `/api/v1/scholarship-applications/{id}/status` | Admin | Approve/reject/request info |

### 8.5 Research, Resources, Forums, and Webinars

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/research-projects` | Public | List public projects |
| POST | `/api/v1/research-projects` | Learner/Faculty | Create project |
| PUT | `/api/v1/research-projects/{id}` | Owner/Admin | Update project |
| POST | `/api/v1/research-projects/{id}/join-requests` | Learner | Request to join |
| PATCH | `/api/v1/research-join-requests/{id}/status` | Owner/Admin | Approve/reject join request |
| GET | `/api/v1/resources` | Public/Auth | List resources |
| POST | `/api/v1/resources` | Learner/Faculty | Upload resource |
| PATCH | `/api/v1/resources/{id}/status` | Admin | Approve/archive resource |
| GET | `/api/v1/forums/threads` | Public | List threads |
| POST | `/api/v1/forums/threads` | Learner/Faculty/Admin | Create thread |
| POST | `/api/v1/forums/threads/{id}/comments` | Authenticated | Add comment |
| PATCH | `/api/v1/forums/threads/{id}/status` | Admin | Archive/restore thread |
| GET | `/api/v1/webinars` | Public | List webinars |
| POST | `/api/v1/webinars` | Faculty/Admin | Create webinar |
| POST | `/api/v1/webinars/{id}/registrations` | Learner/Faculty | Register |
| DELETE | `/api/v1/webinars/{id}/registrations/me` | Learner/Faculty | Cancel own registration |

### 8.6 Admin, Support, and Reports

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | Admin | Dashboard counts and summaries |
| GET | `/api/v1/admin/audit-logs` | Admin | List audit logs |
| GET | `/api/v1/admin/reports/{type}` | Admin | Export report |
| GET | `/api/v1/faqs` | Public | List active FAQs |
| POST | `/api/v1/faqs` | Admin | Create FAQ |
| PUT | `/api/v1/faqs/{id}` | Admin | Update FAQ |
| POST | `/api/v1/contacts` | Public/Auth | Submit contact request |
| GET | `/api/v1/contacts` | Admin | List contact requests |
| PATCH | `/api/v1/contacts/{id}/status` | Admin | Mark pending/resolved/closed |

## 9. Validation and Error Handling

### 9.1 Common Validation Rules

- Names: 2 to 100 characters.
- Email: valid format, unique for users.
- Password: minimum 8 characters.
- CGPA: 0.00 to 4.00.
- IELTS score: 0.0 to 9.0.
- URLs: must start with `http://` or `https://`.
- Dates: deadline cannot be before current date when creating open items.
- Webinar end date must be later than start date.
- File upload: PDF, DOC, DOCX, PPT, PPTX; maximum 20 MB.
- Pagination: default page size 10, maximum page size 100.

### 9.2 Standard API Error Response

```json
{
  "timestamp": "2026-05-01T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Email is already registered",
  "path": "/api/v1/auth/register"
}
```

### 9.3 Required Error Cases

- `400 Bad Request`: validation failure or invalid status transition.
- `401 Unauthorized`: missing or invalid token.
- `403 Forbidden`: authenticated user does not have permission.
- `404 Not Found`: requested record does not exist or is archived.
- `409 Conflict`: duplicate email, duplicate application, duplicate registration.
- `413 Payload Too Large`: uploaded file exceeds limit.
- `500 Internal Server Error`: unexpected server error, logged internally.

## 10. Database Schema (Normalized MySQL)

The database must use foreign keys, indexes, consistent audit fields, and clear table names. Avoid storing multiple related values in raw `TEXT` fields when those values need filtering, joining, or permissions.

### 10.1 Users and Profiles

```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('learner', 'faculty', 'admin') NOT NULL,
  status ENUM('active', 'suspended', 'deleted') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE learner_profiles (
  learner_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  current_university VARCHAR(255) NULL,
  undergrad_university VARCHAR(255) NULL,
  undergrad_cgpa DECIMAL(3,2) NULL,
  postgrad_university VARCHAR(255) NULL,
  postgrad_cgpa DECIMAL(3,2) NULL,
  ielts_score DECIMAL(2,1) NULL,
  nationality VARCHAR(100) NULL,
  date_of_birth DATE NULL,
  bio VARCHAR(500) NULL,
  facebook_url VARCHAR(255) NULL,
  twitter_url VARCHAR(255) NULL,
  linkedin_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE faculty_profiles (
  faculty_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department VARCHAR(100) NULL,
  area_of_expertise VARCHAR(255) NULL,
  research_interests TEXT NULL,
  linkedin_url VARCHAR(255) NULL,
  website_url VARCHAR(255) NULL,
  bio VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE learner_projects (
  learner_project_id INT AUTO_INCREMENT PRIMARY KEY,
  learner_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  project_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (learner_id) REFERENCES learner_profiles(learner_id)
);

CREATE TABLE faculty_courses (
  faculty_course_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  department VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id)
);

CREATE TABLE faculty_publications (
  publication_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  publication_url VARCHAR(255) NULL,
  published_year INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty_profiles(faculty_id)
);
```

### 10.2 Universities and Programs

```sql
CREATE TABLE universities (
  university_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  local_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  website_url VARCHAR(255) NULL,
  contact_email VARCHAR(150) NULL,
  contact_phone VARCHAR(30) NULL,
  established_year INT NULL,
  ranking INT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_universities_country_city (country, city),
  INDEX idx_universities_ranking (ranking)
);

CREATE TABLE programs (
  program_id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(255) NOT NULL,
  program_description TEXT NULL,
  program_type ENUM('undergraduate', 'postgraduate') NOT NULL,
  department VARCHAR(100) NULL,
  duration_years INT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_programs_type_department (program_type, department)
);

CREATE TABLE university_programs (
  university_program_id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  program_id INT NOT NULL,
  tuition_fee DECIMAL(12,2) NULL,
  application_deadline DATE NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_university_program (university_id, program_id),
  FOREIGN KEY (university_id) REFERENCES universities(university_id),
  FOREIGN KEY (program_id) REFERENCES programs(program_id)
);
```

### 10.3 Applications, Scholarships, and Loans

```sql
CREATE TABLE program_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  learner_id INT NOT NULL,
  university_program_id INT NOT NULL,
  statement_of_purpose TEXT NOT NULL,
  supporting_document_url VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected', 'needs_info', 'withdrawn') NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_active_program_application (learner_id, university_program_id, status),
  FOREIGN KEY (learner_id) REFERENCES learner_profiles(learner_id),
  FOREIGN KEY (university_program_id) REFERENCES university_programs(university_program_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

CREATE TABLE scholarships (
  scholarship_id INT AUTO_INCREMENT PRIMARY KEY,
  university_program_id INT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  amount DECIMAL(12,2) NULL,
  eligibility_criteria TEXT NULL,
  application_deadline DATE NULL,
  application_url VARCHAR(255) NULL,
  status ENUM('open', 'closed', 'archived') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (university_program_id) REFERENCES university_programs(university_program_id),
  INDEX idx_scholarships_deadline_status (application_deadline, status)
);

CREATE TABLE scholarship_applications (
  scholarship_application_id INT AUTO_INCREMENT PRIMARY KEY,
  scholarship_id INT NOT NULL,
  learner_id INT NOT NULL,
  motivation_text TEXT NOT NULL,
  supporting_document_url VARCHAR(255) NULL,
  status ENUM('pending', 'approved', 'rejected', 'needs_info', 'withdrawn') NOT NULL DEFAULT 'pending',
  admin_note TEXT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_learner_scholarship (scholarship_id, learner_id),
  FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id),
  FOREIGN KEY (learner_id) REFERENCES learner_profiles(learner_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

CREATE TABLE university_loan_options (
  loan_option_id INT AUTO_INCREMENT PRIMARY KEY,
  university_program_id INT NOT NULL,
  loan_type ENUM('local', 'international', 'digital') NOT NULL,
  loan_status ENUM('available', 'on_hold', 'closed') NOT NULL DEFAULT 'available',
  loans_given_count INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_program_loan_type (university_program_id, loan_type),
  FOREIGN KEY (university_program_id) REFERENCES university_programs(university_program_id)
);

CREATE TABLE academic_loan_applications (
  academic_loan_application_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_option_id INT NOT NULL,
  learner_id INT NOT NULL,
  requested_amount DECIMAL(12,2) NULL,
  status ENUM('pending', 'approved', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT NULL,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (loan_option_id) REFERENCES university_loan_options(loan_option_id),
  FOREIGN KEY (learner_id) REFERENCES learner_profiles(learner_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);
```

### 10.4 Research and Resources

```sql
CREATE TABLE research_projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  owner_id INT NOT NULL,
  description TEXT NULL,
  research_area VARCHAR(150) NOT NULL,
  associated_program_id INT NULL,
  project_type ENUM('research', 'collaborative') NOT NULL DEFAULT 'collaborative',
  status ENUM('open', 'closed', 'archived') NOT NULL DEFAULT 'open',
  funding_status ENUM('none', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'none',
  funding_amount DECIMAL(12,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id),
  FOREIGN KEY (associated_program_id) REFERENCES programs(program_id),
  INDEX idx_research_status_area (status, research_area)
);

CREATE TABLE research_project_members (
  project_member_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  member_role ENUM('owner', 'member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_project_member (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES research_projects(project_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE research_join_requests (
  join_request_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  learner_id INT NOT NULL,
  request_message TEXT NOT NULL,
  skills_summary TEXT NULL,
  status ENUM('pending', 'approved', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  owner_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  UNIQUE KEY uk_project_learner_request (project_id, learner_id),
  FOREIGN KEY (project_id) REFERENCES research_projects(project_id),
  FOREIGN KEY (learner_id) REFERENCES learner_profiles(learner_id)
);

CREATE TABLE resources (
  resource_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category ENUM('book', 'paper', 'template', 'guide', 'slides', 'other') NOT NULL,
  department VARCHAR(100) NULL,
  program_id INT NULL,
  uploaded_by INT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  visibility ENUM('public', 'authenticated', 'project_only') NOT NULL DEFAULT 'public',
  status ENUM('pending', 'approved', 'archived', 'rejected') NOT NULL DEFAULT 'pending',
  download_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(program_id),
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

CREATE TABLE textbook_loans (
  textbook_loan_id INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id INT NOT NULL,
  resource_id INT NULL,
  book_title VARCHAR(200) NOT NULL,
  loan_type ENUM('physical', 'digital') NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('requested', 'approved', 'loaned', 'returned', 'rejected', 'overdue') NOT NULL DEFAULT 'requested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (borrower_id) REFERENCES users(user_id),
  FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);
```

### 10.5 Community, Webinars, Support, and Notifications

```sql
CREATE TABLE forum_threads (
  thread_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE forum_comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  user_id INT NOT NULL,
  body TEXT NOT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES forum_threads(thread_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE chat_rooms (
  chat_room_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  room_type ENUM('community', 'project') NOT NULL DEFAULT 'community',
  project_id INT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES research_projects(project_id)
);

CREATE TABLE chat_messages (
  chat_message_id INT AUTO_INCREMENT PRIMARY KEY,
  chat_room_id INT NOT NULL,
  sender_id INT NOT NULL,
  message_content TEXT NOT NULL,
  status ENUM('active', 'archived', 'deleted') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(chat_room_id),
  FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

CREATE TABLE job_postings (
  job_post_id INT AUTO_INCREMENT PRIMARY KEY,
  employer_id INT NOT NULL,
  job_title VARCHAR(200) NOT NULL,
  job_description TEXT NOT NULL,
  location VARCHAR(100) NULL,
  salary DECIMAL(12,2) NULL,
  qualifications TEXT NULL,
  post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deadline DATE NULL,
  status ENUM('active', 'expired', 'archived') NOT NULL DEFAULT 'active',
  FOREIGN KEY (employer_id) REFERENCES users(user_id),
  INDEX idx_job_deadline (deadline)
);

CREATE TABLE webinars (
  webinar_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  owner_id INT NOT NULL,
  description TEXT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  registration_url VARCHAR(255) NULL,
  capacity INT NULL,
  status ENUM('open', 'closed', 'archived') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id),
  INDEX idx_webinar_start_date (start_date)
);

CREATE TABLE webinar_registrations (
  webinar_registration_id INT AUTO_INCREMENT PRIMARY KEY,
  webinar_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('registered', 'cancelled', 'attended', 'missed') NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_webinar_user (webinar_id, user_id),
  FOREIGN KEY (webinar_id) REFERENCES webinars(webinar_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE faqs (
  faq_id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_by INT NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE contacts (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
  audit_log_id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(user_id)
);
```

### 10.6 Reviews and Saved Items

```sql
CREATE TABLE university_reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  university_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL,
  review_text TEXT NULL,
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_university_user_review (university_id, user_id),
  FOREIGN KEY (university_id) REFERENCES universities(university_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE saved_items (
  saved_item_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('university', 'program', 'scholarship', 'research_project', 'webinar') NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_saved_item (user_id, item_type, item_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

## 11. Non-Functional Requirements

### 11.1 Security

- Store only hashed passwords using BCrypt.
- Use JWT for authenticated API requests.
- Enforce role-based authorization on backend endpoints.
- Validate all request payloads on the backend.
- Sanitize user-generated content before display.
- Never expose password hashes, reset tokens, or internal error stack traces.
- Rate-limit login and password reset attempts.
- Use HTTPS in production.

### 11.2 Performance

- Use pagination for all list endpoints.
- Add indexes for common filters and sorts.
- Keep file downloads separate from JSON API responses.
- Cache public static reference data where useful.
- Search endpoints must support keyword query plus filters.

### 11.3 Accessibility and Responsiveness

- Support keyboard navigation.
- Use labels for all form fields.
- Maintain sufficient color contrast.
- Provide readable error text, not color-only errors.
- Design for mobile, tablet, and desktop.

### 11.4 Logging and Backups

- Log login attempts, admin actions, moderation actions, application status changes, and file uploads.
- Maintain daily database backups in production.
- Keep audit logs for all admin changes.
- Store backup status so admin can verify latest successful backup.

## 12. Frontend Implementation Notes

### 12.1 Suggested React Structure

```text
src/
  api/
  components/
  features/
    auth/
    dashboard/
    universities/
    programs/
    scholarships/
    applications/
    research/
    resources/
    forums/
    webinars/
    admin/
  layouts/
  routes/
  utils/
```

### 12.2 Required UI Components

- App layout with public navigation and authenticated dashboard layout.
- Protected route component.
- Role-based navigation menu.
- Search/filter panel.
- Paginated data table.
- Form input components with validation messages.
- Modal confirmation dialog.
- Toast notification component.
- Empty state component.
- Loading spinner/skeleton.
- File upload component.
- Status badge component.

## 13. Backend Implementation Notes

### 13.1 Suggested Spring Boot Packages

```text
com.insightnest
  auth
  config
  user
  profile
  university
  program
  scholarship
  application
  research
  resource
  forum
  webinar
  admin
  notification
  audit
  common
```

### 13.2 Required Backend Layers

Each feature module should use:
- Controller for HTTP endpoints.
- Service for business logic.
- Repository for database access.
- DTOs for request/response payloads.
- Entity classes for database tables.
- Mapper methods or classes for entity/DTO conversion.

### 13.3 Business Rules

- Users with `suspended` or `deleted` status cannot login.
- Learners cannot apply twice to the same program while an active application exists.
- Learners cannot apply to a scholarship after the deadline.
- Faculty can only manage their own research projects and webinars unless the user is admin.
- Admin can archive records instead of hard-deleting them.
- Archived forum threads cannot receive new comments.
- Webinar registration is blocked after the start date or when capacity is full.
- Resource downloads are allowed only if resource status is approved and visibility permits access.

## 14. Testing and Acceptance Criteria

### 14.1 Unit Tests

- Auth service: registration, login, password hashing, suspended user rejection.
- Role permission service: learner/faculty/admin access checks.
- Program application service: duplicate prevention and status transitions.
- Scholarship service: deadline validation.
- Research service: join-request approval/rejection.
- Webinar service: registration rules and capacity checks.

### 14.2 API Tests

- CRUD operations for universities, programs, scholarships, resources, forums, and webinars.
- Validation errors for required fields and invalid formats.
- Unauthorized access without token.
- Forbidden access with wrong role.
- Pagination, filtering, sorting, and search behavior.
- File upload success and file upload rejection.

### 14.3 Database Tests

- Foreign keys prevent orphan records.
- Unique constraints prevent duplicate users, duplicate applications, duplicate webinar registrations, and duplicate reviews.
- Indexes exist for common searches.
- Seed data loads successfully.

### 14.4 Frontend Tests

- Login and registration forms.
- Role-based dashboard routing.
- Directory search and filter behavior.
- Application form validation.
- Admin moderation workflow.
- Empty, loading, success, and error states.

### 14.5 Acceptance Criteria by Role

**Public Visitor**
- Can browse universities, programs, scholarships, public research, forums, resources, webinars, FAQ, and contact pages.
- Cannot create applications, comments, downloads with restricted visibility, or registrations without login.

**Learner**
- Can complete profile, apply to programs/scholarships, request to join research, upload/download allowed resources, post in forums, and register for webinars.
- Can view all own application and request statuses.

**Faculty**
- Can complete profile, create research projects, review join requests for owned projects, upload resources, create webinars, and participate in forums.

**Admin**
- Can manage users, universities, programs, scholarships, applications, research moderation, resources, forums, webinars, FAQs, contacts, reports, audit logs, and backups.

## 15. Seed Data Requirements

Provide initial seed data for development:
- 1 admin user.
- 3 learner users.
- 3 faculty users.
- 5 universities across different countries.
- 10 programs.
- 10 university-program mappings.
- 5 scholarships.
- 5 research projects.
- 10 resources.
- 5 forum threads with comments.
- 5 webinars.
- 5 FAQs.

Seed passwords must be documented for local development only and must be changed in production.

## 16. Open Decisions for the Team

These decisions should be finalized before coding starts:
- Final domain name.
- Whether program applications are only tracked inside InsightNest or submitted directly to universities.
- Whether scholarships are internal platform applications, external links, or both.
- File storage provider for production.
- Whether email notifications are required in MVP or only in-app notifications.
- Whether academic loan and textbook loan workflows are Phase 2 or MVP.

