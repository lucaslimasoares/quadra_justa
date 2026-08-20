using Microsoft.EntityFrameworkCore;
using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;
using QuadraJusta.Infrastructure.Persistence;

namespace QuadraJusta.Infrastructure.Repositories;

public sealed class EfMatchRepository(QuadraJustaDbContext db) : IMatchRepository
{
    public async Task<Match?> GetUpcomingAsync(CancellationToken cancellationToken)
    {
        var records = await db.Matches.AsNoTracking()
            .Include(match => match.Players).ThenInclude(item => item.Player)
            .ToListAsync(cancellationToken);
        var record = records.Where(match => match.Date >= DateTimeOffset.UtcNow).OrderBy(match => match.Date).FirstOrDefault();

        if (record is null) return null;
        var players = record.Players.Select(item => new Player(item.Player.Id, item.Player.Name, item.Player.Initials,
            item.Player.Position, item.Player.Level, item.Player.Trait, item.IsConfirmed)).ToList();
        return new Match(record.Id, record.Title, record.Date, record.Venue, record.MaxPlayers, players);
    }
}
