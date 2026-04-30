-- InsightNest seed data (Bangladesh focused)
-- Password for all seeded users: Admin@123
-- Run after the Spring Boot app has created/updated the MySQL schema.

SET @now = NOW();

-- ---------------------------------------------------------------------------
-- Rerun cleanup for this seed set. Child rows are removed before parent rows
-- so foreign-key constraints stay happy on repeated imports.
-- ---------------------------------------------------------------------------
DELETE FROM refresh_tokens
WHERE user_id IN (
    SELECT id FROM users
    WHERE email IN (
        'admin@insightnest.com',
        'nusrat.jahan@insightnest.com',
        'rafiul.islam@insightnest.com',
        'tanjila.akter@insightnest.com',
        'farhan.rahman@insightnest.com',
        'sabina.yasmin@insightnest.com'
    )
);

DELETE FROM webinar_registrations
WHERE webinar_id IN (SELECT id FROM webinars WHERE title IN ('Funding Pathways for Bangladesh', 'Research Skills for Bangladeshi Undergraduates', 'Public University Admission Q&A'))
   OR user_id IN (SELECT id FROM users WHERE email IN ('nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));
DELETE FROM webinars
WHERE title IN ('Funding Pathways for Bangladesh', 'Research Skills for Bangladeshi Undergraduates', 'Public University Admission Q&A');

DELETE FROM forum_comments
WHERE thread_id IN (SELECT id FROM forum_threads WHERE title IN ('Scholarship tips for Bangladesh', 'Choosing CSE programs in Dhaka'))
   OR author_id IN (SELECT id FROM users WHERE email IN ('nusrat.jahan@insightnest.com', 'farhan.rahman@insightnest.com', 'sabina.yasmin@insightnest.com'));
DELETE FROM forum_threads
WHERE title IN ('Scholarship tips for Bangladesh', 'Choosing CSE programs in Dhaka');

DELETE FROM resources
WHERE title IN ('Bangladesh Climate Data Guide', 'UGC Scholarship Checklist', 'Dhaka Research Proposal Template');

DELETE FROM research_join_requests
WHERE project_id IN (SELECT id FROM research_projects WHERE title IN ('Bangladesh Flood Prediction Lab', 'Urban Mobility Study - Dhaka', 'Bangla NLP Education Corpus'))
   OR requester_id IN (SELECT id FROM users WHERE email IN ('nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));
DELETE FROM research_projects
WHERE title IN ('Bangladesh Flood Prediction Lab', 'Urban Mobility Study - Dhaka', 'Bangla NLP Education Corpus');

DELETE FROM scholarship_applications
WHERE scholarship_id IN (
    SELECT id FROM scholarships
    WHERE title IN ('Bangladesh Government Merit Scholarship', 'Prime Bank Foundation Scholarship', 'ICT Division Innovation Scholarship', 'Dutch-Bangla Bank Scholarship', 'UGC Research Grant')
)
   OR learner_id IN (SELECT id FROM users WHERE email IN ('nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));

DELETE FROM program_applications
WHERE program_id IN (
    SELECT id FROM programs
    WHERE name IN ('BSc in Computer Science and Engineering', 'MBA in Finance', 'MSc in Data Science', 'BBA in Marketing', 'MPH in Public Health', 'BSc in Civil Engineering')
)
   OR learner_id IN (SELECT id FROM users WHERE email IN ('nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));

DELETE FROM learner_profiles
WHERE user_id IN (SELECT id FROM users WHERE email IN ('nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));
DELETE FROM faculty_profiles
WHERE user_id IN (SELECT id FROM users WHERE email IN ('farhan.rahman@insightnest.com', 'sabina.yasmin@insightnest.com'));

DELETE FROM user_roles
WHERE user_id IN (
    SELECT id FROM users
    WHERE email IN (
        'admin@insightnest.com',
        'nusrat.jahan@insightnest.com',
        'rafiul.islam@insightnest.com',
        'tanjila.akter@insightnest.com',
        'farhan.rahman@insightnest.com',
        'sabina.yasmin@insightnest.com'
    )
);

DELETE FROM programs
WHERE name IN ('BSc in Computer Science and Engineering', 'MBA in Finance', 'MSc in Data Science', 'BBA in Marketing', 'MPH in Public Health', 'BSc in Civil Engineering');
DELETE FROM scholarships
WHERE title IN ('Bangladesh Government Merit Scholarship', 'Prime Bank Foundation Scholarship', 'ICT Division Innovation Scholarship', 'Dutch-Bangla Bank Scholarship', 'UGC Research Grant');
DELETE FROM universities
WHERE name IN ('University of Dhaka', 'Bangladesh University of Engineering and Technology', 'BRAC University', 'North South University', 'Shahjalal University of Science and Technology', 'Rajshahi University');

DELETE FROM contact_requests
WHERE email IN ('student@insightnest.com', 'guardian@insightnest.com', 'faculty.office@insightnest.com');
DELETE FROM faqs
WHERE question IN ('How do I apply for Bangladeshi programs?', 'Can I submit multiple scholarship applications?', 'Are local Bangladeshi scholarships listed?');

-- ---------------------------------------------------------------------------
-- Users and roles
-- ---------------------------------------------------------------------------
INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Md Ahbab Hamid Khan', 'admin@insightnest.com', '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia', 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name), password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @admin_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Nusrat Jahan', 'nusrat.jahan@insightnest.com', '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia', 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name), password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @learner_nusrat_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Rafiul Islam', 'rafiul.islam@insightnest.com', '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia', 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name), password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @learner_rafiul_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Tanjila Akter', 'tanjila.akter@insightnest.com', '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia', 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name), password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @learner_tanjila_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Dr. Farhan Rahman', 'farhan.rahman@insightnest.com', '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia', 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name), password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @faculty_farhan_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Dr. Sabina Yasmin', 'sabina.yasmin@insightnest.com', '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia', 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name), password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @faculty_sabina_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, roles)
VALUES
    (@admin_id, 'ADMIN'),
    (@learner_nusrat_id, 'LEARNER'),
    (@learner_rafiul_id, 'LEARNER'),
    (@learner_tanjila_id, 'LEARNER'),
    (@faculty_farhan_id, 'FACULTY'),
    (@faculty_sabina_id, 'FACULTY');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
INSERT INTO learner_profiles (user_id, education_history, cgpa, ielts_score, projects, publications, hobbies, nationality, social_links, bio, created_at, updated_at)
VALUES
    (@learner_nusrat_id, 'BSc in Computer Science, University of Dhaka (2019-2023)', '3.82/4.00', '7.5', 'Smart Flood Alert System; Dhaka Air Quality Dashboard', 'IEEE Bangladesh Section student paper, 2024', 'Debate, chess', 'Bangladeshi', 'linkedin.com/in/nusrat-jahan', 'Aspiring data scientist focusing on climate resilience in Bangladesh.', @now, @now),
    (@learner_rafiul_id, 'HSC, Notre Dame College; BBA applicant from Dhaka', '4.92/5.00', '7.0', 'Campus admission tracker for Bangladeshi universities', 'None', 'Public speaking, volunteering', 'Bangladeshi', 'linkedin.com/in/rafiul-islam', 'Interested in finance, scholarships, and social impact programs.', @now, @now),
    (@learner_tanjila_id, 'BSc in Civil Engineering, Rajshahi University of Engineering and Technology', '3.68/4.00', '6.5', 'Low-cost water filter for northern Bangladesh', 'Undergraduate thesis on river erosion mitigation', 'Photography, science clubs', 'Bangladeshi', 'linkedin.com/in/tanjila-akter', 'Planning graduate study in public health and resilient infrastructure.', @now, @now);

INSERT INTO faculty_profiles (user_id, expertise, research_interests, department, website, linked_in, taught_courses, publications, bio, created_at, updated_at)
VALUES
    (@faculty_farhan_id, 'AI for Education', 'Learning analytics, fairness, adaptive systems', 'CSE, BUET', 'https://www.buet.ac.bd', 'linkedin.com/in/farhan-rahman', 'Machine Learning, Data Mining', 'Bangladesh Journal of AI, 2025', 'Faculty member leading human-centered AI initiatives.', @now, @now),
    (@faculty_sabina_id, 'Public Health Research', 'Urban health, climate adaptation, community surveys', 'Public Health, BRAC University', 'https://www.bracu.ac.bd', 'linkedin.com/in/sabina-yasmin', 'Epidemiology, Research Methods', 'Journal of Bangladesh Public Health, 2024', 'Research mentor for community health and climate resilience projects.', @now, @now);

-- ---------------------------------------------------------------------------
-- Universities
-- ---------------------------------------------------------------------------
INSERT INTO universities (name, country, city, ranking, website, description, archived, created_at, updated_at)
VALUES ('University of Dhaka', 'Bangladesh', 'Dhaka', 801, 'https://www.du.ac.bd', 'Leading public university in Bangladesh with strong arts, science, and business programs.', 0, @now, @now);
SET @uni_du = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, archived, created_at, updated_at)
VALUES ('Bangladesh University of Engineering and Technology', 'Bangladesh', 'Dhaka', 801, 'https://www.buet.ac.bd', 'Top engineering university in Bangladesh with competitive STEM programs.', 0, @now, @now);
SET @uni_buet = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, archived, created_at, updated_at)
VALUES ('BRAC University', 'Bangladesh', 'Dhaka', 1001, 'https://www.bracu.ac.bd', 'Private research-focused university known for public health, data science, and social impact work.', 0, @now, @now);
SET @uni_brac = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, archived, created_at, updated_at)
VALUES ('North South University', 'Bangladesh', 'Dhaka', 1201, 'https://www.northsouth.edu', 'Private university in Dhaka with business, economics, and computing programs.', 0, @now, @now);
SET @uni_nsu = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, archived, created_at, updated_at)
VALUES ('Shahjalal University of Science and Technology', 'Bangladesh', 'Sylhet', 1401, 'https://www.sust.edu', 'Public science and technology university serving learners across north-eastern Bangladesh.', 0, @now, @now);
SET @uni_sust = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, archived, created_at, updated_at)
VALUES ('Rajshahi University', 'Bangladesh', 'Rajshahi', 1501, 'https://www.ru.ac.bd', 'Major public university in northern Bangladesh with broad undergraduate and graduate offerings.', 0, @now, @now);
SET @uni_ru = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- Programs
-- ---------------------------------------------------------------------------
INSERT INTO programs (name, type, department, duration, description, application_deadline, university_id, archived, created_at, updated_at)
VALUES ('BSc in Computer Science and Engineering', 'Undergraduate', 'CSE', '4 years', 'Competitive CSE program with software engineering, AI, and systems labs.', DATE_ADD(CURDATE(), INTERVAL 45 DAY), @uni_buet, 0, @now, @now);
SET @prog_cse = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, university_id, archived, created_at, updated_at)
VALUES ('MBA in Finance', 'Graduate', 'Business Studies', '1.5 years', 'Finance-focused MBA with Bangladeshi banking and capital market case studies.', DATE_ADD(CURDATE(), INTERVAL 60 DAY), @uni_du, 0, @now, @now);
SET @prog_mba = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, university_id, archived, created_at, updated_at)
VALUES ('MSc in Data Science', 'Graduate', 'CSE', '2 years', 'Hands-on data science program using local public datasets and industry projects.', DATE_ADD(CURDATE(), INTERVAL 75 DAY), @uni_brac, 0, @now, @now);
SET @prog_ds = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, university_id, archived, created_at, updated_at)
VALUES ('BBA in Marketing', 'Undergraduate', 'School of Business', '4 years', 'Marketing program with coursework on Bangladeshi consumer behavior and digital commerce.', DATE_ADD(CURDATE(), INTERVAL 90 DAY), @uni_nsu, 0, @now, @now);
SET @prog_bba = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, university_id, archived, created_at, updated_at)
VALUES ('MPH in Public Health', 'Graduate', 'Public Health', '1 year', 'Public health program focused on urban health, nutrition, and climate adaptation in Bangladesh.', DATE_ADD(CURDATE(), INTERVAL 105 DAY), @uni_brac, 0, @now, @now);
SET @prog_mph = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, university_id, archived, created_at, updated_at)
VALUES ('BSc in Civil Engineering', 'Undergraduate', 'Civil Engineering', '4 years', 'Civil engineering program focused on transport, water resources, and resilient infrastructure.', DATE_ADD(CURDATE(), INTERVAL 120 DAY), @uni_sust, 1, @now, @now);
SET @prog_civil = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- Scholarships
-- ---------------------------------------------------------------------------
INSERT INTO scholarships (title, description, eligibility, deadline, archived, created_at, updated_at)
VALUES ('Bangladesh Government Merit Scholarship', 'Tuition waiver and stipend for top-ranked Bangladeshi students.', 'Bangladeshi citizenship, strong academic record, and institutional nomination.', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0, @now, @now);
SET @scholar_merit = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, archived, created_at, updated_at)
VALUES ('Prime Bank Foundation Scholarship', 'Support for undergraduate learners from financially constrained families in Bangladesh.', 'Financial need, academic excellence, and proof of current enrollment.', DATE_ADD(CURDATE(), INTERVAL 40 DAY), 0, @now, @now);
SET @scholar_prime = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, archived, created_at, updated_at)
VALUES ('ICT Division Innovation Scholarship', 'Funding for technology-driven research and innovation projects.', 'Open to STEM learners with a project proposal relevant to Digital Bangladesh priorities.', DATE_ADD(CURDATE(), INTERVAL 50 DAY), 0, @now, @now);
SET @scholar_ict = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, archived, created_at, updated_at)
VALUES ('Dutch-Bangla Bank Scholarship', 'Need-based education support for meritorious Bangladeshi students.', 'Strong SSC/HSC results, family income statement, and admission confirmation.', DATE_ADD(CURDATE(), INTERVAL 65 DAY), 0, @now, @now);
SET @scholar_dbb = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, archived, created_at, updated_at)
VALUES ('UGC Research Grant', 'Small research grant for faculty-led student research teams.', 'Faculty supervisor, research plan, and institutional approval required.', DATE_ADD(CURDATE(), INTERVAL 80 DAY), 1, @now, @now);
SET @scholar_ugc = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- Program and scholarship applications
-- ---------------------------------------------------------------------------
INSERT INTO program_applications (program_id, learner_id, status, education_summary, statement_of_purpose, supporting_document_path, notes, created_at, updated_at)
VALUES
    (@prog_ds, @learner_nusrat_id, 'PENDING', 'BSc CSE, University of Dhaka', 'I want to apply data science to flood and cyclone resilience in Bangladesh.', 'storage/seed/nusrat_transcript.pdf', 'Submitted via portal.', @now, @now),
    (@prog_mba, @learner_rafiul_id, 'APPROVED', 'HSC business studies, Notre Dame College', 'I plan to work in inclusive finance for small businesses in Bangladesh.', 'storage/seed/rafiul_hsc_certificate.pdf', 'Approved for interview shortlist.', @now, @now),
    (@prog_mph, @learner_tanjila_id, 'NEEDS_INFO', 'BSc Civil Engineering, RUET', 'I want to connect public health and climate-resilient infrastructure.', 'storage/seed/tanjila_statement.pdf', 'Requested updated recommendation letter.', @now, @now),
    (@prog_cse, @learner_rafiul_id, 'REJECTED', 'HSC science applicant', 'Interested in software products for local SMEs.', 'storage/seed/rafiul_optional.pdf', 'Minimum math prerequisite not met.', @now, @now);

INSERT INTO scholarship_applications (scholarship_id, learner_id, status, personal_statement, notes, created_at, updated_at)
VALUES
    (@scholar_merit, @learner_nusrat_id, 'PENDING', 'My work focuses on AI for disaster response in Bangladesh.', 'Awaiting review.', @now, @now),
    (@scholar_prime, @learner_rafiul_id, 'APPROVED', 'A scholarship would help me continue business studies in Dhaka.', 'Approved after financial verification.', @now, @now),
    (@scholar_ict, @learner_nusrat_id, 'NEEDS_INFO', 'I am building a Bangla early-warning chatbot for flood-prone communities.', 'Needs detailed budget.', @now, @now),
    (@scholar_dbb, @learner_tanjila_id, 'REJECTED', 'I need support to complete graduate admission preparation.', 'Income document incomplete by deadline.', @now, @now);

-- ---------------------------------------------------------------------------
-- Research
-- ---------------------------------------------------------------------------
INSERT INTO research_projects (title, description, required_skills, tags, status, created_by_id, created_at, updated_at)
VALUES ('Bangladesh Flood Prediction Lab', 'Researching early warning models for flood-prone districts using rainfall and river-level data.', 'Python, ML, GIS', 'climate, ml, flood', 'OPEN', @faculty_farhan_id, @now, @now);
SET @proj_flood = LAST_INSERT_ID();

INSERT INTO research_projects (title, description, required_skills, tags, status, created_by_id, created_at, updated_at)
VALUES ('Urban Mobility Study - Dhaka', 'Study public transport demand and commuter patterns in Dhaka city.', 'Survey design, data analysis, statistics', 'urban, transport, dhaka', 'CLOSED', @faculty_sabina_id, @now, @now);
SET @proj_mobility = LAST_INSERT_ID();

INSERT INTO research_projects (title, description, required_skills, tags, status, created_by_id, created_at, updated_at)
VALUES ('Bangla NLP Education Corpus', 'Build and annotate Bangla education counseling text for student support tools.', 'Bangla NLP, annotation, Python', 'bangla, nlp, education', 'ARCHIVED', @faculty_farhan_id, @now, @now);
SET @proj_nlp = LAST_INSERT_ID();

INSERT INTO research_join_requests (project_id, requester_id, message, skills, status, created_at, updated_at)
VALUES
    (@proj_flood, @learner_nusrat_id, 'I want to contribute with data preprocessing and model evaluation.', 'Python, Pandas, Scikit-learn', 'PENDING', @now, @now),
    (@proj_mobility, @learner_rafiul_id, 'I can help conduct surveys and clean respondent data.', 'Survey collection, Excel, SPSS', 'APPROVED', @now, @now),
    (@proj_nlp, @learner_tanjila_id, 'I am interested in Bangla annotation and educational outreach.', 'Bangla writing, data labeling', 'REJECTED', @now, @now);

-- ---------------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------------
INSERT INTO resources (title, description, file_name, file_path, file_size, public_access, uploader_id, created_at, updated_at)
VALUES
    ('Bangladesh Climate Data Guide', 'Dataset access guide for Bangladesh climate projects.', 'climate-guide.pdf', 'storage/seed/climate-guide.pdf', 204800, 1, @faculty_farhan_id, @now, @now),
    ('UGC Scholarship Checklist', 'Checklist for preparing local scholarship applications in Bangladesh.', 'ugc-scholarship-checklist.pdf', 'storage/seed/ugc-scholarship-checklist.pdf', 102400, 1, @admin_id, @now, @now),
    ('Dhaka Research Proposal Template', 'Proposal template for student research groups working with Dhaka-based datasets.', 'dhaka-research-proposal.docx', 'storage/seed/dhaka-research-proposal.docx', 153600, 0, @faculty_sabina_id, @now, @now);

-- ---------------------------------------------------------------------------
-- Forums
-- ---------------------------------------------------------------------------
INSERT INTO forum_threads (title, body, author_id, created_at, updated_at)
VALUES ('Scholarship tips for Bangladesh', 'Share verified scholarship sources and deadline reminders for Bangladeshi students.', @learner_nusrat_id, @now, @now);
SET @thread_scholarship = LAST_INSERT_ID();

INSERT INTO forum_threads (title, body, author_id, created_at, updated_at)
VALUES ('Choosing CSE programs in Dhaka', 'What should applicants compare before applying to CSE programs in Dhaka?', @learner_rafiul_id, @now, @now);
SET @thread_cse = LAST_INSERT_ID();

INSERT INTO forum_comments (thread_id, body, author_id, created_at, updated_at)
VALUES
    (@thread_scholarship, 'Check the Prime Bank Foundation, Dutch-Bangla Bank, and ICT Division announcements every month.', @faculty_farhan_id, @now, @now),
    (@thread_scholarship, 'Keep scanned copies of NID, income certificates, and transcripts ready.', @learner_tanjila_id, @now, @now),
    (@thread_cse, 'Compare faculty research areas, lab access, internship connections, and alumni outcomes.', @faculty_farhan_id, @now, @now);

-- ---------------------------------------------------------------------------
-- Webinars
-- ---------------------------------------------------------------------------
INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, host_id, created_at, updated_at)
VALUES ('Funding Pathways for Bangladesh', 'Walkthrough of scholarship and funding routes for Bangladeshi students.', DATE_ADD(NOW(), INTERVAL 10 DAY), 'https://meet.google.com/insightnest-bd-funding', 'SCHEDULED', @faculty_farhan_id, @now, @now);
SET @webinar_funding = LAST_INSERT_ID();

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, host_id, created_at, updated_at)
VALUES ('Research Skills for Bangladeshi Undergraduates', 'Practical session on building a first research profile with local datasets.', DATE_SUB(NOW(), INTERVAL 15 DAY), 'https://meet.google.com/insightnest-bd-research', 'COMPLETED', @faculty_sabina_id, @now, @now);
SET @webinar_research = LAST_INSERT_ID();

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, host_id, created_at, updated_at)
VALUES ('Public University Admission Q&A', 'Live Q&A for Bangladeshi public university admission planning.', DATE_ADD(NOW(), INTERVAL 20 DAY), 'https://meet.google.com/insightnest-bd-admission', 'CANCELED', @faculty_farhan_id, @now, @now);
SET @webinar_admission = LAST_INSERT_ID();

INSERT INTO webinar_registrations (webinar_id, user_id, status, created_at, updated_at)
VALUES
    (@webinar_funding, @learner_nusrat_id, 'REGISTERED', @now, @now),
    (@webinar_funding, @learner_rafiul_id, 'REGISTERED', @now, @now),
    (@webinar_research, @learner_tanjila_id, 'REGISTERED', @now, @now),
    (@webinar_admission, @learner_rafiul_id, 'CANCELED', @now, @now);

-- ---------------------------------------------------------------------------
-- Contact requests and FAQs
-- ---------------------------------------------------------------------------
INSERT INTO contact_requests (name, email, subject, message, status, created_at, updated_at)
VALUES
    ('Rafiul Islam', 'student@insightnest.com', 'Bangladesh scholarship inquiry', 'Need guidance on local scholarship deadlines.', 'NEW', @now, @now),
    ('Mst Rahima Begum', 'guardian@insightnest.com', 'Program application support', 'I need help understanding application documents for my daughter.', 'IN_PROGRESS', @now, @now),
    ('Faculty Office', 'faculty.office@insightnest.com', 'Research collaboration listing', 'Please add our public health student research opportunity.', 'RESOLVED', @now, @now);

INSERT INTO faqs (question, answer, active, created_at, updated_at)
VALUES
    ('How do I apply for Bangladeshi programs?', 'Create a learner profile, then apply from the program detail page.', 1, @now, @now),
    ('Can I submit multiple scholarship applications?', 'Yes, as long as you meet each scholarship eligibility.', 1, @now, @now),
    ('Are local Bangladeshi scholarships listed?', 'Yes. InsightNest includes government, foundation, bank, and ICT-focused opportunities relevant to Bangladesh.', 1, @now, @now);

-- Optional refresh token placeholder for local database smoke tests.
INSERT INTO refresh_tokens (token, expires_at, revoked, user_id, created_at, updated_at)
VALUES ('seed-refresh-token', DATE_ADD(@now, INTERVAL 7 DAY), 0, @admin_id, @now, @now);
