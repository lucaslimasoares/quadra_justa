-- Quadra Justa: schema inicial para Supabase/PostgreSQL.
-- As colunas de listas permanecem como JSON em text para manter compatibilidade
-- com o backend atual, que usa JsonSerializer para ler e gravar esses valores.

create extension if not exists "pgcrypto";

create table if not exists public."Players" (
    "Id" uuid primary key default gen_random_uuid(),
    "Name" varchar(120) not null,
    "Initials" varchar(4) not null,
    "Position" varchar(40) not null,
    "Level" double precision not null,
    "Trait" varchar(240) not null,
    "Sports" varchar(500) not null default '[]'
);

create table if not exists public."Matches" (
    "Id" uuid primary key default gen_random_uuid(),
    "Title" varchar(160) not null,
    "Date" timestamptz not null,
    "Venue" varchar(200) not null,
    "MaxPlayers" integer not null,
    "Privacy" varchar(20) not null default 'public',
    "CreatorEmail" text,
    "InvitedEmails" varchar(4000) not null default '[]',
    "ModeratorEmails" varchar(4000) not null default '[]',
    "AdministratorEmails" varchar(4000) not null default '[]',
    "Notes" varchar(1000),
    "MatchRules" varchar(4000) not null default '[]',
    "DrawRules" varchar(4000) not null default '[]'
);

create table if not exists public."MatchPlayers" (
    "MatchId" uuid not null references public."Matches" ("Id") on delete cascade,
    "PlayerId" uuid not null references public."Players" ("Id") on delete cascade,
    "IsConfirmed" boolean not null default false,
    primary key ("MatchId", "PlayerId")
);

create index if not exists "IX_Matches_Date"
    on public."Matches" ("Date");

create index if not exists "IX_MatchPlayers_PlayerId"
    on public."MatchPlayers" ("PlayerId");

comment on table public."Players" is 'Jogadores cadastrados no Quadra Justa';
comment on table public."Matches" is 'Peladas e suas regras de acesso';
comment on table public."MatchPlayers" is 'Participantes e confirmação de presença';
