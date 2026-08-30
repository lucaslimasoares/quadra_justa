# Supabase

## Aplicar a migration

Instale e autentique o Supabase CLI, associe o projeto e aplique as migrations:

```bash
supabase init
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

A migration cria `Players`, `Matches` e `MatchPlayers` no schema `public`. Ela não
insere jogadores ou peladas de demonstração: a base começa vazia.

## Importar dados antigos

O banco local SQLite pode ser exportado para arquivos CSV antes do `db push`:

```bash
sqlite3 backend/QuadraJusta.Api/data/quadrajusta.db <<'SQL'
.headers on
.mode csv
.once /tmp/players.csv
select * from Players;
.once /tmp/matches.csv
select * from Matches;
.once /tmp/match_players.csv
select * from MatchPlayers;
SQL
```

Depois da migration, importe os CSVs pelo Table Editor do Supabase ou pelo SQL
Editor. Preserve os UUIDs e importe primeiro `Players` e `Matches`, depois
`MatchPlayers`.

As colunas de listas (`Sports`, `InvitedEmails`, `ModeratorEmails`,
`AdministratorEmails`, `MatchRules` e `DrawRules`) continuam armazenando JSON em
texto para manter compatibilidade com o backend atual.
