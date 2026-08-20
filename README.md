# Quadra Justa

Protótipo full-stack para organizar peladas e gerar times equilibrados.

## Estrutura

- `backend/QuadraJusta.Domain`: entidades e contratos de negócio.
- `backend/QuadraJusta.Application`: casos de uso e algoritmo de divisão.
- `backend/QuadraJusta.Infrastructure`: persistência SQLite com Entity Framework Core.
- `backend/QuadraJusta.Api`: API HTTP ASP.NET Core.
- `frontend`: interface React responsiva.

## Executar

Em dois terminais:

```bash
cd backend && dotnet run --project QuadraJusta.Api
cd frontend && npm install && npm run dev
```

Os endpoints da API ficam em `/api/matches`.

Na primeira execução, a API cria `backend/QuadraJusta.Api/data/quadrajusta.db` e insere uma partida de exemplo. O schema possui as tabelas `Players`, `Matches` e `MatchPlayers`, sendo esta última a relação entre jogadores e partidas.
