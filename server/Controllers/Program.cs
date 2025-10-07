using Api.Filters;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Common.Security;
using Common.Security.Policies;
using Controllers.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Model.Models;
using Repository.Interfaces.Base;
using Repository.Repositories.Base;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Use Autofac as the service provider factory
builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

// Register Autofac modules
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    containerBuilder.RegisterModule<AutofacModule>();
});

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>();
builder.Services.AddSingleton(appSettings ?? new AppSettings());

// Add Memory Cache Service
builder.Services.AddMemoryCache();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        corsBuilder =>
        {
            var allowedOrigins = appSettings != null ? appSettings.Cors.ToArray() : [];
            corsBuilder.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// Add authentication service with JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = appSettings?.Jwt.Issuer,
            ValidAudience = appSettings?.Jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings != null
                ? appSettings.Jwt.SingingKey
                : "$3!kP#r2^Lq@v9&yFgXwNzTb8Uj*JhV5mDchfyresds845HGYR9843hhdsu!@hre83uDFG0HD"))
        };
    });

builder.Services.AddAuthorization();

// Add permission policy service
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddSingleton<CacheManager>();

// Add controllers with filters
builder.Services.AddControllers(options => { options.Filters.Add<GlobalExceptionFilter>(); });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Read serilog configuration from appsetting.json
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) 
    app.MapOpenApi();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("CorsPolicy");
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});

app.UseAuthentication(); // Add authentication middleware
app.UseJwtUserInfo(); // Add our custom JWT user info middleware
app.UseAuthorization();

app.MapControllers();

app.Run();