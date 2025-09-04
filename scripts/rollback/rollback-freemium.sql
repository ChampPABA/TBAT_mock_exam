-- =====================================================
-- TBAT Freemium Migration Rollback Script
-- Version: 1.0
-- Date: 2025-01-03
-- Purpose: Rollback database changes from Freemium migration
-- =====================================================

-- SAFETY CHECK: Ensure backup exists before proceeding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name LIKE 'backup_%'
    ) THEN
        RAISE EXCEPTION 'No backup schema found. Cannot proceed with rollback.';
    END IF;
END $$;

-- =====================================================
-- STEP 1: Drop Freemium-specific objects
-- =====================================================

-- Drop new tables if they exist
DROP TABLE IF EXISTS registrations_v2 CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS tier_features CASCADE;

-- Drop indexes added for Freemium
DROP INDEX IF EXISTS idx_users_tier;
DROP INDEX IF EXISTS idx_users_line_id;
DROP INDEX IF EXISTS idx_codes_user_id;
DROP INDEX IF EXISTS idx_codes_status;
DROP INDEX IF EXISTS idx_registrations_exam_ticket;

-- =====================================================
-- STEP 2: Remove Freemium columns from existing tables
-- =====================================================

-- Remove columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS line_id CASCADE,
DROP COLUMN IF EXISTS tier CASCADE,
DROP COLUMN IF EXISTS free_subject CASCADE,
DROP COLUMN IF EXISTS parent_name CASCADE,
DROP COLUMN IF EXISTS parent_relation CASCADE,
DROP COLUMN IF EXISTS parent_phone CASCADE,
DROP COLUMN IF EXISTS parent_email CASCADE;

-- Remove columns from codes table (if modified)
ALTER TABLE codes
DROP COLUMN IF EXISTS type CASCADE,
DROP COLUMN IF EXISTS subject CASCADE,
DROP COLUMN IF EXISTS upgraded_at CASCADE;

-- =====================================================
-- STEP 3: Restore original schema constraints
-- =====================================================

-- Restore original codes table structure
ALTER TABLE codes 
ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- Restore original users table constraints
-- (Add any original constraints that were modified)

-- =====================================================
-- STEP 4: Restore data from backup
-- =====================================================

-- Function to find latest backup schema
CREATE OR REPLACE FUNCTION find_latest_backup_schema()
RETURNS TEXT AS $$
DECLARE
    backup_schema TEXT;
BEGIN
    SELECT schema_name INTO backup_schema
    FROM information_schema.schemata
    WHERE schema_name LIKE 'backup_%'
    ORDER BY schema_name DESC
    LIMIT 1;
    
    RETURN backup_schema;
END;
$$ LANGUAGE plpgsql;

-- Get the latest backup schema
DO $$
DECLARE
    backup_schema TEXT;
BEGIN
    backup_schema := find_latest_backup_schema();
    
    IF backup_schema IS NOT NULL THEN
        RAISE NOTICE 'Using backup schema: %', backup_schema;
        
        -- Restore users table
        EXECUTE format('
            TRUNCATE TABLE public.users CASCADE;
            INSERT INTO public.users 
            SELECT * FROM %I.users;
        ', backup_schema);
        
        -- Restore codes table
        EXECUTE format('
            TRUNCATE TABLE public.codes CASCADE;
            INSERT INTO public.codes 
            SELECT * FROM %I.codes;
        ', backup_schema);
        
        -- Restore registrations table
        EXECUTE format('
            TRUNCATE TABLE public.registrations CASCADE;
            INSERT INTO public.registrations 
            SELECT * FROM %I.registrations;
        ', backup_schema);
        
        RAISE NOTICE 'Data restored from backup schema %', backup_schema;
    ELSE
        RAISE EXCEPTION 'No backup schema found for data restoration';
    END IF;
END $$;

-- =====================================================
-- STEP 5: Recreate original indexes
-- =====================================================

-- Recreate original indexes (adjust based on your original schema)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);

-- =====================================================
-- STEP 6: Reset sequences
-- =====================================================

-- Reset all sequences to max values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('codes_id_seq', (SELECT MAX(id) FROM codes));
SELECT setval('registrations_id_seq', (SELECT MAX(id) FROM registrations));

-- =====================================================
-- STEP 7: Verify rollback
-- =====================================================

-- Verification queries
DO $$
DECLARE
    user_count INTEGER;
    code_count INTEGER;
    reg_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO code_count FROM codes;
    SELECT COUNT(*) INTO reg_count FROM registrations;
    
    RAISE NOTICE 'Rollback verification:';
    RAISE NOTICE '  Users: % records', user_count;
    RAISE NOTICE '  Codes: % records', code_count;
    RAISE NOTICE '  Registrations: % records', reg_count;
    
    -- Check that Freemium columns don't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'tier'
    ) THEN
        RAISE WARNING 'Freemium columns still exist in users table';
    END IF;
END $$;

-- =====================================================
-- STEP 8: Clean up temporary objects
-- =====================================================

DROP FUNCTION IF EXISTS find_latest_backup_schema();

-- =====================================================
-- FINAL: Rollback summary
-- =====================================================

SELECT 
    'ROLLBACK COMPLETED' as status,
    NOW() as completed_at,
    current_database() as database,
    current_user as executed_by;