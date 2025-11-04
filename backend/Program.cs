using Backend.Config;
using Backend.Middleware;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.Configure<AppConfig>(builder.Configuration.GetSection("App"));

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();

var appConfig = app.Services.GetRequiredService<IOptions<AppConfig>>().Value;
if (!string.IsNullOrWhiteSpace(appConfig.BaseUrl))
{
    app.Urls.Add(appConfig.BaseUrl);
}

app.MapGet("/healthz", (IHostEnvironment environment) =>
{
    var payload = new
    {
        status = "ok",
        environment = environment.EnvironmentName,
        timestamp = DateTimeOffset.UtcNow
    };

    return Results.Json(payload);
});

app.Run();
