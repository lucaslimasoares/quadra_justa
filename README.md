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
cd backend && dotnet run --project QuadraJusta.Api --urls http://localhost:5000
cd frontend && npm install && npm run dev
```

Os endpoints da API ficam em `/api/matches`.

## Usar o Supabase na API

O provider padrão é SQLite. Para conectar ao banco PostgreSQL do Supabase, crie o
arquivo `.env` na raiz a partir do modelo. A senha não deve ser commitada.

```bash
cp .env.example .env
# Edite .env e substitua YOUR-PASSWORD pela senha real do banco.
dotnet run --project backend/QuadraJusta.Api --urls http://localhost:5000
```

A API carrega automaticamente o `.env` da raiz sempre que for iniciada.

Também é aceito o formato da URL exibida pelo Supabase, desde que a senha esteja
URL-encoded. Nesse caso, informe a URL em `ConnectionStrings__QuadraJusta` e
`SUPABASE_DB_PASSWORD` continua sendo opcional.

Execute antes a migration em `supabase/migrations` no projeto Supabase. Quando o
provider for `Postgres`, a API não executa comandos SQLite nem cria seed local.

## Cadastro de contas no Supabase

O frontend usa o Supabase Auth para criar e autenticar contas. Copie
`frontend/.env.example` para `frontend/.env` e preencha a URL do projeto e a
chave **publishable** (nunca use `service_role` no navegador).

Para habilitar a busca de endereços no Google Maps, preencha também
`VITE_GOOGLE_MAPS_API_KEY` com uma chave que tenha a Maps JavaScript API e o
Places API habilitados. Sem essa chave, o campo continua funcionando como texto.

Execute também a migration `20260828140000_auth_profiles.sql` no SQL Editor do
Supabase, ou aplique as migrations com a CLI. Ela cria `Profiles`, habilita RLS
e cria um trigger que salva nome, posição e preferências quando um usuário é
cadastrado pelo Auth. Senhas continuam exclusivamente no Supabase Auth.

Se a confirmação de e-mail estiver habilitada em Authentication > Providers >
Email, a interface pedirá a confirmação antes de permitir o login.

No modo SQLite, a primeira execução cria `backend/QuadraJusta.Api/data/quadrajusta.db` vazio. O schema possui as tabelas `Players`, `Matches` e `MatchPlayers`, sendo esta última a relação entre jogadores e partidas.
