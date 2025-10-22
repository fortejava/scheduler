USE [scheduler];
GO

-- Insert the test user with plain password
INSERT INTO Users (Username, Password)
VALUES ('testuser', 'testpass');
GO