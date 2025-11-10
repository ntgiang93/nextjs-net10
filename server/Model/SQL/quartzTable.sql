CREATE TABLE [dbo].[JobConfigurations] (
                                           [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                           [JobName] NVARCHAR(200) NOT NULL,
                                           [JobGroup] NVARCHAR(200) NOT NULL,
                                           [JobType] NVARCHAR(500) NOT NULL,
                                           [CronExpression] NVARCHAR(100) NOT NULL,
                                           [Description] NVARCHAR(500) NULL,
                                           [JobDataJson] NVARCHAR(MAX) NULL,
                                           [IsActive] BIT NOT NULL DEFAULT 1,
                                           [CreatedDate] DATETIME2(7) NOT NULL DEFAULT SYSDATETIME(),
                                           [ModifiedDate] DATETIME2(7) NULL,
                                           [CreatedBy] NVARCHAR(100) NULL,
                                           [ModifiedBy] NVARCHAR(100) NULL
);
CREATE NONCLUSTERED INDEX IX_JobConfigurations_JobName_JobGroup ON [dbo].[JobConfigurations] ([JobName], [JobGroup]);
CREATE NONCLUSTERED INDEX IX_JobConfigurations_IsActive ON [dbo].[JobConfigurations] ([IsActive]);
