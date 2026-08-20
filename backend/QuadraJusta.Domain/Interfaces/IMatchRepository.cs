using QuadraJusta.Domain.Entities;
namespace QuadraJusta.Domain.Interfaces;
public interface IMatchRepository
{
	Task<Match?> GetUpcomingAsync(CancellationToken cancellationToken);
	Task<IReadOnlyList<Match>> GetVisibleAsync(string email, CancellationToken cancellationToken);
	Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
	Task<Match> AddAsync(Match match, CancellationToken cancellationToken);
}
