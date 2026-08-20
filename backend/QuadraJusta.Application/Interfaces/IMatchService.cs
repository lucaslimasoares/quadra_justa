using QuadraJusta.Application.Models;
namespace QuadraJusta.Application.Interfaces;
public interface IMatchService { Task<MatchDto?> GetUpcomingAsync(CancellationToken ct); Task<TeamsDto?> GenerateTeamsAsync(GenerateTeamsRequest request, CancellationToken ct); }
