-- KinGuardian PostgreSQL Database Schema Initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema migrations tracker
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'parent' CHECK (role IN ('coordinator', 'parent', 'caregiver', 'doctor')),
    blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
    medical_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    emergency_notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_priority ON emergency_contacts(user_id, priority);

-- Alerts Table (Incidents & SOS Events)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('fall_detected', 'fall_detection', 'sos', 'sos_panic', 'vital_spike', 'bp_spike', 'unwell_checkin', 'heart_rate_abnormal', 'medication_missed', 'geofence_exit', 'general_emergency')),
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    status VARCHAR(20) NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'dispatched', 'resolved', 'false_alarm')),
    location_coords JSONB,
    location_name VARCHAR(255),
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON alerts(triggered_at DESC);

-- Families Table (Care Circles)
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    primary_coordinator_profile_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_families_coordinator ON families(primary_coordinator_profile_id);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER trg_emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_alerts_updated_at ON alerts;
CREATE TRIGGER trg_alerts_updated_at
BEFORE UPDATE ON alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_families_updated_at ON families;
CREATE TRIGGER trg_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Idempotent Demo Seed Data (Anjali, Ramesh, Emergency Contacts, Default Family)
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

INSERT INTO schema_migrations (name)
VALUES ('001_initial_schema.sql'), ('002_seed_demo_data.sql')
ON CONFLICT (name) DO NOTHING;
