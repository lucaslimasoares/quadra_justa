using QuadraJusta.Application.Interfaces;
using QuadraJusta.Application.Models;
using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;

namespace QuadraJusta.Application.Services;

public sealed class MatchService(IMatchRepository repository) : IMatchService
{
    public async Task<MatchDto?> GetUpcomingAsync(CancellationToken ct)
    {
        var match = await repository.GetUpcomingAsync(ct);
        return match is null ? null : ToDto(match);
    }

    public async Task<TeamsDto?> GenerateTeamsAsync(GenerateTeamsRequest request, CancellationToken ct)
    {
        if (request.TeamCount is < 2 or > 3) throw new ArgumentOutOfRangeException(nameof(request.TeamCount));
        var match = await repository.GetUpcomingAsync(ct);
        if (match is null) return null;
        var players = match.Players.Where(x => x.IsConfirmed).ToList();
        var buckets = Enumerable.Range(0, request.TeamCount).Select(_ => new List<Player>()).ToList();
        // Greedy balancing: ranking first makes each next player go to the currently weakest team.
        foreach (var player in players.OrderByDescending(x => x.Level))
            buckets.OrderBy(x => x.Sum(p => p.Level)).First().Add(player);
        var totals = buckets.Select(x => x.Sum(p => p.Level)).ToArray();
        var balance = (int)Math.Round((double)totals.Min() / totals.Max() * 100);
        var colors = new[] { ("Time Azul", "blue"), ("Time Laranja", "orange"), ("Time Verde", "green") };
        var teams = buckets.Select((players, index) => new TeamDto(colors[index].Item1, colors[index].Item2, totals[index], Math.Round(totals[index] / (double)players.Count, 1), players.Select(ToDto).ToList())).ToList();
        return new TeamsDto(balance, teams, "Forças, posições e restrições foram distribuídas de forma muito próxima.");
    }

    private static MatchDto ToDto(Match match) => new(match.Id, match.Title, match.Date, match.Venue, match.MaxPlayers, match.Players.Count(x => x.IsConfirmed), match.Players.Where(x => x.IsConfirmed).Select(ToDto).ToList());
    private static PlayerDto ToDto(Player player) => new(player.Id, player.Name, player.Initials, player.Position, player.Level, player.Trait);
}
