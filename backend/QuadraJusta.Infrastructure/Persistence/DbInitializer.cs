using Microsoft.EntityFrameworkCore;

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
        await AddColumnIfMissingAsync(db, "Players", "Sports", "TEXT NOT NULL DEFAULT '[]'", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "Privacy", "TEXT NOT NULL DEFAULT 'public'", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "CreatorEmail", "TEXT NULL", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "InvitedEmails", "TEXT NOT NULL DEFAULT '[]'", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "ModeratorEmails", "TEXT NOT NULL DEFAULT '[]'", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "AdministratorEmails", "TEXT NOT NULL DEFAULT '[]'", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "Notes", "TEXT NULL", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "MatchRules", "TEXT NOT NULL DEFAULT '[]'", cancellationToken);
        await AddColumnIfMissingAsync(db, "Matches", "DrawRules", "TEXT NOT NULL DEFAULT '[]'", cancellationToken);
    }

    private static async Task AddColumnIfMissingAsync(QuadraJustaDbContext db, string table, string column, string definition, CancellationToken cancellationToken)
    {
        await using var command = db.Database.GetDbConnection().CreateCommand();
        command.CommandText = $"PRAGMA table_info({table})";
        if (command.Connection?.State != System.Data.ConnectionState.Open) await db.Database.OpenConnectionAsync(cancellationToken);
        await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken)) if (string.Equals(reader.GetString(1), column, StringComparison.OrdinalIgnoreCase)) return;
        }
        try { await db.Database.ExecuteSqlRawAsync($"ALTER TABLE {table} ADD COLUMN {column} {definition}", cancellationToken); } catch (Microsoft.Data.Sqlite.SqliteException) { }
    }

}
