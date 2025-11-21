-- ============================================
-- SQL SEED: Create Soft-Deleted Test Invoices
-- Purpose: Generate test data for deleted invoices feature
-- ============================================
-- Database: Spider (Invoice Management System)
-- Date: November 2025
-- Note: This creates 10 test invoices with InvoiceActive = 'N' (soft-deleted)
--       for testing the "Fatture Eliminate" (Deleted Invoices) view
-- ============================================

-- IMPORTANT: StatusID values
-- StatusID = 1 → "Saldata" (Paid) → Will display as GREEN
-- StatusID = 2 → "Non Saldata" (Unpaid) → Will display as YELLOW or RED
--   - YELLOW if InvoiceDueDate > TODAY (not yet overdue)
--   - RED if InvoiceDueDate <= TODAY (overdue)

-- ============================================
-- STEP 1: Get a valid CustomerID
-- ============================================
DECLARE @TestCustomerID INT = (SELECT TOP 1 CustomerID FROM Customers ORDER BY CustomerID);

-- Verify we have a customer
IF @TestCustomerID IS NULL
BEGIN
    RAISERROR('No customers found in database. Please create at least one customer first.', 16, 1);
    RETURN;
END

PRINT 'Using CustomerID: ' + CAST(@TestCustomerID AS VARCHAR(10));

-- ============================================
-- STEP 2: Insert 10 Soft-Deleted Test Invoices
-- ============================================

-- Invoice 1: Saldata (Paid), Deleted
-- Will display as: GREEN status
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9001', 'ORD-9001', @TestCustomerID, 1, '2025-01-15', '2025-02-15', 1000.00, 0.22, 1220.00, 'N');

-- Invoice 2: Non Saldata (Unpaid), NOT overdue (future date), Deleted
-- Will display as: YELLOW status (not yet overdue)
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9002', 'ORD-9002', @TestCustomerID, 2, '2025-02-01', '2025-12-31', 500.00, 0.22, 610.00, 'N');

-- Invoice 3: Non Saldata (Unpaid), OVERDUE (past date), Deleted
-- Will display as: RED status (overdue)
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9003', 'ORD-9003', @TestCustomerID, 2, '2024-12-01', '2024-12-15', 750.00, 0.22, 915.00, 'N');

-- Invoice 4: Saldata (Paid), Deleted
-- Will display as: GREEN status
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9004', 'ORD-9004', @TestCustomerID, 1, '2025-01-20', '2025-03-01', 1500.00, 0.22, 1830.00, 'N');

-- Invoice 5: Non Saldata (Unpaid), OVERDUE (past date), Deleted
-- Will display as: RED status (overdue)
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9005', 'ORD-9005', @TestCustomerID, 2, '2024-11-01', '2024-11-30', 2000.00, 0.22, 2440.00, 'N');

-- Invoice 6: Non Saldata (Unpaid), NOT overdue (future date), Deleted
-- Will display as: YELLOW status (not yet overdue)
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9006', 'ORD-9006', @TestCustomerID, 2, '2025-03-01', '2025-06-30', 800.00, 0.22, 976.00, 'N');

-- Invoice 7: Saldata (Paid), Deleted
-- Will display as: GREEN status
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9007', 'ORD-9007', @TestCustomerID, 1, '2025-02-10', '2025-04-15', 1200.00, 0.22, 1464.00, 'N');

-- Invoice 8: Non Saldata (Unpaid), OVERDUE (past date), Deleted
-- Will display as: RED status (overdue)
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9008', 'ORD-9008', @TestCustomerID, 2, '2024-10-01', '2024-10-31', 3000.00, 0.22, 3660.00, 'N');

-- Invoice 9: Non Saldata (Unpaid), NOT overdue (future date), Deleted
-- Will display as: YELLOW status (not yet overdue)
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9009', 'ORD-9009', @TestCustomerID, 2, '2025-04-01', '2025-09-30', 600.00, 0.22, 732.00, 'N');

-- Invoice 10: Saldata (Paid), Deleted
-- Will display as: GREEN status
INSERT INTO Invoices (InvoiceNumber, InvoiceOrderNumber, CustomerID, StatusID, InvoiceCreationDate, InvoiceDueDate, InvoiceTaxable, InvoiceTax, InvoiceDue, InvoiceActive)
VALUES ('TEST-9010', 'ORD-9010', @TestCustomerID, 1, '2025-03-15', '2025-05-01', 1800.00, 0.22, 2196.00, 'N');

-- ============================================
-- STEP 3: Verify Test Data
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'TEST INVOICES CREATED SUCCESSFULLY';
PRINT '============================================';
PRINT '';

SELECT
    InvoiceID,
    InvoiceNumber,
    InvoiceOrderNumber,
    StatusID,
    InvoiceDueDate,
    InvoiceDue,
    InvoiceActive,
    CASE
        WHEN StatusID = 1 THEN 'Saldata (Green)'
        WHEN StatusID = 2 AND InvoiceDueDate > GETDATE() THEN 'Non Saldata - Not Overdue (Yellow)'
        WHEN StatusID = 2 AND InvoiceDueDate <= GETDATE() THEN 'Non Saldata - OVERDUE (Red)'
        ELSE 'Unknown'
    END AS ExpectedDisplay
FROM Invoices
WHERE InvoiceNumber LIKE 'TEST-%'
ORDER BY InvoiceNumber;

PRINT '';
PRINT 'Total test invoices created: 10';
PRINT '';
PRINT '============================================';
PRINT 'CLEANUP INSTRUCTIONS';
PRINT '============================================';
PRINT 'To remove test data after testing, run:';
PRINT '';
PRINT '  DELETE FROM Invoices WHERE InvoiceNumber LIKE ''TEST-%'';';
PRINT '';
PRINT '============================================';
