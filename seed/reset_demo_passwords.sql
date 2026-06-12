-- Reset seeded demo account passwords back to the README credentials.
-- Password for every account below: Admin@123

SET @demo_password = '$2a$10$9oE0KtW/E2Z23iipeorlHuFRFBdh3sZQDdeHhNQzuPbELtXBdm6ia';

UPDATE users
SET password = @demo_password,
    enabled = 1,
    suspended = 0,
    updated_at = NOW()
WHERE email IN (
    'admin@insightnest.com',
    'nusrat.jahan@insightnest.com',
    'rafiul.islam@insightnest.com',
    'tanjila.akter@insightnest.com',
    'farhan.rahman@insightnest.com',
    'sabina.yasmin@insightnest.com',
    'rep.demo@insightnest.com'
);

INSERT IGNORE INTO user_roles (user_id, roles)
SELECT id, 'ADMIN'
FROM users
WHERE email = 'admin@insightnest.com';

INSERT IGNORE INTO user_roles (user_id, roles)
SELECT id, 'LEARNER'
FROM users
WHERE email IN (
    'nusrat.jahan@insightnest.com',
    'rafiul.islam@insightnest.com',
    'tanjila.akter@insightnest.com'
);

INSERT IGNORE INTO user_roles (user_id, roles)
SELECT id, 'FACULTY'
FROM users
WHERE email IN (
    'farhan.rahman@insightnest.com',
    'sabina.yasmin@insightnest.com'
);

INSERT IGNORE INTO user_roles (user_id, roles)
SELECT id, 'UNIVERSITY_REP'
FROM users
WHERE email = 'rep.demo@insightnest.com';
