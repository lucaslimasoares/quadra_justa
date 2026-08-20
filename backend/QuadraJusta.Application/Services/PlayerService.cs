using QuadraJusta.Application.Interfaces;
using QuadraJusta.Application.Models;
using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;

namespace QuadraJusta.Application.Services;

public sealed class PlayerService(IPlayerRepository repository) : IPlayerService
{
    public async Task<IReadOnlyList<PlayerDto>> GetAllAsync(CancellationToken ct) =>
        (await repository.GetAllAsync(ct)).Select(ToDto).ToList();

    public async Task<PlayerDto> CreateAsync(CreatePlayerRequest request, CancellationToken ct)
    {
        var player = await BuildPlayerAsync(Guid.NewGuid(), request, false, ct);
        return ToDto(player ?? throw new InvalidOperationException("Não foi possível criar o jogador."));
    }

    public async Task<PlayerDto?> UpdateAsync(Guid id, CreatePlayerRequest request, CancellationToken ct)
    {
        var player = await BuildPlayerAsync(id, request, false, ct, true);
        return player is null ? null : ToDto(player);
    }

    private async Task<Player?> BuildPlayerAsync(Guid id, CreatePlayerRequest request, bool isConfirmed, CancellationToken ct, bool update = false)
    {
        var name = request.Name?.Trim() ?? string.Empty;
        var position = request.Position?.Trim() ?? string.Empty;
        if (name.Length < 2) throw new ArgumentException("Informe o nome do jogador.");
        if (position.Length == 0) throw new ArgumentException("Selecione a posição principal.");
        if (request.Level is < 1 or > 10 || request.Level * 2 != Math.Round(request.Level * 2)) throw new ArgumentException("O nível deve estar entre 1 e 10, em intervalos de meio ponto.");

        var initials = string.Concat(name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Take(2).Select(part => char.ToUpperInvariant(part[0])));
        var trait = string.IsNullOrWhiteSpace(request.Trait) ? "Perfil em atualização" : request.Trait.Trim();
        var player = new Player(id, name, initials, position, request.Level, trait, isConfirmed);
        return update ? await repository.UpdateAsync(player, ct) : await repository.AddAsync(player, ct);
    }

    private static PlayerDto ToDto(Player player) => new(player.Id, player.Name, player.Initials, player.Position, player.Level, player.Trait);
}
