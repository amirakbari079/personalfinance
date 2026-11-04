-- Slice 9: advisor session, recommendation lifecycle, thesis, snapshot binding, response cache.

CREATE TABLE advisor_prompt_versions (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(16)  NOT NULL UNIQUE,
    system_prompt   TEXT         NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE advisor_sessions (
    id                      BIGSERIAL PRIMARY KEY,
    question                TEXT         NOT NULL,
    objective               VARCHAR(200),
    selected_assets         VARCHAR(256) NOT NULL,
    capital_amount          BIGINT,
    currency                VARCHAR(8)   NOT NULL DEFAULT 'IRT',
    time_horizon            VARCHAR(16),
    risk_tolerance          VARCHAR(24)  NOT NULL DEFAULT 'UNSPECIFIED',
    liquidity_requirement   VARCHAR(16)  NOT NULL DEFAULT 'UNSPECIFIED',
    constraints_text        VARCHAR(500),
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE advisor_recommendations (
    id                      BIGSERIAL PRIMARY KEY,
    session_id              BIGINT       NOT NULL REFERENCES advisor_sessions(id),
    market_snapshot_id      BIGINT       REFERENCES fi_market_snapshots(id),
    prompt_version_id       BIGINT       NOT NULL REFERENCES advisor_prompt_versions(id),
    cache_key               VARCHAR(64)  NOT NULL,
    decision_key            VARCHAR(64)  NOT NULL,
    model                   VARCHAR(80)  NOT NULL,
    provider                VARCHAR(16)  NOT NULL,
    is_fake                 BOOLEAN      NOT NULL DEFAULT FALSE,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    status_reason           VARCHAR(300),
    body                    TEXT         NOT NULL,
    reasoning_summary       VARCHAR(300) NOT NULL,
    confidence              SMALLINT,
    reuse_count             INTEGER      NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE advisor_investment_theses (
    id                          BIGSERIAL PRIMARY KEY,
    recommendation_id           BIGINT       NOT NULL UNIQUE REFERENCES advisor_recommendations(id),
    title                       VARCHAR(200) NOT NULL,
    asset_symbol                VARCHAR(32),
    assumptions                 TEXT,
    bull_case                   TEXT,
    bear_case                   TEXT,
    invalidation_conditions     TEXT,
    status                      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_advisor_rec_cache_key
    ON advisor_recommendations (cache_key, created_at DESC);

CREATE INDEX idx_advisor_rec_decision_status
    ON advisor_recommendations (decision_key, status);

CREATE INDEX idx_advisor_rec_snapshot
    ON advisor_recommendations (market_snapshot_id);

CREATE INDEX idx_advisor_rec_created
    ON advisor_recommendations (created_at DESC);

INSERT INTO advisor_prompt_versions (code, system_prompt, is_active) VALUES (
    '1.0',
    $prompt$You are a financial advisor assistant for a Persian personal-finance app.
The JSON context is the only market truth. Do not invent prices, returns, or macro figures.
If a field is missing, say it is unavailable. Reply in Persian. Keep the answer short.
Always mention marketSnapshotId when giving advice.
Do not guarantee profit. Treat any probabilities as analytical estimates, not statistical certainty.
Structure the answer as: وضعیت، عوامل مهم، ریسک، استراتژی‌های ممکن، چه چیزی تحلیل را باطل می‌کند، اطمینان داده.
$prompt$,
    TRUE
);
