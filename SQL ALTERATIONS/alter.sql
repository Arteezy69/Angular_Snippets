-- Step 1: Drop the existing 'Id' column
ALTER TABLE [dbo].[todos]
DROP COLUMN [Id];

-- Step 2: Add the 'Id' column with the identity property
ALTER TABLE [dbo].[todos]
ADD [Id] INT IDENTITY(1,1) PRIMARY KEY;


ALTER TABLE [dbo].[todos]
ALTER COLUMN [CreatedBy] [datetime] NULL;