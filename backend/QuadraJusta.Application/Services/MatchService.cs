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
        return match is null ? null : ToDto(match, string.Empty);
    }

    public async Task<IReadOnlyList<MatchDto>> GetVisibleAsync(string email, CancellationToken ct) =>
        (await repository.GetVisibleAsync(email.Trim(), ct)).Select(match => ToDto(match, email)).ToList();

    public async Task<MatchDto> CreateAsync(CreateMatchRequest request, CancellationToken ct)
    {
        var title = request.Title?.Trim() ?? string.Empty;
        var venue = request.Venue?.Trim() ?? string.Empty;
        var privacy = request.Privacy?.Trim().ToLowerInvariant();
        if (title.Length < 2) throw new ArgumentException("Informe o nome da pelada.");
        if (venue.Length < 2) throw new ArgumentException("Informe o local da pelada.");
        if (request.MaxPlayers is < 2 or > 100) throw new ArgumentException("As vagas devem estar entre 2 e 100.");
        if (request.Date <= DateTimeOffset.UtcNow) throw new ArgumentException("A data da pelada deve ser futura.");
        if (privacy is not ("public" or "private")) throw new ArgumentException("A privacidade deve ser public ou private.");
        var creator = request.CreatorEmail?.Trim().ToLowerInvariant() ?? string.Empty;
        if (creator.Length == 0 || !creator.Contains('@')) throw new ArgumentException("Informe um e-mail de criador válido.");
        var invited = request.InvitedEmails?.Select(email => email.Trim().ToLowerInvariant()).Where(email => email.Contains('@')).Distinct().ToList() ?? [];
        var moderators = request.ModeratorEmails?.Select(email => email.Trim().ToLowerInvariant()).Where(email => email.Contains('@') && email != creator).Distinct().ToList() ?? [];
        var match = new Match(Guid.NewGuid(), title, request.Date, venue, request.MaxPlayers, [], privacy, creator, invited, moderators);
        return ToDto(await repository.AddAsync(match, ct), creator);
    }

    public async Task<TeamsDto?> GenerateTeamsAsync(Guid matchId, string email, GenerateTeamsRequest request, CancellationToken ct)
    {
        if (request.TeamCount is < 2 or > 3) throw new ArgumentOutOfRangeException(nameof(request.TeamCount));
        var match = await repository.GetByIdAsync(matchId, ct);
        if (match is null) return null;
        var role = MatchAccessPolicy.ResolveRole(match, email.Trim());
        if (role is not (ParticipantRole.Administrator or ParticipantRole.Moderator)) throw new UnauthorizedAccessException("Apenas administradores e moderadores podem gerar times.");
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

    private static MatchDto ToDto(Match match, string email)
    {
        var role = MatchAccessPolicy.ResolveRole(match, email);
        return new(match.Id, match.Title, match.Date, match.Venue, match.MaxPlayers, match.Players.Count(x => x.IsConfirmed), match.Players.Where(x => x.IsConfirmed).Select(ToDto).ToList(), match.Privacy, match.CreatorEmail, match.InvitedEmails, role.ToString().ToLowerInvariant(), MatchAccessPolicy.GetPermissions(role));
    }
    private static PlayerDto ToDto(Player player) => new(player.Id, player.Name, player.Initials, player.Position, player.Level, player.Trait, player.Sports);
}
