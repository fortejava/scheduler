-- ============================================================================
-- TEST DATA: 70 INVOICES FOR 2025-11-20 (CORRECTED VERSION)
-- ============================================================================
-- Purpose: Test calendar event limiting (30-event limit) and smart sorting
-- Distribution: 20 Paid, 30 Pending (Unpaid), 20 Overdue (Unpaid + DueDate passed)
--
-- SCHEMA VERIFIED FROM: scheduler_schema_SSMS21_generated_improved.sql
--
-- CORRECT FIELD NAMES:
-- - InvoiceNumber [nvarchar](50) NOT NULL
-- - InvoiceOrderNumber [nvarchar](50) NOT NULL  ← ADDED
-- - CustomerID [int] NOT NULL
-- - InvoiceDescription [text] NULL
-- - InvoiceTaxable [decimal](18, 2) NOT NULL    ← ADDED (base amount)
-- - InvoiceTax [decimal](2, 2) NOT NULL         ← Tax RATE (0.22 = 22%)
-- - InvoiceDue [decimal](18, 2) NOT NULL        ← Total amount (taxable + tax)
-- - StatusID [int] NOT NULL
-- - InvoiceCreationDate [date] NOT NULL         ← ADDED
-- - InvoiceDueDate [date] NOT NULL              ← CORRECT NAME
-- - InvoiceActive [nchar](1) NOT NULL           ← ADDED ('Y' or 'N')
--
-- Date: 2025-11-19
-- ============================================================================

USE [scheduler]
GO

-- ============================================================================
-- STEP 1: INSERT TEST CUSTOMERS (70 customers for 70 invoices)
-- ============================================================================
PRINT 'Inserting 70 test customers...'

DECLARE @CustomerStartID INT;

-- Insert 70 test customers
INSERT INTO [dbo].[Customers] ([CustomerName])
VALUES
    (N'Test70Invoice_001'), (N'Test70Invoice_002'), (N'Test70Invoice_003'), (N'Test70Invoice_004'), (N'Test70Invoice_005'),
    (N'Test70Invoice_006'), (N'Test70Invoice_007'), (N'Test70Invoice_008'), (N'Test70Invoice_009'), (N'Test70Invoice_010'),
    (N'Test70Invoice_011'), (N'Test70Invoice_012'), (N'Test70Invoice_013'), (N'Test70Invoice_014'), (N'Test70Invoice_015'),
    (N'Test70Invoice_016'), (N'Test70Invoice_017'), (N'Test70Invoice_018'), (N'Test70Invoice_019'), (N'Test70Invoice_020'),
    (N'Test70Invoice_021'), (N'Test70Invoice_022'), (N'Test70Invoice_023'), (N'Test70Invoice_024'), (N'Test70Invoice_025'),
    (N'Test70Invoice_026'), (N'Test70Invoice_027'), (N'Test70Invoice_028'), (N'Test70Invoice_029'), (N'Test70Invoice_030'),
    (N'Test70Invoice_031'), (N'Test70Invoice_032'), (N'Test70Invoice_033'), (N'Test70Invoice_034'), (N'Test70Invoice_035'),
    (N'Test70Invoice_036'), (N'Test70Invoice_037'), (N'Test70Invoice_038'), (N'Test70Invoice_039'), (N'Test70Invoice_040'),
    (N'Test70Invoice_041'), (N'Test70Invoice_042'), (N'Test70Invoice_043'), (N'Test70Invoice_044'), (N'Test70Invoice_045'),
    (N'Test70Invoice_046'), (N'Test70Invoice_047'), (N'Test70Invoice_048'), (N'Test70Invoice_049'), (N'Test70Invoice_050'),
    (N'Test70Invoice_051'), (N'Test70Invoice_052'), (N'Test70Invoice_053'), (N'Test70Invoice_054'), (N'Test70Invoice_055'),
    (N'Test70Invoice_056'), (N'Test70Invoice_057'), (N'Test70Invoice_058'), (N'Test70Invoice_059'), (N'Test70Invoice_060'),
    (N'Test70Invoice_061'), (N'Test70Invoice_062'), (N'Test70Invoice_063'), (N'Test70Invoice_064'), (N'Test70Invoice_065'),
    (N'Test70Invoice_066'), (N'Test70Invoice_067'), (N'Test70Invoice_068'), (N'Test70Invoice_069'), (N'Test70Invoice_070');

-- Get the starting CustomerID for mapping to invoices
SELECT @CustomerStartID = MIN(CustomerID)
FROM [dbo].[Customers]
WHERE CustomerName LIKE 'Test70Invoice_%';

PRINT 'Test customers inserted. Starting CustomerID: ' + CAST(@CustomerStartID AS NVARCHAR(10));

-- ============================================================================
-- STEP 2: INSERT 70 TEST INVOICES
-- ============================================================================
PRINT 'Inserting 70 test invoices...'

-- Invoice counter for generating unique numbers
DECLARE @Counter INT = 1;
DECLARE @InvoiceNumber NVARCHAR(50);
DECLARE @InvoiceOrderNumber NVARCHAR(50);
DECLARE @CustomerID INT;
DECLARE @InvoiceDescription NVARCHAR(MAX);  -- Fixed: TEXT not allowed for variables
DECLARE @InvoiceTaxable DECIMAL(18, 2);
DECLARE @InvoiceTax DECIMAL(2, 2);
DECLARE @InvoiceDue DECIMAL(18, 2);
DECLARE @StatusID INT;
DECLARE @InvoiceCreationDate DATE;
DECLARE @InvoiceDueDate DATE;
DECLARE @InvoiceActive NCHAR(1);

-- ============================================================================
-- GROUP 1: 20 PAID INVOICES (StatusID = 1, any DueDate on 2025-11-20)
-- ============================================================================
PRINT 'Inserting 20 PAID invoices (Green - StatusCode 0)...'

WHILE @Counter <= 20
BEGIN
    SET @InvoiceNumber = 'TEST_70_' + RIGHT('000' + CAST(@Counter AS NVARCHAR(3)), 3);
    SET @InvoiceOrderNumber = 'ORD_TEST_70_' + RIGHT('000' + CAST(@Counter AS NVARCHAR(3)), 3);
    SET @CustomerID = @CustomerStartID + (@Counter - 1);
    SET @InvoiceDescription = 'Test invoice ' + CAST(@Counter AS NVARCHAR(3)) + ' - PAID';
    SET @InvoiceTaxable = 1000.00 + (@Counter * 100.00);  -- €1,100 to €2,000 (base)
    SET @InvoiceTax = 0.22;  -- 22% tax rate
    SET @InvoiceDue = @InvoiceTaxable * (1 + @InvoiceTax);  -- Total with tax
    SET @StatusID = 1;  -- Saldata (Paid)
    SET @InvoiceCreationDate = '2025-11-01';
    SET @InvoiceDueDate = '2025-11-20';  -- Tomorrow
    SET @InvoiceActive = 'Y';

    INSERT INTO [dbo].[Invoices]
    (
        [InvoiceNumber],
        [InvoiceOrderNumber],
        [CustomerID],
        [InvoiceDescription],
        [InvoiceTaxable],
        [InvoiceTax],
        [InvoiceDue],
        [StatusID],
        [InvoiceCreationDate],
        [InvoiceDueDate],
        [InvoiceActive]
    )
    VALUES
    (
        @InvoiceNumber,
        @InvoiceOrderNumber,
        @CustomerID,
        @InvoiceDescription,
        @InvoiceTaxable,
        @InvoiceTax,
        @InvoiceDue,
        @StatusID,
        @InvoiceCreationDate,
        @InvoiceDueDate,
        @InvoiceActive
    );

    SET @Counter = @Counter + 1;
END

-- ============================================================================
-- GROUP 2: 30 PENDING INVOICES (StatusID = 2, DueDate late on 2025-11-20)
-- ============================================================================
PRINT 'Inserting 30 PENDING invoices (Yellow - StatusCode 1)...'

WHILE @Counter <= 50
BEGIN
    SET @InvoiceNumber = 'TEST_70_' + RIGHT('000' + CAST(@Counter AS NVARCHAR(3)), 3);
    SET @InvoiceOrderNumber = 'ORD_TEST_70_' + RIGHT('000' + CAST(@Counter AS NVARCHAR(3)), 3);
    SET @CustomerID = @CustomerStartID + (@Counter - 1);
    SET @InvoiceDescription = 'Test invoice ' + CAST(@Counter AS NVARCHAR(3)) + ' - PENDING';
    SET @InvoiceTaxable = 2000.00 + (@Counter * 100.00);  -- €2,100 to €5,000 (base)
    SET @InvoiceTax = 0.22;  -- 22% tax rate
    SET @InvoiceDue = @InvoiceTaxable * (1 + @InvoiceTax);  -- Total with tax
    SET @StatusID = 2;  -- Non Saldata (Unpaid)
    SET @InvoiceCreationDate = '2025-11-01';
    SET @InvoiceDueDate = '2025-11-20';  -- Tomorrow (will be pending if viewed today)
    SET @InvoiceActive = 'Y';

    INSERT INTO [dbo].[Invoices]
    (
        [InvoiceNumber],
        [InvoiceOrderNumber],
        [CustomerID],
        [InvoiceDescription],
        [InvoiceTaxable],
        [InvoiceTax],
        [InvoiceDue],
        [StatusID],
        [InvoiceCreationDate],
        [InvoiceDueDate],
        [InvoiceActive]
    )
    VALUES
    (
        @InvoiceNumber,
        @InvoiceOrderNumber,
        @CustomerID,
        @InvoiceDescription,
        @InvoiceTaxable,
        @InvoiceTax,
        @InvoiceDue,
        @StatusID,
        @InvoiceCreationDate,
        @InvoiceDueDate,
        @InvoiceActive
    );

    SET @Counter = @Counter + 1;
END

-- ============================================================================
-- GROUP 3: 20 OVERDUE INVOICES (StatusID = 2, DueDate early on 2025-11-20)
-- ============================================================================
PRINT 'Inserting 20 OVERDUE invoices (Red - StatusCode 2)...'

-- For overdue invoices, set DueDate to yesterday (2025-11-18)
-- This ensures they appear as OVERDUE when viewed on 2025-11-19 or later

WHILE @Counter <= 70
BEGIN
    SET @InvoiceNumber = 'TEST_70_' + RIGHT('000' + CAST(@Counter AS NVARCHAR(3)), 3);
    SET @InvoiceOrderNumber = 'ORD_TEST_70_' + RIGHT('000' + CAST(@Counter AS NVARCHAR(3)), 3);
    SET @CustomerID = @CustomerStartID + (@Counter - 1);
    SET @InvoiceDescription = 'Test invoice ' + CAST(@Counter AS NVARCHAR(3)) + ' - OVERDUE';
    SET @InvoiceTaxable = 5000.00 + (@Counter * 100.00);  -- €5,100 to €7,000 (base)
    SET @InvoiceTax = 0.22;  -- 22% tax rate
    SET @InvoiceDue = @InvoiceTaxable * (1 + @InvoiceTax);  -- Total with tax
    SET @StatusID = 2;  -- Non Saldata (Unpaid)
    SET @InvoiceCreationDate = '2025-11-01';
    SET @InvoiceDueDate = '2025-11-18';  -- Day before yesterday (OVERDUE)
    SET @InvoiceActive = 'Y';

    INSERT INTO [dbo].[Invoices]
    (
        [InvoiceNumber],
        [InvoiceOrderNumber],
        [CustomerID],
        [InvoiceDescription],
        [InvoiceTaxable],
        [InvoiceTax],
        [InvoiceDue],
        [StatusID],
        [InvoiceCreationDate],
        [InvoiceDueDate],
        [InvoiceActive]
    )
    VALUES
    (
        @InvoiceNumber,
        @InvoiceOrderNumber,
        @CustomerID,
        @InvoiceDescription,
        @InvoiceTaxable,
        @InvoiceTax,
        @InvoiceDue,
        @StatusID,
        @InvoiceCreationDate,
        @InvoiceDueDate,
        @InvoiceActive
    );

    SET @Counter = @Counter + 1;
END

-- ============================================================================
-- VERIFICATION
-- ============================================================================
PRINT '============================================================================'
PRINT 'TEST DATA INSERTED SUCCESSFULLY!'
PRINT '============================================================================'

SELECT
    'PAID (Green)' AS InvoiceType,
    COUNT(*) AS Count,
    MIN(InvoiceDue) AS MinAmount,
    MAX(InvoiceDue) AS MaxAmount,
    MIN(InvoiceDueDate) AS EarliestDue,
    MAX(InvoiceDueDate) AS LatestDue
FROM [dbo].[Invoices]
WHERE InvoiceNumber LIKE 'TEST_70_%' AND StatusID = 1

UNION ALL

SELECT
    'PENDING (Yellow)' AS InvoiceType,
    COUNT(*) AS Count,
    MIN(InvoiceDue) AS MinAmount,
    MAX(InvoiceDue) AS MaxAmount,
    MIN(InvoiceDueDate) AS EarliestDue,
    MAX(InvoiceDueDate) AS LatestDue
FROM [dbo].[Invoices]
WHERE InvoiceNumber LIKE 'TEST_70_%' AND StatusID = 2 AND InvoiceDueDate = '2025-11-20'

UNION ALL

SELECT
    'OVERDUE (Red)' AS InvoiceType,
    COUNT(*) AS Count,
    MIN(InvoiceDue) AS MinAmount,
    MAX(InvoiceDue) AS MaxAmount,
    MIN(InvoiceDueDate) AS EarliestDue,
    MAX(InvoiceDueDate) AS LatestDue
FROM [dbo].[Invoices]
WHERE InvoiceNumber LIKE 'TEST_70_%' AND StatusID = 2 AND InvoiceDueDate = '2025-11-18'

UNION ALL

SELECT
    'TOTAL' AS InvoiceType,
    COUNT(*) AS Count,
    MIN(InvoiceDue) AS MinAmount,
    MAX(InvoiceDue) AS MaxAmount,
    MIN(InvoiceDueDate) AS EarliestDue,
    MAX(InvoiceDueDate) AS LatestDue
FROM [dbo].[Invoices]
WHERE InvoiceNumber LIKE 'TEST_70_%';

PRINT '============================================================================'
PRINT 'Expected Results:'
PRINT '  - 20 PAID invoices (Green) - DueDate: 2025-11-20'
PRINT '  - 30 PENDING invoices (Yellow) - DueDate: 2025-11-20 (not overdue yet)'
PRINT '  - 20 OVERDUE invoices (Red) - DueDate: 2025-11-18 (past due)'
PRINT ''
PRINT 'To view on calendar:'
PRINT '  - Navigate to 2025-11-20 for PAID and PENDING invoices'
PRINT '  - Navigate to 2025-11-18 for OVERDUE invoices'
PRINT '  - Or navigate to Month view (November 2025) to see all'
PRINT ''
PRINT 'Smart sorting priority: Overdue (Red) → Pending (Yellow) → Paid (Green)'
PRINT '============================================================================'

GO
