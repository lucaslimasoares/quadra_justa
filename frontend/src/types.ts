export type Player = { id: string; name: string; initials: string; position: string; level: number; trait: string };
export type CreatePlayer = { name: string; position: string; level: number; trait?: string };
export type Match = { id: string; title: string; date: string; venue: string; maxPlayers: number; confirmedCount: number; players: Player[] };
export type Team = { name: string; color: string; totalLevel: number; averageLevel: number; players: Player[] };
export type TeamsResult = { balancePercentage: number; teams: Team[]; explanation: string };
