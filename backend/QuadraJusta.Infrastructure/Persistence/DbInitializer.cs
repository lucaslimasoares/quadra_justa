using Microsoft.EntityFrameworkCore;
using QuadraJusta.Infrastructure.Persistence.Entities;

namespace QuadraJusta.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task InitializeAsync(QuadraJustaDbContext db, CancellationToken cancellationToken = default)
    {
        var dataSource = db.Database.GetDbConnection().DataSource;
        if (!string.IsNullOrWhiteSpace(dataSource) && dataSource != ":memory:")
        {
            var directory = Path.GetDirectoryName(Path.GetFullPath(dataSource));
            if (!string.IsNullOrWhiteSpace(directory)) Directory.CreateDirectory(directory);
        }
        await db.Database.EnsureCreatedAsync(cancellationToken);
        if (await db.Matches.AnyAsync(cancellationToken)) return;

        var players = new[]
        {
            NewPlayer("Rafael Muralha", "RM", "Goleiro", 7, "Reflexo e marcação"),
            NewPlayer("Pedro", "PS", "Goleiro", 6, "Posicionamento"),
            NewPlayer("Diego", "DG", "Fixo", 6, "Posicionamento"),
            NewPlayer("Felipe", "FL", "Fixo", 6, "Criação forte"),
            NewPlayer("Lucas Biel", "LB", "Ala", 6, "Velocidade e passe"),
            NewPlayer("Neto", "NT", "Ala", 5, "Drible"),
            NewPlayer("André", "AN", "Ala", 5, "Em observação"),
            NewPlayer("Vinícius", "VG", "Pivô", 6, "Finalização"),
            NewPlayer("Caio", "CN", "Pivô", 7, "Finalização"),
            NewPlayer("João", "JM", "Ala", 6, "Passe"),
            NewPlayer("Renan", "RS", "Ala", 5, "Marcação"),
            NewPlayer("Bruno", "BR", "Ala", 6, "Velocidade")
        };
        var match = new MatchRecord
        {
            Id = Guid.NewGuid(), Title = "Quinta no Arena 8",
            Date = new DateTimeOffset(2026, 8, 20, 20, 0, 0, TimeSpan.FromHours(-3)),
            Venue = "Quadra 2 - Futebol society", MaxPlayers = 12,
            Players = players.Select(player => new MatchPlayerRecord { Player = player, IsConfirmed = true }).ToList()
        };
        db.Players.AddRange(players);
        db.Matches.Add(match);
        await db.SaveChangesAsync(cancellationToken);
    }

    private static PlayerRecord NewPlayer(string name, string initials, string position, double level, string trait) => new()
    {
        Id = Guid.NewGuid(), Name = name, Initials = initials, Position = position, Level = level, Trait = trait
    };
}
