USE [scheduler]
GO

-- 3. Modifica la colonna (SQL Server gestisce automaticamente UNIQUE constraint e INDEX)
ALTER TABLE [dbo].[Sessions]
ALTER COLUMN [SessionToken] [nvarchar](150) NOT NULL;

-- 4. Verifica che la modifica sia stata applicata
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Sessions' AND COLUMN_NAME = 'SessionToken';

PRINT 'SessionToken successfully updated to nvarchar(150)';
GO