-- M1: users table only. All other tables added in later milestones.

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed the single application user.
-- Password placeholder — replace with a real bcrypt hash (cost 12) before first run.
-- Generate with Spring's BCryptPasswordEncoder(12).encode("yourpassword")
-- or any standard bcrypt tool.
INSERT INTO users (username, password_hash)
VALUES ('admin', '$2a$12$4lIPaI0XfqZXJDg23ybsj.FxAiEqDhQfzquSbYqTDySJxxfAcLbiy');
