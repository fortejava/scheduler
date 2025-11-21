-- ============================================================================
-- CLEANUP: DELETE 70 TEST INVOICES AND CUSTOMERS (CORRECTED VERSION)
-- ============================================================================
-- Purpose: Remove all test data created by test_data_70_invoices_CORRECTED.sql
-- Date: 2025-11-19
-- ============================================================================

USE [scheduler]
GO

PRINT '============================================================================'
PRINT 'CLEANUP: Deleting 70 test invoices and customers...'
PRINT '============================================================================'

-- ============================================================================
-- STEP 1: DELETE TEST INVOICES
-- ============================================================================
PRINT 'Deleting test invoices...'

DELETE FROM [dbo].[Invoices]
WHERE InvoiceNumber LIKE 'TEST_70_%';

PRINT 'Test invoices deleted: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));

-- ============================================================================
-- STEP 2: DELETE TEST CUSTOMERS
-- ============================================================================
PRINT 'Deleting test customers...'

DELETE FROM [dbo].[Customers]
WHERE CustomerName LIKE 'Test70Invoice_%';

PRINT 'Test customers deleted: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));

-- ============================================================================
-- VERIFICATION
-- ============================================================================
PRINT '============================================================================'
PRINT 'VERIFICATION: Checking for remaining test data...'
PRINT '============================================================================'

DECLARE @RemainingInvoices INT;
DECLARE @RemainingCustomers INT;

SELECT @RemainingInvoices = COUNT(*)
FROM [dbo].[Invoices]
WHERE InvoiceNumber LIKE 'TEST_70_%';

SELECT @RemainingCustomers = COUNT(*)
FROM [dbo].[Customers]
WHERE CustomerName LIKE 'Test70Invoice_%';

IF @RemainingInvoices = 0 AND @RemainingCustomers = 0
BEGIN
    PRINT 'SUCCESS: All test data has been deleted.'
    PRINT 'Remaining test invoices: 0'
    PRINT 'Remaining test customers: 0'
END
ELSE
BEGIN
    PRINT 'WARNING: Some test data still remains!'
    PRINT 'Remaining test invoices: ' + CAST(@RemainingInvoices AS NVARCHAR(10))
    PRINT 'Remaining test customers: ' + CAST(@RemainingCustomers AS NVARCHAR(10))
END

PRINT '============================================================================'
PRINT 'CLEANUP COMPLETE'
PRINT '============================================================================'

GO
