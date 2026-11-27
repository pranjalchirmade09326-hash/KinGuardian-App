-- Migration: 002_seed_demo_data.sql
-- Description: Adds families table and idempotently seeds demo users, contacts, and default family circle.

CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    primary_coordinator_profile_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_families_coordinator ON families(primary_coordinator_profile_id);

DROP TRIGGER IF EXISTS trg_families_updated_at ON families;
CREATE TRIGGER trg_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO users (
    id, name, email, phone, role, blood_group, medical_conditions, allergies,
    city, country, timezone, emergency_notes, avatar_url
)
VALUES
(
    '11111111-1111-4111-8111-111111111111',
    'Anjali Sharma',
    'anjali@kinguardian.com',
    '447123456789',
    'coordinator',
    NULL,
    '[]'::jsonb,
    '[]'::jsonb,
    'London',
    'United Kingdom',
    'Europe/London',
    'Primary diaspora caregiver coordinator for parents in Chennai.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
),
(
    '22222222-2222-4222-8222-222222222222',
    'Ramesh Sharma',
    'ramesh@kinguardian.com',
    '919270756299',
    'parent',
    'B+',
    '["Hypertension", "Type 2 Diabetes"]'::jsonb,
    '["Penicillin"]'::jsonb,
    'Chennai',
    'India',
    'Asia/Kolkata',
    'Hypertension history; on Amlodipine 5mg and Atorvastatin 20mg.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO emergency_contacts (
    id, user_id, name, relationship, phone, email, is_primary, priority
)
VALUES
(
    '10000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'Priya',
    'Family Caregiver',
    '+91 92707 56299',
    'priya.care@kinguardian.com',
    TRUE,
    1
),
(
    '10000000-0000-4000-8000-000000000002',
    '22222222-2222-4222-8222-222222222222',
    'Anjali Sharma',
    'Daughter / Coordinator',
    '+44 7123 456789',
    'anjali@kinguardian.com',
    FALSE,
    2
),
(
    '10000000-0000-4000-8000-000000000003',
    '22222222-2222-4222-8222-222222222222',
    'Rahul Sharma',
    'Son (Dubai)',
    '+971 50 123 4567',
    'rahul@kinguardian.com',
    FALSE,
    3
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO families (id, name, primary_coordinator_profile_id)
VALUES (
    '33333333-3333-4333-8333-333333333333',
    'Sharma Family Care Circle',
    '11111111-1111-4111-8111-111111111111'
)
ON CONFLICT (id) DO NOTHING;
