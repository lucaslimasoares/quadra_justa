using QuadraJusta.Domain.Entities;
using QuadraJusta.Domain.Interfaces;
namespace QuadraJusta.Infrastructure.Repositories;
public sealed class InMemoryMatchRepository : IMatchRepository
{
    private static readonly List<Match> Matches = [];
    public Task<Match?> GetUpcomingAsync(CancellationToken cancellationToken) => Task.FromResult(Matches.OrderBy(match => match.Date).FirstOrDefault());
    public Task<IReadOnlyList<Match>> GetVisibleAsync(string email, CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<Match>>(Matches.Where(match => match.Privacy == "public" || match.CreatorEmail == email || match.InvitedEmails.Contains(email, StringComparer.OrdinalIgnoreCase)).ToList());
    public Task<Match?> GetByIdAsync(Guid id, CancellationToken cancellationToken) => Task.FromResult(Matches.FirstOrDefault(match => match.Id == id));
    public Task<Match> AddAsync(Match match, CancellationToken cancellationToken) { Matches.Add(match); return Task.FromResult(match); }
}
