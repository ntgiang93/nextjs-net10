# Hướng dẫn Deploy Next.js lên IIS Server

Tài liệu này hướng dẫn cách deploy ứng dụng Next.js lên IIS Server sử dụng iisnode.

## Yêu cầu hệ thống

- Windows Server 2016 hoặc cao hơn
- IIS 10.0 hoặc cao hơn
- Node.js (LTS version)
- iisnode module
- URL Rewrite Module (tùy chọn)

## Bước 1: Cài đặt các thành phần cần thiết

### 1.1 Cài đặt Node.js

```powershell
# Tải Node.js LTS từ https://nodejs.org/
# Hoặc sử dụng Chocolatey
choco install nodejs
```

### 1.2 Cài đặt iisnode

```powershell
# Tải từ https://github.com/azure/iisnode/releases
# Chọn phiên bản phù hợp (x64 hoặc x86)
# Sau khi cài đặt, iisnode sẽ được đăng ký tự động với IIS
```

### 1.3 Cài đặt URL Rewrite Module (tùy chọn)

```powershell
# Tải từ https://www.iis.net/downloads/microsoft/url-rewrite
# Module này giúp xử lý các URL rewrite rule nâng cao
```

## Bước 2: Chuẩn bị ứng dụng Next.js

### 2.1 Build ứng dụng

```bash
# Di chuyển đến thư mục client
cd client

# Cài đặt dependencies
npm install

# Build ứng dụng cho production
npm run build
```

### 2.2 Kiểm tra file server.js

File `server.js` trong dự án của bạn sẽ được sử dụng để chạy ứng dụng trên IIS. Đây là custom server cho Next.js:

```javascript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === '/a') {
      app.render(req, res, '/a', query);
    } else if (pathname === '/b') {
      app.render(req, res, '/b', query);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

### 2.3 Cập nhật package.json

Đảm bảo `package.json` có script start:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js"
  }
}
```

## Bước 3: Chuẩn bị thư mục trên IIS Server

### 3.1 Tạo thư mục ứng dụng

```powershell
# Tạo thư mục để lưu ứng dụng
New-Item -ItemType Directory -Path "C:\iis-apps\nextjs-net10" -Force

# Tạo thư mục logs
New-Item -ItemType Directory -Path "C:\iis-apps\nextjs-net10\logs" -Force
```

### 3.2 Copy files từ local lên server

```powershell
# Copy toàn bộ thư mục ứng dụng
# Lựa chọn 1: Sử dụng PowerShell
Copy-Item -Path "C:\path\to\local\client\*" -Destination "C:\iis-apps\nextjs-net10\" -Recurse -Force

# Lựa chọn 2: Sử dụng robocopy (nhanh hơn với thư mục lớn)
robocopy "C:\path\to\local\client" "C:\iis-apps\nextjs-net10" /E /NFL /NDL

# Lựa chọn 3: Sử dụng xcopy
xcopy "C:\path\to\local\client\*" "C:\iis-apps\nextjs-net10\" /E /Y /I
```

### 3.3 Cấp quyền cho thư mục

```powershell
# Cấp quyền Full Control cho IIS_IUSRS group
$acl = Get-Acl "C:\iis-apps\nextjs-net10"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl -Path "C:\iis-apps\nextjs-net10" -AclObject $acl

# Hoặc cấp quyền cho Application Pool identity
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS AppPool\NextJsAppPool", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl -Path "C:\iis-apps\nextjs-net10" -AclObject $acl
```

## Bước 4: Cấu hình IIS

### 4.1 Tạo Application Pool

**Thông qua IIS Manager GUI:**

1. Mở IIS Manager
2. Chuột phải trên "Application Pools"
3. Chọn "Add Application Pool"
4. Điền thông tin:
   - Name: `NextJsAppPool`
   - .NET CLR version: `No Managed Code`
   - Managed pipeline mode: `Integrated`
5. Click OK

**Hoặc sử dụng PowerShell:**

```powershell
# Import IIS module
Import-Module WebAdministration

# Tạo Application Pool
$appPoolName = "NextJsAppPool"
New-WebAppPool -Name $appPoolName

# Cấu hình Application Pool
$appPool = Get-Item "IIS:\AppPools\$appPoolName"
$appPool.autoStart = $true
$appPool.managedRuntimeVersion = ""  # No Managed Code
$appPool.managedPipelineMode = "Integrated"
$appPool | Set-Item

# Cấu hình Process Model
$appPool.processModel.idleTimeout = [TimeSpan]::FromMinutes(20)
$appPool | Set-Item
```

### 4.2 Tạo Website

**Thông qua IIS Manager GUI:**

1. Chuột phải trên "Sites"
2. Chọn "Add Website"
3. Điền thông tin:
   - Site name: `NextJsApp`
   - Application pool: `NextJsAppPool`
   - Physical path: `C:\iis-apps\nextjs-net10`
   - Binding:
     - Type: `http`
     - IP address: `All Unassigned`
     - Port: `80`
     - Host name: `yourdomain.com` (hoặc để trống)
4. Click OK

**Hoặc sử dụng PowerShell:**

```powershell
# Tạo website
New-WebSite -Name "NextJsApp" `
  -Port 80 `
  -PhysicalPath "C:\iis-apps\nextjs-net10" `
  -ApplicationPool "NextJsAppPool" `
  -HostHeader "yourdomain.com"

# Khởi động website
Start-WebSite -Name "NextJsApp"
```

## Bước 5: Cấu hình web.config

File `web.config` trong dự án của bạn đã được cấu hình để làm việc với iisnode. Dưới đây là phân tích chi tiết:

```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Rule này chuyển hướng tất cả request tới server.js -->
        <rule name="nextjs-app">
          <match url="/*" />
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>

    <!-- Cấu hình iisnode -->
    <iisnode
      node_env="production"
      nodeProcessCommandLine="&quot;C:\Program Files\nodejs\node.exe&quot;"
      interceptor="&quot;%programfiles%\iisnode\interceptor.js&quot;" />

  </system.webServer>
</configuration>
```

### Giải thích từng phần:

| Tùy chọn                   | Mô tả                              |
| -------------------------- | ---------------------------------- |
| `node_env="production"`    | Đặt NODE_ENV = production          |
| `nodeProcessCommandLine`   | Đường dẫn tới node.exe             |
| `interceptor`              | Đường dẫn tới iisnode interceptor  |
| `<rule name="nextjs-app">` | Xử lý tất cả request qua server.js |

### Cấu hình web.config nâng cao (tùy chọn)

Nếu cần thêm logging, compression, hoặc các cấu hình khác:

```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="nextjs-app">
          <match url="/*" />
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>

    <iisnode
      node_env="production"
      nodeProcessCommandLine="&quot;C:\Program Files\nodejs\node.exe&quot;"
      interceptor="&quot;%programfiles%\iisnode\interceptor.js&quot;"
      logDirectory="logs"
      maxLogFileSizeInKB="128"
      maxLogFiles="5"
      loggingEnabled="true" />

    <!-- Enable compression -->
    <urlCompression
      doStaticCompression="true"
      doDynamicCompression="true" />

    <!-- Security - ẩn Node modules -->
    <security>
      <requestFiltering>
        <hiddenSegments>
          <add segment="node_modules" />
        </hiddenSegments>
      </requestFiltering>
    </security>

    <!-- Custom headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Powered-By" value="Next.js" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

## Bước 6: Cấu hình môi trường

### 6.1 Tạo file .env.production

```bash
# Trong thư mục C:\iis-apps\nextjs-net10
# Tạo file .env.production

NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
PORT=3000
```

### 6.2 Cấu hình biến môi trường cho Application Pool

```powershell
# Nếu cần cấu hình biến môi trường cho process Node.js
# Tạo file .env trong thư mục ứng dụng hoặc
# Cấu hình trong Application Pool advanced settings

$appPool = Get-Item "IIS:\AppPools\NextJsAppPool"
$appPool.environmentVariables.Add("NODE_ENV", "production")
$appPool | Set-Item
```

## Bước 7: Kiểm tra và khởi động

### 7.1 Kiểm tra cấu hình

```powershell
# Kiểm tra Application Pool
Get-IISAppPool -Name "NextJsAppPool" | Select-Object Name, State

# Kiểm tra Website
Get-IISSite -Name "NextJsApp" | Select-Object Name, State, Bindings

# Kiểm tra file web.config
Test-Path "C:\iis-apps\nextjs-net10\web.config"
```

### 7.2 Khởi động ứng dụng

```powershell
# Khởi động Application Pool
Start-WebAppPool -Name "NextJsAppPool"

# Khởi động Website
Start-WebSite -Name "NextJsApp"

# Dừng (nếu cần)
Stop-WebSite -Name "NextJsApp"
Stop-WebAppPool -Name "NextJsAppPool"
```

### 7.3 Truy cập ứng dụng

Mở trình duyệt và truy cập:

- `http://localhost` (nếu chạy cục bộ)
- `http://yourdomain.com` (nếu đã cấu hình domain)

## Bước 8: HTTPS/SSL (Tùy chọn)

### 8.1 Lấy SSL Certificate

```powershell
# Sử dụng Let's Encrypt (miễn phí)
# Hoặc mua từ CA như DigiCert, GlobalSign

# Sau khi có certificate, import vào IIS:
# IIS Manager > Server Certificates > Import
```

### 8.2 Cấu hình HTTPS binding

```powershell
# Thêm HTTPS binding
$siteName = "NextJsApp"
$certificateThumbprint = "YOUR_CERT_THUMBPRINT"  # Get từ IIS Server Certificates

# Xóa HTTP binding cũ (tùy chọn)
Remove-WebBinding -Name $siteName -BindingInformation "*:80:"

# Thêm HTTPS binding
New-WebBinding -Name $siteName `
  -Protocol https `
  -Port 443 `
  -HostHeader "yourdomain.com" `
  -SslFlags 1

# Gán certificate
Get-WebBinding -Name $siteName -Protocol https | `
  Set-WebBinding -AddSslCertificate $certificateThumbprint -Force
```

### 8.3 Chuyển hướng HTTP sang HTTPS

Thêm vào web.config:

```xml
<rewrite>
  <rules>
    <rule name="HTTPtoHTTPS" stopProcessing="true">
      <match url="(.*)" />
      <conditions>
        <add input="{HTTPS}" pattern="off" />
      </conditions>
      <action type="Redirect" url="https://{HTTP_HOST}{REQUEST_URI}" redirectType="Permanent" />
    </rule>

    <rule name="nextjs-app">
      <match url="/*" />
      <action type="Rewrite" url="server.js" />
    </rule>
  </rules>
</rewrite>
```

## Bước 9: Logs và Debugging

### 9.1 Xem logs iisnode

```powershell
# Logs được lưu trong thư mục logs
Get-Content "C:\iis-apps\nextjs-net10\logs\*.log"

# Xem logs real-time
Get-Content "C:\iis-apps\nextjs-net10\logs\*.log" -Wait -Tail 20
```

### 9.2 Bật Failed Request Tracing

```powershell
# Bật FRT cho site
$site = Get-IISSite -Name "NextJsApp"
$site.traceFailedRequestsLogging.enabled = $true
$site.traceFailedRequestsLogging.tracingPeriodInMinutes = 60
$site | Set-Item

# Tạo rule để trace lỗi
Add-WebConfigurationProperty -PSPath "MACHINE/WEBROOT/APPHOST/NextJsApp" `
  -Location "system.webServer/tracing/traceFailedRequests" `
  -Name "." `
  -Value @{path="*"}
```

### 9.3 Kiểm tra Event Viewer

```powershell
# Xem logs trong Event Viewer
Get-EventLog -LogName "System" -Source "iisnode" -Newest 10
```

## Bước 10: Maintenance và Updates

### 10.1 Cập nhật ứng dụng

```powershell
# 1. Build lại trên máy local
cd client
npm run build

# 2. Copy files mới lên server
robocopy "C:\path\to\local\client\.next" "C:\iis-apps\nextjs-net10\.next" /E /PURGE

# 3. Restart Application Pool
Restart-WebAppPool -Name "NextJsAppPool"
```

### 10.2 Backup

```powershell
# Backup ứng dụng
$backupDate = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupPath = "D:\Backups\nextjs-net10-$backupDate"

robocopy "C:\iis-apps\nextjs-net10" $backupPath /E /R:3 /W:5

# Nén backup
7z a "$backupPath.7z" $backupPath
Remove-Item $backupPath -Recurse -Force
```

### 10.3 Monitoring

```powershell
# Script kiểm tra sức khỏe ứng dụng
$healthCheckUrl = "http://localhost"

try {
    $response = Invoke-WebRequest -Uri $healthCheckUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Application is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Application health check failed: $_" -ForegroundColor Red

    # Restart Application Pool nếu lỗi
    Restart-WebAppPool -Name "NextJsAppPool"
    Write-Host "Application Pool restarted" -ForegroundColor Yellow
}
```

## Khắc phục sự cố thường gặp

### Lỗi: "Cannot find module 'next'"

**Giải pháp:**

```powershell
# Vào thư mục ứng dụng
cd C:\iis-apps\nextjs-net10

# Cài đặt lại dependencies
npm install

# Restart Application Pool
Restart-WebAppPool -Name "NextJsAppPool"
```

### Lỗi: 503 Service Unavailable

**Giải pháp:**

```powershell
# Kiểm tra Application Pool state
Get-IISAppPool -Name "NextJsAppPool" | Select-Object Name, State

# Kiểm tra ports đang được sử dụng
netstat -ano | findstr :3000

# Restart Application Pool
Restart-WebAppPool -Name "NextJsAppPool"

# Xem logs
Get-Content "C:\iis-apps\nextjs-net10\logs\*.log" -Tail 50
```

### Lỗi: "Permission denied"

**Giải pháp:**

```powershell
# Cấp quyền Full Control cho thư mục
$acl = Get-Acl "C:\iis-apps\nextjs-net10"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS AppPool\NextJsAppPool", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl -Path "C:\iis-apps\nextjs-net10" -AclObject $acl

# Hoặc cấp quyền cho toàn bộ thư mục con
icacls "C:\iis-apps\nextjs-net10" /grant "IIS AppPool\NextJsAppPool":(OI)(CI)F /T
```

### Lỗi: Static files không load

**Giải pháp:**

```powershell
# Kiểm tra thư mục public
Test-Path "C:\iis-apps\nextjs-net10\public"

# Kiểm tra file .next
Test-Path "C:\iis-apps\nextjs-net10\.next"

# Nếu web.config không xử lý static files, thêm vào:
# <staticContent>
#   <mimeMap fileExtension=".webp" mimeType="image/webp" />
# </staticContent>
```

## Liên hệ và hỗ trợ

- Tài liệu iisnode: https://github.com/azure/iisnode
- Tài liệu Next.js: https://nextjs.org/docs
- IIS Documentation: https://docs.microsoft.com/en-us/iis/
