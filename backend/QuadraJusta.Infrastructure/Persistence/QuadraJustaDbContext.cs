using Microsoft.EntityFrameworkCore;
using QuadraJusta.Infrastructure.Persistence.Entities;

namespace QuadraJusta.Infrastructure.Persistence;

public sealed class QuadraJustaDbContext(DbContextOptions<QuadraJustaDbContext> options) : DbContext(options)
{
    public DbSet<PlayerRecord> Players => Set<PlayerRecord>();
    public DbSet<MatchRecord> Matches => Set<MatchRecord>();
    public DbSet<MatchPlayerRecord> MatchPlayers => Set<MatchPlayerRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlayerRecord>(entity =>
        {
            entity.ToTable("Players");
            entity.HasKey(player => player.Id);
            entity.Property(player => player.Name).HasMaxLength(120).IsRequired();
            entity.Property(player => player.Initials).HasMaxLength(4).IsRequired();
            entity.Property(player => player.Position).HasMaxLength(40).IsRequired();
            entity.Property(player => player.Level).IsRequired();
            entity.Property(player => player.Trait).HasMaxLength(240).IsRequired();
            entity.Property(player => player.Sports).HasMaxLength(500).IsRequired();
        });

        modelBuilder.Entity<MatchRecord>(entity =>
        {
            entity.ToTable("Matches");
            entity.HasKey(match => match.Id);
            entity.Property(match => match.Title).HasMaxLength(160).IsRequired();
            entity.Property(match => match.Venue).HasMaxLength(200).IsRequired();
            entity.Property(match => match.Date).IsRequired();
            entity.Property(match => match.MaxPlayers).IsRequired();
            entity.Property(match => match.Privacy).HasMaxLength(20).IsRequired();
            entity.Property(match => match.InvitedEmails).HasMaxLength(4000).IsRequired();
            entity.Property(match => match.ModeratorEmails).HasMaxLength(4000).IsRequired();
            entity.Property(match => match.Notes).HasMaxLength(1000);
        });

        modelBuilder.Entity<MatchPlayerRecord>(entity =>
        {
            entity.ToTable("MatchPlayers");
            entity.HasKey(item => new { item.MatchId, item.PlayerId });
            entity.HasOne(item => item.Match).WithMany(match => match.Players).HasForeignKey(item => item.MatchId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.Player).WithMany(player => player.Matches).HasForeignKey(item => item.PlayerId).OnDelete(DeleteBehavior.Cascade);
            entity.Property(item => item.IsConfirmed).IsRequired();
        });
    }
}
