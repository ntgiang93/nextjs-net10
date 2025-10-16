using Model.Constants;

namespace Model.Models;

public class AppSettings
{
    public string FileDomain { get; set; }
    public string AppDomain { get; set; }
    public string ClientDomain { get; set; }
    public List<string> Cors { get; set; }
    public JwtSettings Jwt { get; set; }
    public EmailConfigurationSettings EmailConfiguration { get; set; }
    public VerificationType VerificationType { get; set; }
    public Snowflake Snowflake { get; set; }
    public ConnectionStrings ConnectionStrings { get; set; }
}

public class JwtSettings
{
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public string SingingKey { get; set; }
    public int TokenExpiresIn { get; set; }
    public int RefreshTokenExpiresIn { get; set; }
}

public class EmailConfigurationSettings
{
    public string Provider { get; set; }
    public SmtpSettings SMTP { get; set; }
}

public class SmtpSettings
{
    public string Host { get; set; }
    public int Port { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
    public bool EnableSsl { get; set; }
    public string FromEmail { get; set; }
    public string FromName { get; set; }
}

public class Snowflake
{
    public string Epoch { get; set; } = "2023-01-01T00:00:00Z";
    public int GeneratorId { get; set; }
    public int TimeBits { get; set; } = 45;
    public int GeneratorIdBits { get; set; } = 2;
    public int SequenceBits { get; set; } = 16;
}

public class ConnectionStrings 
{
    public string MainDb { get; set; }
}