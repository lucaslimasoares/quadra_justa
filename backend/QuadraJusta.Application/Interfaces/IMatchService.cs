using QuadraJusta.Application.Models;
namespace QuadraJusta.Application.Interfaces;
public interface IMatchService
{
	Task<MatchDto?> GetUpcomingAsync(CancellationToken ct);
	Task<IReadOnlyList<MatchDto>> GetVisibleAsync(string email, CancellationToken ct);
	Task<MatchDto> CreateAsync(CreateMatchRequest request, CancellationToken ct);
	Task<TeamsDto?> GenerateTeamsAsync(Guid matchId, string email, GenerateTeamsRequest request, CancellationToken ct);
}
