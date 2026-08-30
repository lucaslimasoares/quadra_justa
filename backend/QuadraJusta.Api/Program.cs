using QuadraJusta.Application.Interfaces;
using QuadraJusta.Application.Models;
using QuadraJusta.Application.Services;
using Microsoft.EntityFrameworkCore;
using QuadraJusta.Domain.Interfaces;
using QuadraJusta.Infrastructure.Persistence;
using QuadraJusta.Infrastructure.Repositories;
using Npgsql;
using DotNetEnv;

var envFile = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envFile)) Env.Load(envFile);
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
var databaseProvider = (Environment.GetEnvironmentVariable("DatabaseProvider") ?? builder.Configuration["DatabaseProvider"] ?? "sqlite").Trim().ToLowerInvariant();
var configuredConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__QuadraJusta") ?? builder.Configuration.GetConnectionString("QuadraJusta")
    ?? throw new InvalidOperationException("A connection string QuadraJusta não foi configurada.");
var connectionString = databaseProvider is "postgres" or "postgresql"
    ? BuildPostgresConnectionString(builder.Configuration, configuredConnectionString)
    : configuredConnectionString;
builder.Services.AddDbContext<QuadraJustaDbContext>(options =>
{
    if (databaseProvider is "postgres" or "postgresql") options.UseNpgsql(connectionString);
    else options.UseSqlite(connectionString);
});
builder.Services.AddScoped<IMatchRepository, EfMatchRepository>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlayerRepository, EfPlayerRepository>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
var app = builder.Build();
if (databaseProvider is not ("postgres" or "postgresql"))
{
    using var scope = app.Services.CreateScope();
    await DbInitializer.InitializeAsync(scope.ServiceProvider.GetRequiredService<QuadraJustaDbContext>());
}
app.UseCors();
var matches = app.MapGroup("/api/matches").WithTags("Matches");
matches.MapGet("/upcoming", async (IMatchService service, CancellationToken ct) => (await service.GetUpcomingAsync(ct)) is { } match ? Results.Ok(match) : Results.NotFound());
matches.MapGet("/", async (string? email, IMatchService service, CancellationToken ct) => Results.Ok(await service.GetVisibleAsync(email ?? string.Empty, ct)));
matches.MapPost("/", async (CreateMatchRequest request, IMatchService service, CancellationToken ct) => { try { return Results.Created("/api/matches", await service.CreateAsync(request, ct)); } catch (ArgumentException exception) { return Results.BadRequest(exception.Message); } });
matches.MapPost("/{id:guid}/teams", async (Guid id, string? email, GenerateTeamsRequest request, IMatchService service, CancellationToken ct) => { try { return (await service.GenerateTeamsAsync(id, email ?? string.Empty, request, ct)) is { } teams ? Results.Ok(teams) : Results.NotFound(); } catch (UnauthorizedAccessException) { return Results.StatusCode(StatusCodes.Status403Forbidden); } catch (ArgumentOutOfRangeException) { return Results.BadRequest("A partida deve ter 2 ou 3 times."); } });
var players = app.MapGroup("/api/players").WithTags("Players");
players.MapGet("/", async (IPlayerService service, CancellationToken ct) => Results.Ok(await service.GetAllAsync(ct)));
players.MapPost("/", async (CreatePlayerRequest request, IPlayerService service, CancellationToken ct) =>
{
    try { return Results.Created("/api/players", await service.CreateAsync(request, ct)); }
    catch (ArgumentException exception) { return Results.BadRequest(exception.Message); }
});
players.MapPut("/{id:guid}", async (Guid id, CreatePlayerRequest request, IPlayerService service, CancellationToken ct) =>
{
    try { return (await service.UpdateAsync(id, request, ct)) is { } player ? Results.Ok(player) : Results.NotFound(); }
    catch (ArgumentException exception) { return Results.BadRequest(exception.Message); }
});
app.Run();

static string BuildPostgresConnectionString(IConfiguration configuration, string configuredConnectionString)
{
    var connectionString = configuredConnectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
        ? ConvertPostgresUri(configuredConnectionString)
        : configuredConnectionString;
    var builder = new NpgsqlConnectionStringBuilder(connectionString);
    var password = Environment.GetEnvironmentVariable("SUPABASE_DB_PASSWORD") ?? configuration["SUPABASE_DB_PASSWORD"] ?? configuration["Supabase:Password"];
    if (!string.IsNullOrWhiteSpace(password)) builder.Password = password;
    if (string.IsNullOrWhiteSpace(builder.Host) || string.IsNullOrWhiteSpace(builder.Database) || string.IsNullOrWhiteSpace(builder.Username) || string.IsNullOrWhiteSpace(builder.Password))
        throw new InvalidOperationException("Configure SUPABASE_DB_PASSWORD e uma connection string PostgreSQL válida.");
    return builder.ConnectionString;
}

static string ConvertPostgresUri(string value)
{
    var uri = new Uri(value);
    var credentials = uri.UserInfo.Split(':', 2);
    return new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = uri.AbsolutePath.Trim('/'),
        Username = Uri.UnescapeDataString(credentials[0]),
        Password = credentials.Length > 1 ? Uri.UnescapeDataString(credentials[1]) : string.Empty,
        SslMode = SslMode.Require
    }.ConnectionString;
}
