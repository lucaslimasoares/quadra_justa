using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;
using QuadraJusta.Infrastructure.Persistence;
using QuadraJusta.Infrastructure.Persistence.Entities;

namespace QuadraJusta.Infrastructure.Repositories;

public sealed class EfMatchRepository(QuadraJustaDbContext db) : IMatchRepository
{
    public async Task<IReadOnlyList<Match>> GetVisibleAsync(string email, CancellationToken cancellationToken)
    {
        var records = await db.Matches.AsNoTracking().Include(match => match.Players).ThenInclude(item => item.Player).ToListAsync(cancellationToken);
        return records.Where(record => record.Privacy == "public" || string.Equals(record.CreatorEmail, email, StringComparison.OrdinalIgnoreCase) || JsonSerializer.Deserialize<List<string>>(record.InvitedEmails)!.Contains(email, StringComparer.OrdinalIgnoreCase)).Select(ToDomain).ToList();
    }

    public async Task<Match> AddAsync(Match match, CancellationToken cancellationToken)
    {
        db.Matches.Add(new MatchRecord { Id = match.Id, Title = match.Title, Date = match.Date, Venue = match.Venue, MaxPlayers = match.MaxPlayers, Privacy = match.Privacy, CreatorEmail = match.CreatorEmail, InvitedEmails = JsonSerializer.Serialize(match.InvitedEmails), ModeratorEmails = JsonSerializer.Serialize(match.ModeratorEmails), MatchRules = JsonSerializer.Serialize(match.MatchRules), DrawRules = JsonSerializer.Serialize(match.DrawRules) });
        await db.SaveChangesAsync(cancellationToken);
        return match;
    }

    public async Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var record = await db.Matches.AsNoTracking().Include(match => match.Players).ThenInclude(item => item.Player).SingleOrDefaultAsync(match => match.Id == id, cancellationToken);
        return record is null ? null : ToDomain(record);
    }

    public async Task<Match?> GetUpcomingAsync(CancellationToken cancellationToken)
    {
        var records = await db.Matches.AsNoTracking()
            .Include(match => match.Players).ThenInclude(item => item.Player)
            .ToListAsync(cancellationToken);
        var record = records.Where(match => match.Date >= DateTimeOffset.UtcNow).OrderBy(match => match.Date).FirstOrDefault();

        if (record is null) return null;
        return ToDomain(record);
    }

    private static Match ToDomain(MatchRecord record)
    {
        var players = record.Players.Select(item => new Player(item.Player.Id, item.Player.Name, item.Player.Initials, item.Player.Position, item.Player.Level, item.Player.Trait, item.IsConfirmed)).ToList();
        return new Match(record.Id, record.Title, record.Date, record.Venue, record.MaxPlayers, players, record.Privacy, record.CreatorEmail, JsonSerializer.Deserialize<List<string>>(record.InvitedEmails) ?? [], JsonSerializer.Deserialize<List<string>>(record.ModeratorEmails) ?? [], JsonSerializer.Deserialize<List<string>>(record.MatchRules) ?? [], JsonSerializer.Deserialize<List<string>>(record.DrawRules) ?? []);
    }
}
