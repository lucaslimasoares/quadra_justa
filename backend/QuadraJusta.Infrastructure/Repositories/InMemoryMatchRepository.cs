using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;
namespace QuadraJusta.Infrastructure.Repositories;
public sealed class InMemoryMatchRepository : IMatchRepository
{
    private static readonly Match Upcoming = new(Guid.NewGuid(), "Quinta no Arena 8", new DateTimeOffset(2026, 8, 20, 20, 0, 0, TimeSpan.FromHours(-3)), "Quadra 2 · Futebol society", 12,
    [new(Guid.NewGuid(), "Rafael \"Muralha\"", "RM", "Goleiro", 7, "Reflexo e marcação"), new(Guid.NewGuid(), "Pedro", "PS", "Goleiro", 6, "Posicionamento"), new(Guid.NewGuid(), "Diego", "DG", "Fixo", 6, "Posicionamento"), new(Guid.NewGuid(), "Felipe", "FL", "Fixo", 6, "Criação forte"), new(Guid.NewGuid(), "Lucas \"Biel\"", "LB", "Ala", 6, "Velocidade e passe"), new(Guid.NewGuid(), "Neto", "NT", "Ala", 5, "Drible"), new(Guid.NewGuid(), "André", "AN", "Ala", 5, "Em observação"), new(Guid.NewGuid(), "Vinícius", "VG", "Pivô", 6, "Finalização"), new(Guid.NewGuid(), "Caio", "CN", "Pivô", 7, "Finalização"), new(Guid.NewGuid(), "João", "JM", "Ala", 6, "Passe"), new(Guid.NewGuid(), "Renan", "RS", "Ala", 5, "Marcação"), new(Guid.NewGuid(), "Bruno", "BR", "Ala", 6, "Velocidade")]);
    public Task<Match?> GetUpcomingAsync(CancellationToken cancellationToken) => Task.FromResult<Match?>(Upcoming);
}
