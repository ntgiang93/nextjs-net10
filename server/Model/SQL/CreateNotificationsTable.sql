-- Create Notifications table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE [dbo].[Notifications](
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Title] NVARCHAR(200) NOT NULL,
        [Message] NVARCHAR(1000) NOT NULL,
        [Type] NVARCHAR(50) NOT NULL DEFAULT 'Info',
        [Link] NVARCHAR(500) NULL,
        [IsRead] BIT NOT NULL DEFAULT 0,
        [ReadAt] DATETIME2 NULL,
        [UserId] NVARCHAR(32) NOT NULL,
        [Metadata] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 NULL,
        [IsDeleted] BIT NOT NULL DEFAULT 0,
        [DeletedAt] DATETIME2 NULL,
        CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) 
            REFERENCES [Users]([Id]) ON DELETE CASCADE
    );

    -- Create indexes for better performance
    CREATE INDEX [IX_Notifications_UserId] ON [Notifications]([UserId]);
    CREATE INDEX [IX_Notifications_IsRead] ON [Notifications]([IsRead]);
    CREATE INDEX [IX_Notifications_CreatedAt] ON [Notifications]([CreatedAt] DESC);
    CREATE INDEX [IX_Notifications_UserId_IsRead] ON [Notifications]([UserId], [IsRead]);

    PRINT 'Notifications table created successfully';
END
ELSE
BEGIN
    PRINT 'Notifications table already exists';
END
GO

-- Sample data (optional)
-- INSERT INTO Notifications (Title, Message, Type, UserId, CreatedAt)
-- VALUES 
--     ('Welcome', 'Welcome to the system!', 'Info', 1, GETUTCDATE()),
--     ('New Feature', 'Check out our new feature!', 'Success', 1, GETUTCDATE()),
--     ('Maintenance', 'System maintenance scheduled', 'Warning', 1, GETUTCDATE());

