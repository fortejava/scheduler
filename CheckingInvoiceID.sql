USE [scheduler];
GO

--DBCC CHECKIDENT ('dbo.Invoices', RESEED, 13);
DBCC CHECKIDENT ('dbo.Invoices', NORESEED);