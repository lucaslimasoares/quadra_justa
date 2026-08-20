using QuadraJusta.Domain.Entities;

namespace QuadraJusta.Application.Services;

public sealed record MatchPermissions(bool CanView, bool CanConfirmPresence, bool CanModeratePresence, bool CanGenerateTeams, bool CanManageMatch, bool CanManageParticipants);

public static class MatchAccessPolicy
{
    public static ParticipantRole ResolveRole(Match match, string email)
    {
        if (string.IsNullOrWhiteSpace(match.CreatorEmail)) return ParticipantRole.Administrator;
        if (string.Equals(match.CreatorEmail, email, StringComparison.OrdinalIgnoreCase)) return ParticipantRole.Administrator;
        if (match.ModeratorEmails.Contains(email, StringComparer.OrdinalIgnoreCase)) return ParticipantRole.Moderator;
        return ParticipantRole.Participant;
    }

    public static MatchPermissions GetPermissions(ParticipantRole role) => role switch
    {
        ParticipantRole.Administrator => new(true, true, true, true, true, true),
        ParticipantRole.Moderator => new(true, true, true, true, false, false),
        _ => new(true, true, false, false, false, false)
    };
}
