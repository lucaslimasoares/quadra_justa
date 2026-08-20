using QuadraJusta.Application.Interfaces;
using QuadraJusta.Application.Models;
using QuadraJusta.Application.Services;
using Microsoft.EntityFrameworkCore;
using QuadraJusta.Domain.Interfaces;
using QuadraJusta.Infrastructure.Persistence;
using QuadraJusta.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddDbContext<QuadraJustaDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("QuadraJusta")));
builder.Services.AddScoped<IMatchRepository, EfMatchRepository>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlayerRepository, EfPlayerRepository>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    await DbInitializer.InitializeAsync(scope.ServiceProvider.GetRequiredService<QuadraJustaDbContext>());
}
app.UseCors();
var matches = app.MapGroup("/api/matches").WithTags("Matches");
matches.MapGet("/upcoming", async (IMatchService service, CancellationToken ct) => (await service.GetUpcomingAsync(ct)) is { } match ? Results.Ok(match) : Results.NotFound());
matches.MapPost("/upcoming/teams", async (GenerateTeamsRequest request, IMatchService service, CancellationToken ct) => { try { return (await service.GenerateTeamsAsync(request, ct)) is { } teams ? Results.Ok(teams) : Results.NotFound(); } catch (ArgumentOutOfRangeException) { return Results.BadRequest("A partida deve ter 2 ou 3 times."); } });
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
