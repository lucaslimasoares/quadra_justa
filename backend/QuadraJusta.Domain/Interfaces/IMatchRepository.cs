using QuadraJusta.Domain.Entities;
namespace QuadraJusta.Domain.Interfaces;
public interface IMatchRepository { Task<Match?> GetUpcomingAsync(CancellationToken cancellationToken); }
