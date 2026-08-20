namespace QuadraJusta.Domain.Entities;

public sealed class Player
{
    public Player(Guid id, string name, string initials, string position, double level, string trait, IReadOnlyList<string>? sports = null, bool isConfirmed = true)
    { Id = id; Name = name; Initials = initials; Position = position; Level = level; Trait = trait; Sports = sports ?? []; IsConfirmed = isConfirmed; }
    public Player(Guid id, string name, string initials, string position, double level, string trait, bool isConfirmed)
        : this(id, name, initials, position, level, trait, Array.Empty<string>(), isConfirmed) { }
    public Guid Id { get; }
    public string Name { get; }
    public string Initials { get; }
    public string Position { get; }
    public double Level { get; }
    public string Trait { get; }
    public IReadOnlyList<string> Sports { get; }
    public bool IsConfirmed { get; }
}
