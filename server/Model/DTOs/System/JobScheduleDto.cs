namespace Model.DTOs.System;

public class JobScheduleDto
{
    public int Id { get; set; }
    public string JobType { get; set; } = string.Empty;
    public string JobName { get; set; } = string.Empty;
    public string JobGroup { get; set; } = string.Empty;
    public string? CronExpression { get; set; }
    public string? Description { get; set; }
    public DateTime? NextFireTime { get; set; }
    public DateTime? PreviousFireTime { get; set; }
    public string TriggerState { get; set; } = string.Empty;
}

public class DetailCJobConfigurationDto
{
    public int Id { get; set; }
    public string JobName { get; set; } = string.Empty;
    public string JobGroup { get; set; } = "DEFAULT";
    public string JobType { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? JobDataJson { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateJobScheduleDto
{
    public int Id { get; set; }
    public required string CronExpression { get; set; }
    public string? Description { get; set; }
    public string? JobDataJson { get; set; }
}

public class JobExecutionHistoryDto
{
    public string JobName { get; set; } = string.Empty;
    public string JobGroup { get; set; } = string.Empty;
    public DateTime? FireTime { get; set; }
    public DateTime? ScheduledFireTime { get; set; }
    public DateTime? NextFireTime { get; set; }
    public TimeSpan? RunTime { get; set; }
    public string? ErrorMessage { get; set; }
    public bool Success { get; set; }
}

public class AvailableJobDto
{
    public string JobType { get; set; } = string.Empty;
    public string JobName { get; set; } = string.Empty;
    public string? Description { get; set; }
}

