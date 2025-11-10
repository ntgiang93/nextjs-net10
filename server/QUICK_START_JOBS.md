# Quick Start Guide - Job Schedule Management

## 🚀 Bắt đầu nhanh trong 5 phút

### Bước 1: Setup Database (2 phút)

```sql
-- 1. Tạo bảng JobConfigurations
sqlcmd -S localhost -d YourDatabase -i Model/SQL/CreateJobConfigurationsTable.sql

-- 2. Thêm permissions
sqlcmd -S localhost -d YourDatabase -i Model/SQL/InsertJobSchedulePermissions.sql

-- 3. (Optional) Insert sample job
INSERT INTO JobConfigurations 
  (Id, JobName, JobGroup, JobType, CronExpression, Description, IsActive)
VALUES 
  (NEWID(), 'SampleJob', 'DEFAULT', 'Services.Jobs.SampleJob', 
   '0 */5 * * * ?', 'Sample job - runs every 5 minutes', 1);
```

### Bước 2: Build & Run (1 phút)

```bash
cd server/Controllers
dotnet build
dotnet run
```

Xem logs để confirm jobs đã được load:
```
[2025-11-07 10:00:00] INFO: JobLoaderHostedService starting - Loading jobs from database...
[2025-11-07 10:00:01] INFO: Found 1 active jobs in database
[2025-11-07 10:00:01] INFO: Successfully loaded job SampleJob from database
```

### Bước 3: Test API (2 phút)

#### 1. Get available job types
```bash
curl http://localhost:5000/api/jobschedule/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
[
  {
    "jobType": "Services.Jobs.SampleJob",
    "jobName": "SampleJob",
    "description": "Job class: SampleJob"
  },
  {
    "jobType": "Services.Jobs.CleanupJob",
    "jobName": "CleanupJob",
    "description": "Job class: CleanupJob"
  },
  {
    "jobType": "Services.Jobs.EmailNotificationJob",
    "jobName": "EmailNotificationJob",
    "description": "Job class: EmailNotificationJob"
  }
]
```

#### 2. Create a new job
```bash
curl -X POST http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "DailyCleanup",
    "jobGroup": "MAINTENANCE",
    "jobType": "Services.Jobs.CleanupJob",
    "cronExpression": "0 0 2 * * ?",
    "description": "Daily cleanup at 2 AM"
  }'
```

#### 3. List all jobs
```bash
curl http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Trigger job immediately
```bash
curl -X POST http://localhost:5000/api/jobschedule/DailyCleanup/MAINTENANCE/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Check logs to see job execution:
```
[2025-11-07 10:05:00] INFO: Job DailyCleanup started at 11/7/2025 10:05:00 AM
[2025-11-07 10:05:00] INFO: Cleanup job is running...
[2025-11-07 10:05:01] INFO: Cleanup job completed!
[2025-11-07 10:05:01] INFO: Job DailyCleanup completed successfully at 11/7/2025 10:05:01 AM
```

## 📋 Common Tasks

### Create a custom job

1. Create job class:
```csharp
// Services/Jobs/MyCustomJob.cs
using Quartz;

namespace Services.Jobs;

public class MyCustomJob : BaseJob
{
    protected override async Task ExecuteJob(IJobExecutionContext context)
    {
        Logger.Information("MyCustomJob is running");
        
        // Your logic here
        await Task.CompletedTask;
    }
}
```

2. Rebuild project:
```bash
dotnet build
```

3. Create via API:
```bash
curl -X POST http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "MyJob",
    "jobGroup": "CUSTOM",
    "jobType": "Services.Jobs.MyCustomJob",
    "cronExpression": "0 0 * * * ?",
    "description": "My custom job"
  }'
```

### Update job schedule

```bash
curl -X PUT http://localhost:5000/api/jobschedule/MyJob/CUSTOM \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cronExpression": "0 0 */2 * * ?",
    "description": "Updated: every 2 hours"
  }'
```

### Pause a job

```bash
curl -X POST http://localhost:5000/api/jobschedule/MyJob/CUSTOM/pause \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Resume a job

```bash
curl -X POST http://localhost:5000/api/jobschedule/MyJob/CUSTOM/resume \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete a job

```bash
curl -X DELETE http://localhost:5000/api/jobschedule/MyJob/CUSTOM \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎨 Frontend Integration Example

### React/Next.js Component

```typescript
// components/JobScheduleManager.tsx
import { useState, useEffect } from 'react';

interface Job {
  jobName: string;
  jobGroup: string;
  cronExpression: string;
  description: string;
  nextFireTime: string;
  triggerState: string;
}

export default function JobScheduleManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const fetchJobs = async () => {
    const response = await fetch('/api/jobschedule', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await response.json();
    setJobs(data);
  };
  
  const pauseJob = async (name: string, group: string) => {
    await fetch(`/api/jobschedule/${name}/${group}/pause`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    fetchJobs();
  };
  
  const triggerJob = async (name: string, group: string) => {
    await fetch(`/api/jobschedule/${name}/${group}/trigger`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
  };
  
  return (
    <div>
      <h1>Job Schedules</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Group</th>
            <th>Schedule</th>
            <th>Next Run</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={`${job.jobName}-${job.jobGroup}`}>
              <td>{job.jobName}</td>
              <td>{job.jobGroup}</td>
              <td>{job.cronExpression}</td>
              <td>{new Date(job.nextFireTime).toLocaleString()}</td>
              <td>{job.triggerState}</td>
              <td>
                <button onClick={() => pauseJob(job.jobName, job.jobGroup)}>
                  Pause
                </button>
                <button onClick={() => triggerJob(job.jobName, job.jobGroup)}>
                  Run Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 📊 Cron Expression Cheat Sheet

| Expression | Meaning |
|-----------|---------|
| `0 0 * * * ?` | Every hour |
| `0 */15 * * * ?` | Every 15 minutes |
| `0 0 8 * * ?` | Every day at 8 AM |
| `0 0 0 * * ?` | Every day at midnight |
| `0 0 0 * * MON` | Every Monday at midnight |
| `0 0 0 1 * ?` | First day of every month |
| `0 0 9-17 * * MON-FRI` | Every hour 9 AM - 5 PM, Monday - Friday |

Format: `second minute hour day month dayOfWeek`

## 🔍 Troubleshooting

### Job không chạy?
1. Kiểm tra `IsActive = 1` trong database
2. Check cron expression hợp lệ: `/api/jobschedule/validate-cron`
3. Xem logs cho errors
4. Verify job không bị paused

### Job không xuất hiện trong available list?
1. Đảm bảo job class implement `IJob`
2. Namespace phải chứa "Jobs"
3. Rebuild project: `dotnet build`
4. Restart application

### Job bị lỗi khi chạy?
1. Check logs để xem exception
2. Verify dependencies được inject đúng
3. Test job logic độc lập
4. Check database connection

## 📚 Next Steps

- Read full documentation: `Services/Jobs/DYNAMIC_MANAGEMENT.md`
- Create custom jobs for your business logic
- Setup monitoring and alerting
- Configure job data for dynamic parameters
- Implement job execution history tracking

## 💡 Pro Tips

1. **Use job groups** để tổ chức jobs theo chức năng
2. **Test cron expressions** trước khi save
3. **Monitor job execution** qua logs
4. **Use job data** để configure jobs dynamically
5. **Pause jobs** khi maintenance thay vì delete
6. **Keep jobs idempotent** - có thể chạy lại nhiều lần
7. **Handle errors gracefully** - don't crash jobs
8. **Log important events** để debug dễ dàng

Happy scheduling! 🎉

