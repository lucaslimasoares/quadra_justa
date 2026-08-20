using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;

namespace QuadraJusta.Infrastructure.Repositories;

public sealed class InMemoryPlayerRepository : IPlayerRepository
{
    private static readonly List<Player> Players =
    [
        new(Guid.NewGuid(), "Rafael Muralha", "RM", "Goleiro", 7, "Reflexo e marcação"),
        new(Guid.NewGuid(), "Pedro", "PS", "Goleiro", 6, "Posicionamento"),
        new(Guid.NewGuid(), "Diego", "DG", "Fixo", 6, "Posicionamento"),
        new(Guid.NewGuid(), "Lucas Biel", "LB", "Ala", 6, "Velocidade e passe"),
        new(Guid.NewGuid(), "Caio", "CN", "Pivô", 7, "Finalização")
    ];
    private static readonly Lock Sync = new();

    public Task<IReadOnlyList<Player>> GetAllAsync(CancellationToken cancellationToken)
    {
        lock (Sync) return Task.FromResult<IReadOnlyList<Player>>(Players.ToList());
    }

    public Task<Player> AddAsync(Player player, CancellationToken cancellationToken)
    {
        lock (Sync) Players.Add(player);
        return Task.FromResult(player);
    }

    public Task<Player?> UpdateAsync(Player player, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var index = Players.FindIndex(current => current.Id == player.Id);
            if (index < 0) return Task.FromResult<Player?>(null);
            Players[index] = player;
            return Task.FromResult<Player?>(player);
        }
    }
}
