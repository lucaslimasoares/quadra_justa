using QuadraJusta.Domain.Entities;

namespace QuadraJusta.Domain.Interfaces;

public interface IPlayerRepository
{
    Task<IReadOnlyList<Player>> GetAllAsync(CancellationToken cancellationToken);
    Task<Player> AddAsync(Player player, CancellationToken cancellationToken);
    Task<Player?> UpdateAsync(Player player, CancellationToken cancellationToken);
}
