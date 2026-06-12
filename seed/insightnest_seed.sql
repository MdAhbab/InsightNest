-- InsightNest seed data (Bangladesh focused + international catalogue)
-- Password for all seeded users: Admin@123
-- Run after the Spring Boot app has created/updated the MySQL schema.

SET @now = NOW();
SET @demo_password = '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia';

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
        'sabina.yasmin@insightnest.com',
        'rep.demo@insightnest.com'
    )
);

DELETE FROM conversation_messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE initiator_id IN (SELECT id FROM users WHERE email IN (
        'nusrat.jahan@insightnest.com','rafiul.islam@insightnest.com','rep.demo@insightnest.com'))
    OR recipient_id IN (SELECT id FROM users WHERE email IN (
        'nusrat.jahan@insightnest.com','rafiul.islam@insightnest.com','rep.demo@insightnest.com'))
);
DELETE FROM conversations WHERE initiator_id IN (SELECT id FROM users WHERE email IN (
    'nusrat.jahan@insightnest.com','rafiul.islam@insightnest.com','rep.demo@insightnest.com'))
OR recipient_id IN (SELECT id FROM users WHERE email IN (
    'nusrat.jahan@insightnest.com','rafiul.islam@insightnest.com','rep.demo@insightnest.com'));

DELETE FROM webinar_registrations
WHERE webinar_id IN (SELECT id FROM webinars WHERE title IN (
    'Funding Pathways for Bangladesh', 'Research Skills for Bangladeshi Undergraduates',
    'Public University Admission Q&A',
    'The Editorial Mind: Writing Statements That Read',
    'Fellowship Strategy for the Mid-Career Researcher',
    'Open Science and the New Doctoral Curriculum',
    'Inside the Admissions Room — Cambridge Trinity',
    'From Honours Thesis to First Publication'
))
   OR user_id IN (SELECT id FROM users WHERE email IN (
       'nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));

DELETE FROM webinars WHERE title IN (
    'Funding Pathways for Bangladesh', 'Research Skills for Bangladeshi Undergraduates',
    'Public University Admission Q&A',
    'The Editorial Mind: Writing Statements That Read',
    'Fellowship Strategy for the Mid-Career Researcher',
    'Open Science and the New Doctoral Curriculum',
    'Inside the Admissions Room — Cambridge Trinity',
    'From Honours Thesis to First Publication'
);

DELETE FROM forum_comments
WHERE thread_id IN (SELECT id FROM forum_threads WHERE title IN (
    'Scholarship tips for Bangladesh', 'Choosing CSE programs in Dhaka',
    'Is a master''s required before a PhD in pure mathematics?',
    'Funding gap year: extending DAAD vs. self-funding term',
    'On letters of recommendation from industry mentors',
    'Choosing between MIT CSAIL and ETH for systems research',
    'Statement of purpose — how personal is too personal?',
    'First conference abroad: travel grants and visa logistics'))
   OR author_id IN (SELECT id FROM users WHERE email IN (
       'nusrat.jahan@insightnest.com', 'farhan.rahman@insightnest.com', 'sabina.yasmin@insightnest.com'));

DELETE FROM forum_threads WHERE title IN (
    'Scholarship tips for Bangladesh', 'Choosing CSE programs in Dhaka',
    'Is a master''s required before a PhD in pure mathematics?',
    'Funding gap year: extending DAAD vs. self-funding term',
    'On letters of recommendation from industry mentors',
    'Choosing between MIT CSAIL and ETH for systems research',
    'Statement of purpose — how personal is too personal?',
    'First conference abroad: travel grants and visa logistics'
);

DELETE FROM resources WHERE title IN (
    'Bangladesh Climate Data Guide', 'UGC Scholarship Checklist', 'Dhaka Research Proposal Template',
    'Statement of Purpose — The Anatomy of a Convincing Page',
    'Global Postgraduate Funding Index (2020–2026)',
    'Reading Rooms: A Visual History of the University Library',
    'On the Replication of Behavioural Findings in Economics',
    'The Idea of the University — Revisited',
    'Research Proposal Frameworks for STEM Candidates',
    'Acceptance Rate Tables — Top 200 Programmes'
);

DELETE FROM research_join_requests
WHERE project_id IN (SELECT id FROM research_projects WHERE title IN (
    'Bangladesh Flood Prediction Lab', 'Urban Mobility Study - Dhaka', 'Bangla NLP Education Corpus',
    'Single-cell atlas of cortical organoids',
    'Neuro-symbolic reasoning for scientific literature',
    'Mesoscale convective systems and climate sensitivity',
    'Tangible interfaces for archival research',
    'Glymphatic clearance in early Alzheimer''s',
    'Federated learning with privacy budgets'))
   OR requester_id IN (SELECT id FROM users WHERE email IN (
       'nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));

DELETE FROM research_projects WHERE title IN (
    'Bangladesh Flood Prediction Lab', 'Urban Mobility Study - Dhaka', 'Bangla NLP Education Corpus',
    'Single-cell atlas of cortical organoids',
    'Neuro-symbolic reasoning for scientific literature',
    'Mesoscale convective systems and climate sensitivity',
    'Tangible interfaces for archival research',
    'Glymphatic clearance in early Alzheimer''s',
    'Federated learning with privacy budgets'
);

DELETE FROM scholarship_applications WHERE scholarship_id IN (
    SELECT id FROM scholarships WHERE title IN (
        'Bangladesh Government Merit Scholarship', 'Prime Bank Foundation Scholarship',
        'ICT Division Innovation Scholarship', 'Dutch-Bangla Bank Scholarship', 'UGC Research Grant',
        'Rhodes Scholarship', 'Chevening Scholarship', 'Fulbright Foreign Student Program',
        'DAAD Study Scholarship', 'Gates Cambridge Scholarship', 'Erasmus Mundus Scholarship',
        'Knight-Hennessy Scholars', 'Vanier Canada Graduate Scholarship',
        'MEXT Japanese Government Scholarship'))
   OR learner_id IN (SELECT id FROM users WHERE email IN (
       'nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));

DELETE FROM program_applications WHERE program_id IN (
    SELECT id FROM programs WHERE name IN (
        'BSc in Computer Science and Engineering', 'MBA in Finance', 'MSc in Data Science',
        'BBA in Marketing', 'MPH in Public Health', 'BSc in Civil Engineering',
        'MSc Computational Biology', 'PhD in Artificial Intelligence', 'MSc Public Policy',
        'MA Architectural History', 'MEng Aerospace Engineering', 'MSc Climate Sciences',
        'PhD Neuroscience', 'MSc Mathematical Finance', 'MA Global History',
        'MSc Digital Humanities', 'MSc Economics', 'MSc Marine Biology'))
   OR learner_id IN (SELECT id FROM users WHERE email IN (
       'nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));

DELETE FROM learner_profiles WHERE user_id IN (SELECT id FROM users WHERE email IN (
    'nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com', 'tanjila.akter@insightnest.com'));
DELETE FROM faculty_profiles WHERE user_id IN (SELECT id FROM users WHERE email IN (
    'farhan.rahman@insightnest.com', 'sabina.yasmin@insightnest.com'));

DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        'admin@insightnest.com', 'nusrat.jahan@insightnest.com', 'rafiul.islam@insightnest.com',
        'tanjila.akter@insightnest.com', 'farhan.rahman@insightnest.com', 'sabina.yasmin@insightnest.com',
        'rep.demo@insightnest.com'));

DELETE FROM programs WHERE name IN (
    'BSc in Computer Science and Engineering', 'MBA in Finance', 'MSc in Data Science',
    'BBA in Marketing', 'MPH in Public Health', 'BSc in Civil Engineering',
    'MSc Computational Biology', 'PhD in Artificial Intelligence', 'MSc Public Policy',
    'MA Architectural History', 'MEng Aerospace Engineering', 'MSc Climate Sciences',
    'PhD Neuroscience', 'MSc Mathematical Finance', 'MA Global History',
    'MSc Digital Humanities', 'MSc Economics', 'MSc Marine Biology');

DELETE FROM scholarships WHERE title IN (
    'Bangladesh Government Merit Scholarship', 'Prime Bank Foundation Scholarship',
    'ICT Division Innovation Scholarship', 'Dutch-Bangla Bank Scholarship', 'UGC Research Grant',
    'Rhodes Scholarship', 'Chevening Scholarship', 'Fulbright Foreign Student Program',
    'DAAD Study Scholarship', 'Gates Cambridge Scholarship', 'Erasmus Mundus Scholarship',
    'Knight-Hennessy Scholars', 'Vanier Canada Graduate Scholarship',
    'MEXT Japanese Government Scholarship');

DELETE FROM universities WHERE name IN (
    'University of Dhaka', 'Bangladesh University of Engineering and Technology',
    'BRAC University', 'North South University',
    'Shahjalal University of Science and Technology', 'Rajshahi University',
    'University of Oxford', 'University of Cambridge', 'ETH Zürich',
    'Massachusetts Institute of Technology', 'Stanford University', 'Harvard University',
    'Princeton University', 'Yale University', 'Imperial College London',
    'École Polytechnique Fédérale de Lausanne', 'Karolinska Institutet', 'University of Tokyo',
    'National University of Singapore', 'University of Toronto', 'Leiden University',
    'Heidelberg University', 'Australian National University', 'Sorbonne Université',
    'KU Leuven', 'Trinity College Dublin');

DELETE FROM contact_requests WHERE email IN (
    'student@insightnest.com', 'guardian@insightnest.com', 'faculty.office@insightnest.com');
DELETE FROM faqs WHERE question IN (
    'How do I apply for Bangladeshi programs?',
    'Can I submit multiple scholarship applications?',
    'Are local Bangladeshi scholarships listed?');

DELETE FROM users WHERE email IN ('rep.demo@insightnest.com');

-- ---------------------------------------------------------------------------
-- Users and roles
-- ---------------------------------------------------------------------------
INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Md Ahbab Hamid Khan', 'admin@insightnest.com', @demo_password, 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name),
    password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @admin_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Nusrat Jahan', 'nusrat.jahan@insightnest.com', @demo_password, 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name),
    password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @learner_nusrat_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Rafiul Islam', 'rafiul.islam@insightnest.com', @demo_password, 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name),
    password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @learner_rafiul_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Tanjila Akter', 'tanjila.akter@insightnest.com', @demo_password, 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name),
    password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @learner_tanjila_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Dr. Farhan Rahman', 'farhan.rahman@insightnest.com', @demo_password, 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name),
    password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @faculty_farhan_id = LAST_INSERT_ID();

INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Dr. Sabina Yasmin', 'sabina.yasmin@insightnest.com', @demo_password, 1, 0, @now, @now)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), full_name = VALUES(full_name),
    password = VALUES(password), enabled = VALUES(enabled), suspended = VALUES(suspended), updated_at = @now;
SET @faculty_sabina_id = LAST_INSERT_ID();

-- UNIVERSITY_REP demo user
INSERT INTO users (full_name, email, password, enabled, suspended, created_at, updated_at)
VALUES ('Rep Demo', 'rep.demo@insightnest.com', @demo_password, 1, 0, @now, @now);
SET @rep_demo_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, roles) VALUES
    (@admin_id, 'ADMIN'),
    (@learner_nusrat_id, 'LEARNER'),
    (@learner_rafiul_id, 'LEARNER'),
    (@learner_tanjila_id, 'LEARNER'),
    (@faculty_farhan_id, 'FACULTY'),
    (@faculty_sabina_id, 'FACULTY'),
    (@rep_demo_id, 'UNIVERSITY_REP');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
INSERT INTO learner_profiles (user_id, education_history, cgpa, ielts_score, projects, publications, hobbies, nationality, social_links, bio, created_at, updated_at) VALUES
    (@learner_nusrat_id, 'BSc in Computer Science, University of Dhaka (2019-2023)', '3.82/4.00', '7.5',
     'Smart Flood Alert System; Dhaka Air Quality Dashboard',
     'IEEE Bangladesh Section student paper, 2024', 'Debate, chess', 'Bangladeshi',
     'linkedin.com/in/nusrat-jahan', 'Aspiring data scientist focusing on climate resilience in Bangladesh.', @now, @now),
    (@learner_rafiul_id, 'HSC, Notre Dame College; BBA applicant from Dhaka', '4.92/5.00', '7.0',
     'Campus admission tracker for Bangladeshi universities', 'None', 'Public speaking, volunteering',
     'Bangladeshi', 'linkedin.com/in/rafiul-islam',
     'Interested in finance, scholarships, and social impact programs.', @now, @now),
    (@learner_tanjila_id, 'BSc in Civil Engineering, Rajshahi University of Engineering and Technology', '3.68/4.00', '6.5',
     'Low-cost water filter for northern Bangladesh',
     'Undergraduate thesis on river erosion mitigation', 'Photography, science clubs', 'Bangladeshi',
     'linkedin.com/in/tanjila-akter',
     'Planning graduate study in public health and resilient infrastructure.', @now, @now);

INSERT INTO faculty_profiles (user_id, expertise, research_interests, department, website, linked_in, taught_courses, publications, bio, created_at, updated_at) VALUES
    (@faculty_farhan_id, 'AI for Education', 'Learning analytics, fairness, adaptive systems', 'CSE, BUET',
     'https://www.buet.ac.bd', 'linkedin.com/in/farhan-rahman', 'Machine Learning, Data Mining',
     'Bangladesh Journal of AI, 2025', 'Faculty member leading human-centered AI initiatives.', @now, @now),
    (@faculty_sabina_id, 'Public Health Research', 'Urban health, climate adaptation, community surveys',
     'Public Health, BRAC University', 'https://www.bracu.ac.bd', 'linkedin.com/in/sabina-yasmin',
     'Epidemiology, Research Methods', 'Journal of Bangladesh Public Health, 2024',
     'Research mentor for community health and climate resilience projects.', @now, @now);

-- ---------------------------------------------------------------------------
-- Universities — Bangladesh (6) + International (20 from mock)
-- ---------------------------------------------------------------------------
INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('University of Dhaka', 'Bangladesh', 'Dhaka', 801, 'https://www.du.ac.bd',
        'Leading public university in Bangladesh with strong arts, science, and business programs.',
        1921, 33000, 'Public,Research', 0, @now, @now);
SET @uni_du = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Bangladesh University of Engineering and Technology', 'Bangladesh', 'Dhaka', 801, 'https://www.buet.ac.bd',
        'Top engineering university in Bangladesh with competitive STEM programs.',
        1962, 10000, 'Technical,Public', 0, @now, @now);
SET @uni_buet = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('BRAC University', 'Bangladesh', 'Dhaka', 1001, 'https://www.bracu.ac.bd',
        'Private research-focused university known for public health, data science, and social impact work.',
        2001, 14000, 'Private,Research', 0, @now, @now);
SET @uni_brac = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('North South University', 'Bangladesh', 'Dhaka', 1201, 'https://www.northsouth.edu',
        'Private university in Dhaka with business, economics, and computing programs.',
        1992, 22000, 'Private', 0, @now, @now);
SET @uni_nsu = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Shahjalal University of Science and Technology', 'Bangladesh', 'Sylhet', 1401, 'https://www.sust.edu',
        'Public science and technology university serving learners across north-eastern Bangladesh.',
        1987, 12000, 'Technical,Public', 0, @now, @now);
SET @uni_sust = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Rajshahi University', 'Bangladesh', 'Rajshahi', 1501, 'https://www.ru.ac.bd',
        'Major public university in northern Bangladesh with broad undergraduate and graduate offerings.',
        1953, 35000, 'Public', 0, @now, @now);
SET @uni_ru = LAST_INSERT_ID();

-- International universities from mock.ts
INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('University of Oxford', 'United Kingdom', 'Oxford', 1, 'https://www.ox.ac.uk',
        'One of the oldest and most prestigious universities in the world, renowned for research and collegiate life.',
        1096, 26000, 'Russell Group,Collegiate', 0, @now, @now);
SET @uni_oxford = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('University of Cambridge', 'United Kingdom', 'Cambridge', 2, 'https://www.cam.ac.uk',
        'World-class research university with a collegiate system and centuries of academic tradition.',
        1209, 24000, 'Russell Group,Collegiate', 0, @now, @now);
SET @uni_cambridge = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('ETH Zürich', 'Switzerland', 'Zürich', 7, 'https://ethz.ch',
        'Leading technical university in Europe, particularly strong in engineering and natural sciences.',
        1855, 22000, 'Technical,Public', 0, @now, @now);
SET @uni_eth = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Massachusetts Institute of Technology', 'United States', 'Cambridge, MA', 3, 'https://web.mit.edu',
        'World-renowned institute for science, technology, and innovation.',
        1861, 11500, 'Ivy+,Technical', 0, @now, @now);
SET @uni_mit = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Stanford University', 'United States', 'Stanford, CA', 4, 'https://www.stanford.edu',
        'Elite private research university in Silicon Valley, known for entrepreneurship and innovation.',
        1885, 17000, 'Private,Research', 0, @now, @now);
SET @uni_stanford = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Harvard University', 'United States', 'Cambridge, MA', 5, 'https://www.harvard.edu',
        'America''s oldest university with strengths across law, medicine, business, and the arts.',
        1636, 22000, 'Ivy League', 0, @now, @now);
SET @uni_harvard = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Princeton University', 'United States', 'Princeton, NJ', 6, 'https://www.princeton.edu',
        'Ivy League university known for its undergraduate focus and humanities research.',
        1746, 8400, 'Ivy League', 0, @now, @now);
SET @uni_princeton = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Yale University', 'United States', 'New Haven, CT', 9, 'https://www.yale.edu',
        'Ivy League research university with world-class programs in law, drama, and the social sciences.',
        1701, 13400, 'Ivy League', 0, @now, @now);
SET @uni_yale = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Imperial College London', 'United Kingdom', 'London', 8, 'https://www.imperial.ac.uk',
        'Science-focused Russell Group university in London, ranked globally for STEM disciplines.',
        1907, 19000, 'Russell Group,STEM', 0, @now, @now);
SET @uni_imperial = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('École Polytechnique Fédérale de Lausanne', 'Switzerland', 'Lausanne', 14, 'https://www.epfl.ch',
        'Swiss federal technology institute known for engineering, life sciences, and digital humanities.',
        1853, 12000, 'Technical,Public', 0, @now, @now);
SET @uni_epfl = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Karolinska Institutet', 'Sweden', 'Stockholm', 38, 'https://ki.se',
        'Top medical university in Scandinavia, home to the Nobel Assembly for Physiology or Medicine.',
        1810, 7900, 'Medical', 0, @now, @now);
SET @uni_ki = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('University of Tokyo', 'Japan', 'Tokyo', 28, 'https://www.u-tokyo.ac.jp',
        'Japan''s leading research university with strengths across the natural and social sciences.',
        1877, 28000, 'Imperial,Research', 0, @now, @now);
SET @uni_tokyo = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('Leiden University', 'Netherlands', 'Leiden', 122, 'https://www.universiteitleiden.nl',
        'Netherlands'' oldest university with a strong tradition in humanities, law, and social sciences.',
        1575, 30000, 'Coimbra Group', 0, @now, @now);
SET @uni_leiden = LAST_INSERT_ID();

INSERT INTO universities (name, country, city, ranking, website, description, founded_year, student_count, tags, archived, created_at, updated_at)
VALUES ('KU Leuven', 'Belgium', 'Leuven', 61, 'https://www.kuleuven.be',
        'Belgium''s largest and most research-intensive university, member of LERU.',
        1425, 60000, 'LERU', 0, @now, @now);
SET @uni_kul = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- Programs — Bangladesh (6) + International (12 from mock)
-- ---------------------------------------------------------------------------
INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('BSc in Computer Science and Engineering', 'Undergraduate', 'CSE', '4 years',
        'Competitive CSE program with software engineering, AI, and systems labs.',
        DATE_ADD(CURDATE(), INTERVAL 45 DAY), NULL, @uni_buet, 0, @now, @now);
SET @prog_cse = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MBA in Finance', 'Graduate', 'Business Studies', '1.5 years',
        'Finance-focused MBA with Bangladeshi banking and capital market case studies.',
        DATE_ADD(CURDATE(), INTERVAL 60 DAY), NULL, @uni_du, 0, @now, @now);
SET @prog_mba = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc in Data Science', 'Graduate', 'CSE', '2 years',
        'Hands-on data science program using local public datasets and industry projects.',
        DATE_ADD(CURDATE(), INTERVAL 75 DAY), NULL, @uni_brac, 0, @now, @now);
SET @prog_ds = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('BBA in Marketing', 'Undergraduate', 'School of Business', '4 years',
        'Marketing program with coursework on Bangladeshi consumer behavior and digital commerce.',
        DATE_ADD(CURDATE(), INTERVAL 90 DAY), NULL, @uni_nsu, 0, @now, @now);
SET @prog_bba = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MPH in Public Health', 'Graduate', 'Public Health', '1 year',
        'Public health program focused on urban health, nutrition, and climate adaptation in Bangladesh.',
        DATE_ADD(CURDATE(), INTERVAL 105 DAY), NULL, @uni_brac, 0, @now, @now);
SET @prog_mph = LAST_INSERT_ID();

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('BSc in Civil Engineering', 'Undergraduate', 'Civil Engineering', '4 years',
        'Civil engineering program focused on transport, water resources, and resilient infrastructure.',
        DATE_ADD(CURDATE(), INTERVAL 120 DAY), NULL, @uni_sust, 1, @now, @now);
SET @prog_civil = LAST_INSERT_ID();

-- International programs from mock.ts
INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Computational Biology', 'MSc', 'Life Sciences', '2 yrs',
        'Interdisciplinary program combining computer science and biology at ETH Zürich.',
        '2026-08-01', 'CHF 1,460/yr', @uni_eth, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('PhD in Artificial Intelligence', 'PhD', 'Computer Science', '5 yrs',
        'Fully funded PhD in AI research at one of the world''s top CS departments.',
        '2026-12-15', 'Funded', @uni_mit, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Public Policy', 'MSc', 'Social Sciences', '1 yr',
        'Rigorous policy analysis and governance program at the University of Oxford.',
        '2026-10-20', '£37,290/yr', @uni_oxford, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MA Architectural History', 'MA', 'Humanities', '2 yrs',
        'Architectural history and theory at Princeton with access to major archival collections.',
        '2026-01-05', '$59,710/yr', @uni_princeton, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MEng Aerospace Engineering', 'MEng', 'Engineering', '1.5 yrs',
        'Advanced aerospace engineering with research projects in propulsion and structures.',
        '2026-06-30', '£40,940/yr', @uni_imperial, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Climate Sciences', 'MSc', 'Earth Sciences', '2 yrs',
        'Climate modelling and data analysis for the next generation of environmental researchers.',
        '2026-04-15', 'CHF 1,460/yr', @uni_epfl, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('PhD Neuroscience', 'PhD', 'Life Sciences', '4 yrs',
        'Fully funded PhD in neuroscience with access to world-class imaging facilities at KI.',
        '2026-03-01', 'Funded', @uni_ki, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Mathematical Finance', 'MSc', 'Mathematics', '1 yr',
        'Quantitative finance and stochastic calculus at the University of Cambridge.',
        '2026-05-10', '£40,800/yr', @uni_cambridge, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MA Global History', 'MA', 'Humanities', '1 yr',
        'Transnational and comparative history with a European and global perspective.',
        '2026-04-01', '€18,750/yr', @uni_leiden, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Digital Humanities', 'MSc', 'Humanities', '2 yrs',
        'Digital methods in humanities research — text mining, cultural analytics, and archival science.',
        '2026-05-31', '€6,600/yr', @uni_kul, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Economics', 'MSc', 'Social Sciences', '2 yrs',
        'Top economics master''s program with focus on theory, econometrics, and policy.',
        '2026-12-01', '$60,500/yr', @uni_stanford, 0, @now, @now);

INSERT INTO programs (name, type, department, duration, description, application_deadline, tuition, university_id, archived, created_at, updated_at)
VALUES ('MSc Marine Biology', 'MSc', 'Life Sciences', '2 yrs',
        'Marine ecology, oceanography, and conservation biology at the University of Tokyo.',
        '2026-07-20', '¥535,800/yr', @uni_tokyo, 0, @now, @now);

-- ---------------------------------------------------------------------------
-- Scholarships — Bangladesh (5) + International (9 from mock)
-- ---------------------------------------------------------------------------
INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Bangladesh Government Merit Scholarship',
        'Tuition waiver and stipend for top-ranked Bangladeshi students.',
        'Bangladeshi citizenship, strong academic record, and institutional nomination.',
        DATE_ADD(CURDATE(), INTERVAL 30 DAY),
        'Bangladesh Government', 50000.00, 'BDT', 'Bangladesh', 'Undergraduate', 0, @now, @now);
SET @scholar_merit = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Prime Bank Foundation Scholarship',
        'Support for undergraduate learners from financially constrained families in Bangladesh.',
        'Financial need, academic excellence, and proof of current enrollment.',
        DATE_ADD(CURDATE(), INTERVAL 40 DAY),
        'Prime Bank Foundation', 80000.00, 'BDT', 'Bangladesh', 'Undergraduate', 0, @now, @now);
SET @scholar_prime = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('ICT Division Innovation Scholarship',
        'Funding for technology-driven research and innovation projects.',
        'Open to STEM learners with a project proposal relevant to Digital Bangladesh priorities.',
        DATE_ADD(CURDATE(), INTERVAL 50 DAY),
        'ICT Division, Bangladesh', 100000.00, 'BDT', 'Bangladesh', 'Graduate', 0, @now, @now);
SET @scholar_ict = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Dutch-Bangla Bank Scholarship',
        'Need-based education support for meritorious Bangladeshi students.',
        'Strong SSC/HSC results, family income statement, and admission confirmation.',
        DATE_ADD(CURDATE(), INTERVAL 65 DAY),
        'Dutch-Bangla Bank', 60000.00, 'BDT', 'Bangladesh', 'Undergraduate', 0, @now, @now);
SET @scholar_dbb = LAST_INSERT_ID();

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('UGC Research Grant',
        'Small research grant for faculty-led student research teams.',
        'Faculty supervisor, research plan, and institutional approval required.',
        DATE_ADD(CURDATE(), INTERVAL 80 DAY),
        'University Grants Commission', 150000.00, 'BDT', 'Bangladesh', 'Graduate', 1, @now, @now);
SET @scholar_ugc = LAST_INSERT_ID();

-- International scholarships from mock.ts
INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Rhodes Scholarship',
        'Prestigious postgraduate scholarship for study at the University of Oxford.',
        'Exceptional academic and personal qualities; varies by constituency.',
        '2026-10-01', 'Rhodes Trust', 70000.00, 'USD', 'Worldwide', 'Postgraduate', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Chevening Scholarship',
        'UK Government scholarship for future leaders to study in the United Kingdom.',
        'Minimum two years work experience; leadership potential; return commitment.',
        '2026-11-05', 'FCDO, UK Government', 45000.00, 'GBP', 'International', 'Master''s', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Fulbright Foreign Student Program',
        'US State Department scholarship for graduate study in the United States.',
        'Outstanding academic merit and leadership; country-specific criteria apply.',
        '2026-10-15', 'U.S. Department of State', 55000.00, 'USD', 'Worldwide', 'Master''s / PhD', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('DAAD Study Scholarship',
        'German academic exchange scholarship for postgraduate study in Germany.',
        'Above-average grades; relevant undergraduate degree; strong motivation letter.',
        '2026-11-30', 'DAAD, Germany', 13800.00, 'EUR', 'International', 'Master''s', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Gates Cambridge Scholarship',
        'Full-cost scholarship for postgraduate study at the University of Cambridge.',
        'Outstanding intellectual ability, leadership, commitment to improving lives of others.',
        '2026-12-03', 'Gates Cambridge Trust', 60000.00, 'GBP', 'Outside UK', 'Postgraduate', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Erasmus Mundus Scholarship',
        'European Commission scholarship for joint master''s programmes across EU universities.',
        'Bachelor''s degree in relevant field; proficiency in language of instruction.',
        '2026-02-15', 'European Commission', 49000.00, 'EUR', 'Worldwide', 'Master''s', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Knight-Hennessy Scholars',
        'Stanford''s graduate scholarship programme for future global leaders.',
        'Exceptional achievement; minimum one year work experience recommended.',
        '2026-10-09', 'Stanford University', 95000.00, 'USD', 'Worldwide', 'Graduate', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('Vanier Canada Graduate Scholarship',
        'Prestigious doctoral scholarship for Canadian and international students.',
        'Nominated by a Canadian university; strong academic and leadership record.',
        '2026-11-01', 'Government of Canada', 50000.00, 'CAD', 'Worldwide', 'Doctoral', 0, @now, @now);

INSERT INTO scholarships (title, description, eligibility, deadline, funder, amount, currency, region, level, archived, created_at, updated_at)
VALUES ('MEXT Japanese Government Scholarship',
        'Japanese Ministry of Education scholarship for research students and graduate programs.',
        'Applicants from countries with diplomatic relations with Japan; age restrictions apply.',
        '2026-05-20', 'MEXT, Japan', 1740000.00, 'JPY', 'Worldwide', 'Research / Master''s', 0, @now, @now);

-- ---------------------------------------------------------------------------
-- Program and scholarship applications
-- ---------------------------------------------------------------------------
INSERT INTO program_applications (program_id, learner_id, status, education_summary, statement_of_purpose, supporting_document_path, notes, created_at, updated_at)
VALUES
    (@prog_ds, @learner_nusrat_id, 'PENDING', 'BSc CSE, University of Dhaka',
     'I want to apply data science to flood and cyclone resilience in Bangladesh.',
     'storage/seed/nusrat_transcript.pdf', 'Submitted via portal.', @now, @now),
    (@prog_mba, @learner_rafiul_id, 'APPROVED', 'HSC business studies, Notre Dame College',
     'I plan to work in inclusive finance for small businesses in Bangladesh.',
     'storage/seed/rafiul_hsc_certificate.pdf', 'Approved for interview shortlist.', @now, @now),
    (@prog_mph, @learner_tanjila_id, 'NEEDS_INFO', 'BSc Civil Engineering, RUET',
     'I want to connect public health and climate-resilient infrastructure.',
     'storage/seed/tanjila_statement.pdf', 'Requested updated recommendation letter.', @now, @now),
    (@prog_cse, @learner_rafiul_id, 'REJECTED', 'HSC science applicant',
     'Interested in software products for local SMEs.',
     'storage/seed/rafiul_optional.pdf', 'Minimum math prerequisite not met.', @now, @now);

INSERT INTO scholarship_applications (scholarship_id, learner_id, status, personal_statement, notes, created_at, updated_at)
VALUES
    (@scholar_merit, @learner_nusrat_id, 'PENDING',
     'My work focuses on AI for disaster response in Bangladesh.', 'Awaiting review.', @now, @now),
    (@scholar_prime, @learner_rafiul_id, 'APPROVED',
     'A scholarship would help me continue business studies in Dhaka.',
     'Approved after financial verification.', @now, @now),
    (@scholar_ict, @learner_nusrat_id, 'NEEDS_INFO',
     'I am building a Bangla early-warning chatbot for flood-prone communities.',
     'Needs detailed budget.', @now, @now),
    (@scholar_dbb, @learner_tanjila_id, 'REJECTED',
     'I need support to complete graduate admission preparation.',
     'Income document incomplete by deadline.', @now, @now);

-- ---------------------------------------------------------------------------
-- Research projects — Bangladesh (3) + International (6 from mock)
-- ---------------------------------------------------------------------------
INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Bangladesh Flood Prediction Lab',
        'Researching early warning models for flood-prone districts using rainfall and river-level data.',
        'Python, ML, GIS', 'climate, ml, flood', 'OPEN',
        'Climate Intelligence Lab', 'BUET', 3, 'Earth Sciences',
        DATE_ADD(CURDATE(), INTERVAL 60 DAY), @faculty_farhan_id, @now, @now);
SET @proj_flood = LAST_INSERT_ID();

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Urban Mobility Study - Dhaka',
        'Study public transport demand and commuter patterns in Dhaka city.',
        'Survey design, data analysis, statistics', 'urban, transport, dhaka', 'CLOSED',
        'Urban Studies Centre', 'BRAC University', 0, 'Social Sciences',
        DATE_ADD(CURDATE(), INTERVAL 30 DAY), @faculty_sabina_id, @now, @now);
SET @proj_mobility = LAST_INSERT_ID();

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Bangla NLP Education Corpus',
        'Build and annotate Bangla education counseling text for student support tools.',
        'Bangla NLP, annotation, Python', 'bangla, nlp, education', 'ARCHIVED',
        'Language Technology Lab', 'BUET', 0, 'Computer Science',
        DATE_ADD(CURDATE(), INTERVAL 90 DAY), @faculty_farhan_id, @now, @now);
SET @proj_nlp = LAST_INSERT_ID();

-- International research projects from mock.ts
INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Single-cell atlas of cortical organoids',
        'Using single-cell genomics to map cell types in human brain organoids.',
        'scRNA-seq, Python, R', 'genomics, neuroscience, stem cells', 'OPEN',
        'Treutlein Lab', 'ETH Zürich', 2, 'Life Sciences',
        '2026-07-15', @faculty_farhan_id, @now, @now);

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Neuro-symbolic reasoning for scientific literature',
        'Combining neural language models with symbolic reasoning for scientific knowledge graphs.',
        'NLP, Python, PyTorch', 'NLP, LLM, reasoning', 'OPEN',
        'CSAIL — Language & Intelligence', 'MIT', 3, 'Computer Science',
        '2026-09-01', @faculty_farhan_id, @now, @now);

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Mesoscale convective systems and climate sensitivity',
        'Studying large-scale convective systems and their role in climate sensitivity estimates.',
        'Python, climate models, GCM', 'climate, GCM, ensembles', 'OPEN',
        'AOPP', 'University of Oxford', 1, 'Earth Sciences',
        '2026-04-30', @faculty_sabina_id, @now, @now);

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Tangible interfaces for archival research',
        'Designing physical computing interfaces to support archival exploration tasks.',
        'HCI, prototyping, user studies', 'HCI, archives, design', 'OPEN',
        'Stanford HCI Group', 'Stanford University', 2, 'Computer Science',
        '2026-06-01', @faculty_sabina_id, @now, @now);

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Glymphatic clearance in early Alzheimer''s',
        'Investigating the role of the glymphatic system in Alzheimer''s disease progression.',
        'MRI, neuroscience, statistics', 'neuroscience, MRI, sleep', 'OPEN',
        'Centre for Sleep & Cognition', 'Karolinska Institutet', 1, 'Life Sciences',
        '2026-03-20', @faculty_sabina_id, @now, @now);

INSERT INTO research_projects (title, description, required_skills, tags, status, lab, institution, openings, field, deadline, created_by_id, created_at, updated_at)
VALUES ('Federated learning with privacy budgets',
        'Developing privacy-preserving federated learning algorithms with formal differential privacy guarantees.',
        'ML, Python, optimization', 'ML, privacy, optimization', 'OPEN',
        'Laboratory of Information & Inference Systems', 'EPFL', 2, 'Computer Science',
        '2026-05-10', @faculty_farhan_id, @now, @now);

INSERT INTO research_join_requests (project_id, requester_id, message, skills, status, created_at, updated_at) VALUES
    (@proj_flood, @learner_nusrat_id, 'I want to contribute with data preprocessing and model evaluation.',
     'Python, Pandas, Scikit-learn', 'PENDING', @now, @now),
    (@proj_mobility, @learner_rafiul_id, 'I can help conduct surveys and clean respondent data.',
     'Survey collection, Excel, SPSS', 'APPROVED', @now, @now),
    (@proj_nlp, @learner_tanjila_id, 'I am interested in Bangla annotation and educational outreach.',
     'Bangla writing, data labeling', 'REJECTED', @now, @now);

-- ---------------------------------------------------------------------------
-- Resources — 3 Bangladesh + 7 international from mock.ts
-- ---------------------------------------------------------------------------
INSERT INTO resources (title, description, file_name, file_path, file_size, author, year, pages, field, resource_type, public_access, uploader_id, created_at, updated_at) VALUES
    ('Bangladesh Climate Data Guide',
     'Dataset access guide for Bangladesh climate projects.',
     'climate-guide.pdf', 'seed/placeholder.pdf', 204800,
     'Dr. Farhan Rahman', 2025, 24, 'Earth Sciences', 'PDF', 1, @faculty_farhan_id, @now, @now),
    ('UGC Scholarship Checklist',
     'Checklist for preparing local scholarship applications in Bangladesh.',
     'ugc-scholarship-checklist.pdf', 'seed/placeholder.pdf', 102400,
     'InsightNest Editorial', 2025, 8, 'Applications', 'PDF', 1, @admin_id, @now, @now),
    ('Dhaka Research Proposal Template',
     'Proposal template for student research groups working with Dhaka-based datasets.',
     'dhaka-research-proposal.docx', 'seed/placeholder.pdf', 153600,
     'Dr. Sabina Yasmin', 2025, 12, 'Applications', 'PAPER', 0, @faculty_sabina_id, @now, @now),
    ('Statement of Purpose — The Anatomy of a Convincing Page',
     'A detailed guide to crafting a compelling statement of purpose for graduate admissions.',
     'sop-guide.pdf', 'seed/placeholder.pdf', 1258291,
     'InsightNest Editorial', 2026, 18, 'Applications', 'PDF', 1, @admin_id, @now, @now),
    ('Global Postgraduate Funding Index (2020–2026)',
     'Comprehensive dataset of global postgraduate funding opportunities from 2020 to 2026.',
     'funding-index.csv', 'seed/placeholder.pdf', 4825907,
     'OECD Education Directorate', 2026, NULL, 'Funding', 'DATASET', 1, @admin_id, @now, @now),
    ('Reading Rooms: A Visual History of the University Library',
     'Documentary exploring the architectural and social history of university libraries.',
     'reading-rooms.mp4', 'seed/placeholder.pdf', 190840832,
     'Films of the British Library', 2024, NULL, 'Archives', 'VIDEO', 1, @admin_id, @now, @now),
    ('On the Replication of Behavioural Findings in Economics',
     'Meta-analysis examining replication rates in experimental economics research.',
     'replication-economics.pdf', 'seed/placeholder.pdf', 798720,
     'Camerer et al.', 2018, 24, 'Economics', 'PAPER', 1, @faculty_farhan_id, @now, @now),
    ('The Idea of the University — Revisited',
     'Cardinal Newman''s classic essay on the nature and purpose of university education.',
     'idea-of-university.pdf', 'seed/placeholder.pdf', 6710886,
     'John Henry Newman, ed. Pelikan', 1996, 412, 'Philosophy of Education', 'BOOK', 1, @admin_id, @now, @now),
    ('Research Proposal Frameworks for STEM Candidates',
     'Practical guide to structuring research proposals for graduate STEM applications.',
     'stem-proposal-frameworks.pdf', 'seed/placeholder.pdf', 2202009,
     'InsightNest Editorial', 2026, 32, 'Applications', 'PDF', 1, @admin_id, @now, @now),
    ('Acceptance Rate Tables — Top 200 Programmes',
     'Curated acceptance rate data for top graduate programmes worldwide.',
     'acceptance-rates-2026.csv', 'seed/placeholder.pdf', 1887437,
     'QS Intelligence Unit', 2026, NULL, 'Admissions', 'DATASET', 1, @admin_id, @now, @now);

-- ---------------------------------------------------------------------------
-- Forums — 2 Bangladesh + 6 international from mock.ts
-- ---------------------------------------------------------------------------
INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('Scholarship tips for Bangladesh',
        'Share verified scholarship sources and deadline reminders for Bangladeshi students.',
        'Funding', @learner_nusrat_id, @now, @now);
SET @thread_scholarship = LAST_INSERT_ID();

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('Choosing CSE programs in Dhaka',
        'What should applicants compare before applying to CSE programs in Dhaka?',
        'Decision', @learner_rafiul_id, @now, @now);
SET @thread_cse = LAST_INSERT_ID();

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('Is a master''s required before a PhD in pure mathematics?',
        'I am considering applying directly for a PhD in pure mathematics. Is a master''s typically required or beneficial?',
        'Doctoral Path', @learner_nusrat_id, @now, @now);

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('Funding gap year: extending DAAD vs. self-funding term',
        'My DAAD scholarship runs out in month 18 of a 24-month programme. Has anyone navigated extending or self-funding the remaining term?',
        'Funding', @learner_rafiul_id, @now, @now);

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('On letters of recommendation from industry mentors',
        'My strongest recommender is an industry research lead, not an academic. How do admissions committees weigh non-academic letters?',
        'Applications', @learner_tanjila_id, @now, @now);

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('Choosing between MIT CSAIL and ETH for systems research',
        'I have been accepted to both MIT CSAIL and ETH for systems research. How should I think about the trade-offs?',
        'Decision', @learner_nusrat_id, @now, @now);

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('Statement of purpose — how personal is too personal?',
        'How much personal narrative is appropriate in a statement of purpose? Some guides say keep it professional; others say tell your story.',
        'Applications', @learner_rafiul_id, @now, @now);

INSERT INTO forum_threads (title, body, category, author_id, created_at, updated_at)
VALUES ('First conference abroad: travel grants and visa logistics',
        'I have been accepted to present at a conference in Europe. Any advice on travel grants and navigating visa applications as a Bangladeshi student?',
        'Conferences', @learner_tanjila_id, @now, @now);

INSERT INTO forum_comments (thread_id, body, author_id, created_at, updated_at) VALUES
    (@thread_scholarship, 'Check the Prime Bank Foundation, Dutch-Bangla Bank, and ICT Division announcements every month.',
     @faculty_farhan_id, @now, @now),
    (@thread_scholarship, 'Keep scanned copies of NID, income certificates, and transcripts ready.',
     @learner_tanjila_id, @now, @now),
    (@thread_cse, 'Compare faculty research areas, lab access, internship connections, and alumni outcomes.',
     @faculty_farhan_id, @now, @now);

-- ---------------------------------------------------------------------------
-- Webinars — 3 Bangladesh + 5 international from mock.ts
-- ---------------------------------------------------------------------------
INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('Funding Pathways for Bangladesh',
        'Walkthrough of scholarship and funding routes for Bangladeshi students.',
        DATE_ADD(NOW(), INTERVAL 10 DAY),
        'https://meet.google.com/insightnest-bd-funding', 'SCHEDULED', 60,
        'BUET', @faculty_farhan_id, @now, @now);
SET @webinar_funding = LAST_INSERT_ID();

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('Research Skills for Bangladeshi Undergraduates',
        'Practical session on building a first research profile with local datasets.',
        DATE_SUB(NOW(), INTERVAL 15 DAY),
        'https://meet.google.com/insightnest-bd-research', 'COMPLETED', 90,
        'BRAC University', @faculty_sabina_id, @now, @now);
SET @webinar_research = LAST_INSERT_ID();

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('Public University Admission Q&A',
        'Live Q&A for Bangladeshi public university admission planning.',
        DATE_ADD(NOW(), INTERVAL 20 DAY),
        'https://meet.google.com/insightnest-bd-admission', 'CANCELED', 60,
        'BUET', @faculty_farhan_id, @now, @now);
SET @webinar_admission = LAST_INSERT_ID();

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('The Editorial Mind: Writing Statements That Read',
        'How to craft statements of purpose that read as literature — clarity, voice, and precision.',
        '2026-06-18 16:00:00',
        'https://meet.google.com/insightnest-wb-018', 'SCHEDULED', 60,
        'Birkbeck, University of London', @faculty_farhan_id, @now, @now);

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('Fellowship Strategy for the Mid-Career Researcher',
        'Practical strategies for securing fellowships at the mid-career stage.',
        '2026-06-25 15:00:00',
        'https://meet.google.com/insightnest-wb-019', 'SCHEDULED', 75,
        'Rhodes Trust', @faculty_sabina_id, @now, @now);

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('Open Science and the New Doctoral Curriculum',
        'How open science practices are reshaping doctoral training and publication.',
        '2026-07-02 14:00:00',
        'https://meet.google.com/insightnest-wb-020', 'SCHEDULED', 60,
        'Center for Open Science', @faculty_farhan_id, @now, @now);

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('Inside the Admissions Room — Cambridge Trinity',
        'A candid look at how applications are evaluated in elite admissions processes.',
        DATE_SUB(NOW(), INTERVAL 7 DAY),
        'https://meet.google.com/insightnest-wb-017', 'COMPLETED', 60,
        'Trinity College, Cambridge', @faculty_sabina_id, @now, @now);

INSERT INTO webinars (title, description, scheduled_at, meeting_link, status, duration_minutes, speaker_affiliation, host_id, created_at, updated_at)
VALUES ('From Honours Thesis to First Publication',
        'A guide to transforming your undergraduate thesis into a publishable research paper.',
        DATE_SUB(NOW(), INTERVAL 14 DAY),
        'https://meet.google.com/insightnest-wb-016', 'COMPLETED', 45,
        'University of Toronto', @faculty_farhan_id, @now, @now);

INSERT INTO webinar_registrations (webinar_id, user_id, status, created_at, updated_at)
VALUES
    (@webinar_funding, @learner_nusrat_id, 'REGISTERED', @now, @now),
    (@webinar_funding, @learner_rafiul_id, 'REGISTERED', @now, @now),
    (@webinar_research, @learner_tanjila_id, 'REGISTERED', @now, @now),
    (@webinar_admission, @learner_rafiul_id, 'CANCELED', @now, @now);

-- ---------------------------------------------------------------------------
-- Contact requests and FAQs
-- ---------------------------------------------------------------------------
INSERT INTO contact_requests (name, email, subject, message, status, created_at, updated_at) VALUES
    ('Rafiul Islam', 'student@insightnest.com', 'Bangladesh scholarship inquiry',
     'Need guidance on local scholarship deadlines.', 'NEW', @now, @now),
    ('Mst Rahima Begum', 'guardian@insightnest.com', 'Program application support',
     'I need help understanding application documents for my daughter.', 'IN_PROGRESS', @now, @now),
    ('Faculty Office', 'faculty.office@insightnest.com', 'Research collaboration listing',
     'Please add our public health student research opportunity.', 'RESOLVED', @now, @now);

INSERT INTO faqs (question, answer, active, created_at, updated_at) VALUES
    ('How do I apply for Bangladeshi programs?',
     'Create a learner profile, then apply from the program detail page.', 1, @now, @now),
    ('Can I submit multiple scholarship applications?',
     'Yes, as long as you meet each scholarship eligibility.', 1, @now, @now),
    ('Are local Bangladeshi scholarships listed?',
     'Yes. InsightNest includes government, foundation, bank, and ICT-focused opportunities relevant to Bangladesh.',
     1, @now, @now);

-- Optional refresh token placeholder for local database smoke tests.
INSERT INTO refresh_tokens (token, expires_at, revoked, user_id, created_at, updated_at)
VALUES ('seed-refresh-token', DATE_ADD(@now, INTERVAL 7 DAY), 0, @admin_id, @now, @now);
