using QuadraJusta.Application.Models;

namespace QuadraJusta.Application.Interfaces;

public interface IPlayerService
{
    Task<IReadOnlyList<PlayerDto>> GetAllAsync(CancellationToken ct);
    Task<PlayerDto> CreateAsync(CreatePlayerRequest request, CancellationToken ct);
    Task<PlayerDto?> UpdateAsync(Guid id, CreatePlayerRequest request, CancellationToken ct);
}
