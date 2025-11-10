# Job Schedule Setup Checklist

## ✅ Pre-deployment Checklist

### Database Setup
- [ ] Chạy `CreateJobConfigurationsTable.sql` để tạo bảng
- [ ] Chạy `InsertJobSchedulePermissions.sql` để thêm permissions
- [ ] Verify bảng `JobConfigurations` đã được tạo
- [ ] Gán permissions cho roles cần thiết (Admin, Manager, etc.)

### Code Review
- [ ] Verify `JobConfiguration` entity đã được tạo
- [ ] Verify `IJobConfigurationRepository` và implementation
- [ ] Verify `IJobScheduleService` và `JobScheduleService`
- [ ] Verify `JobLoaderHostedService` đã được đăng ký trong `Program.cs`
- [ ] Verify `JobScheduleController` có đầy đủ endpoints

### Job Classes
- [ ] `BaseJob` - Base class cho tất cả jobs ✓
- [ ] `SampleJob` - Sample job ✓
- [ ] `CleanupJob` - Cleanup job ✓
- [ ] `EmailNotificationJob` - Email job template ✓
- [ ] `DatabaseMaintenanceJob` - DB maintenance template ✓
- [ ] `ReportGenerationJob` - Report generation template ✓

### Configuration
- [ ] Quartz.NET đã được cấu hình trong `Program.cs`
- [ ] `JobLoaderHostedService` đã được đăng ký
- [ ] Connection string đúng trong `appsettings.json`
- [ ] Serilog logging đã được cấu hình

## 🚀 Deployment Steps

### Step 1: Database Migration
```bash
# Connect to database
sqlcmd -S your-server -d your-database -U username -P password

# Run scripts
:r Model/SQL/CreateJobConfigurationsTable.sql
GO
:r Model/SQL/InsertJobSchedulePermissions.sql
GO
```

Verify:
```sql
-- Check table exists
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'JobConfigurations';

-- Check permissions
SELECT * FROM SysPermission WHERE Code LIKE 'JobSchedule.%';
```

### Step 2: Build & Test
```bash
# Build project
cd server/Controllers
dotnet build

# Run tests (if any)
dotnet test

# Run application
dotnet run
```

Expected logs:
```
[INFO] JobLoaderHostedService starting - Loading jobs from database...
[INFO] Found X active jobs in database
[INFO] Successfully loaded job {JobName} from database
[INFO] JobLoaderHostedService completed loading jobs
```

### Step 3: API Testing
```bash
# Test 1: Get available jobs
curl http://localhost:5000/api/jobschedule/available \
  -H "Authorization: Bearer {token}"

# Expected: List of job types

# Test 2: Create a test job
curl -X POST http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "TestJob",
    "jobGroup": "TEST",
    "jobType": "Services.Jobs.SampleJob",
    "cronExpression": "0 */5 * * * ?",
    "description": "Test job"
  }'

# Expected: { "success": true, "message": "Job created successfully" }

# Test 3: List jobs
curl http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer {token}"

# Expected: Array with TestJob

# Test 4: Trigger job
curl -X POST http://localhost:5000/api/jobschedule/TestJob/TEST/trigger \
  -H "Authorization: Bearer {token}"

# Expected: { "success": true, "message": "Job triggered successfully" }

# Check logs for job execution

# Test 5: Delete test job
curl -X DELETE http://localhost:5000/api/jobschedule/TestJob/TEST \
  -H "Authorization: Bearer {token}"

# Expected: { "success": true, "message": "Job deleted successfully" }
```

### Step 4: Create Production Jobs
```bash
# Example: Daily cleanup job
curl -X POST http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "DailyCleanup",
    "jobGroup": "MAINTENANCE",
    "jobType": "Services.Jobs.CleanupJob",
    "cronExpression": "0 0 2 * * ?",
    "description": "Daily cleanup at 2 AM"
  }'

# Example: Database maintenance
curl -X POST http://localhost:5000/api/jobschedule \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobName": "DbMaintenance",
    "jobGroup": "MAINTENANCE",
    "jobType": "Services.Jobs.DatabaseMaintenanceJob",
    "cronExpression": "0 0 3 * * SUN",
    "description": "Weekly DB maintenance on Sunday at 3 AM",
    "jobData": {
      "cleanupDays": "30",
      "backupEnabled": "true"
    }
  }'
```

## 📊 Post-deployment Verification

### Database Check
```sql
-- Check jobs in database
SELECT * FROM JobConfigurations WHERE IsActive = 1;

-- Check permissions assigned
SELECT r.Name, p.Code 
FROM SysRole r
JOIN SysRolePermission rp ON r.Id = rp.RoleId
JOIN SysPermission p ON rp.PermissionCode = p.Code
WHERE p.Code LIKE 'JobSchedule.%';
```

### Application Health Check
- [ ] Application starts without errors
- [ ] JobLoaderHostedService logs show jobs loaded
- [ ] API endpoints respond correctly
- [ ] Jobs execute on schedule
- [ ] Logs show job execution details

### Monitoring Setup
- [ ] Setup monitoring for job failures
- [ ] Setup alerts for jobs not running
- [ ] Configure log retention
- [ ] Setup dashboard for job status

## 🔧 Troubleshooting

### Issue: JobLoaderHostedService không load jobs
**Solution:**
1. Check connection string
2. Verify `JobConfigurations` table exists
3. Check `IsActive = 1` in database
4. Review logs for errors

### Issue: Jobs không chạy theo lịch
**Solution:**
1. Validate cron expression
2. Check job không bị pause
3. Verify Quartz scheduler is running
4. Check logs for scheduling errors

### Issue: API trả về 403 Forbidden
**Solution:**
1. Verify user có permissions `JobSchedule.*`
2. Check JWT token valid
3. Verify role-permission mapping

### Issue: Job throws exception khi chạy
**Solution:**
1. Check logs for full exception
2. Verify dependencies được inject đúng
3. Test job logic độc lập
4. Check database connection available

## 📈 Performance Tuning

### Database Optimization
```sql
-- Add indexes if needed
CREATE NONCLUSTERED INDEX IX_JobConfigurations_IsActive_CreatedDate
ON JobConfigurations (IsActive, CreatedDate DESC);

-- Regular maintenance
UPDATE STATISTICS JobConfigurations;
```

### Quartz Configuration
```csharp
// Adjust thread pool if needed
q.UseDefaultThreadPool(tp =>
{
    tp.MaxConcurrency = 20; // Increase if many concurrent jobs
});
```

### Memory Optimization
- Limit job data size (< 10KB recommended)
- Don't store large objects in JobDataMap
- Use external storage for large data

## 📚 Documentation Links

- Quick Start: `QUICK_START_JOBS.md`
- Full Guide: `Services/Jobs/DYNAMIC_MANAGEMENT.md`
- API Reference: `Services/Jobs/README.md`
- Summary: `JOBS_SUMMARY.md`

## ✨ Success Criteria

- [x] All files created successfully
- [x] No compilation errors
- [ ] Database tables created
- [ ] Permissions configured
- [ ] Application builds and runs
- [ ] Jobs load from database on startup
- [ ] API endpoints work correctly
- [ ] Jobs execute on schedule
- [ ] Logs show proper information
- [ ] UI can manage jobs (if implemented)

## 🎉 Completion

Once all items are checked:
1. Mark this feature as COMPLETE
2. Update project documentation
3. Train team on job management
4. Monitor production jobs
5. Create runbook for common operations

---
**Last Updated:** 2025-11-07
**Version:** 1.0
**Status:** Ready for deployment

