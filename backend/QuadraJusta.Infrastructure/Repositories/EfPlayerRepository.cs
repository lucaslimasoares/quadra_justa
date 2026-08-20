using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;
using QuadraJusta.Infrastructure.Persistence;
using QuadraJusta.Infrastructure.Persistence.Entities;

namespace QuadraJusta.Infrastructure.Repositories;

public sealed class EfPlayerRepository(QuadraJustaDbContext db) : IPlayerRepository
{
    public async Task<IReadOnlyList<Player>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Players.AsNoTracking().OrderBy(player => player.Name).Select(ToDomain()).ToListAsync(cancellationToken);

    public async Task<Player> AddAsync(Player player, CancellationToken cancellationToken)
    {
        db.Players.Add(ToRecord(player));
        await db.SaveChangesAsync(cancellationToken);
        return player;
    }

    public async Task<Player?> UpdateAsync(Player player, CancellationToken cancellationToken)
    {
        var record = await db.Players.SingleOrDefaultAsync(item => item.Id == player.Id, cancellationToken);
        if (record is null) return null;
        record.Name = player.Name;
        record.Initials = player.Initials;
        record.Position = player.Position;
        record.Level = player.Level;
        record.Trait = player.Trait;
        await db.SaveChangesAsync(cancellationToken);
        return player;
    }

    private static PlayerRecord ToRecord(Player player) => new()
    {
        Id = player.Id, Name = player.Name, Initials = player.Initials, Position = player.Position,
        Level = player.Level, Trait = player.Trait
    };

    private static Expression<Func<PlayerRecord, Player>> ToDomain() => player =>
        new Player(player.Id, player.Name, player.Initials, player.Position, player.Level, player.Trait);
}
