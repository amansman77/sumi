-- su_interest_leads: 숨이(Sumi) 유료 의사 확인 폼 제출 저장 (shared-db, prefix su)
CREATE TABLE IF NOT EXISTS su_interest_leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name TEXT,
  contact TEXT,
  interest_parts TEXT NOT NULL,
  willing_to_pay INTEGER NOT NULL,
  message TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  page_path TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  consent_contact INTEGER NOT NULL DEFAULT 0
);
