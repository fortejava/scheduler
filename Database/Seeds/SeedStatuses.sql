-- ==============================================
-- SEED DATA: Status Labels
-- ==============================================
-- Purpose: Seeds the Status table with invoice status labels
-- Statuses: Saldato (Paid), Non Saldato (Unpaid), Scaduto (Overdue)
-- Safe: Idempotent with IF NOT EXISTS checks
-- ==============================================

USE [scheduler]
GO

PRINT 'Seeding Status table...';

-- Insert Saldato (Paid)
IF NOT EXISTS (SELECT * FROM [dbo].[Status] WHERE [StatusLabel] = 'Saldato')
BEGIN
    INSERT INTO [dbo].[Status] ([StatusLabel]) VALUES (N'Saldato');
    PRINT '✓ Inserted: Saldato (Paid)';
END
ELSE
BEGIN
    PRINT '⚠ Saldato already exists - skipping';
END

-- Insert Non Saldato (Unpaid)
IF NOT EXISTS (SELECT * FROM [dbo].[Status] WHERE [StatusLabel] = 'Non Saldato')
BEGIN
    INSERT INTO [dbo].[Status] ([StatusLabel]) VALUES (N'Non Saldato');
    PRINT '✓ Inserted: Non Saldato (Unpaid)';
END
ELSE
BEGIN
    PRINT '⚠ Non Saldato already exists - skipping';
END

-- Insert Scaduto (Overdue)
IF NOT EXISTS (SELECT * FROM [dbo].[Status] WHERE [StatusLabel] = 'Scaduto')
BEGIN
    INSERT INTO [dbo].[Status] ([StatusLabel]) VALUES (N'Scaduto');
    PRINT '✓ Inserted: Scaduto (Overdue)';
END
ELSE
BEGIN
    PRINT '⚠ Scaduto already exists - skipping';
END

PRINT 'Status seeding complete!';
GO
