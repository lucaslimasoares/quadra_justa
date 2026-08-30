-- O cadastro é criado pelo Supabase Auth. Este perfil espelha os dados que o
-- formulário envia como metadata, sem expor senha nem exigir insert pelo browser.
create table if not exists public."Profiles" (
    "UserId" uuid primary key references auth.users(id) on delete cascade,
    "Name" varchar(120) not null,
    "Email" text not null unique,
    "Position" varchar(40) not null,
    "Preferences" jsonb not null default '[]'::jsonb,
    "CreatedAt" timestamptz not null default now()
);

alter table public."Profiles" enable row level security;

create policy "Users can read their own profile"
    on public."Profiles" for select
    using (auth.uid() = "UserId");

create policy "Users can update their own profile"
    on public."Profiles" for update
    using (auth.uid() = "UserId")
    with check (auth.uid() = "UserId");

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public."Profiles" ("UserId", "Name", "Email", "Position", "Preferences")
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'name', ''),
        new.email,
        coalesce(new.raw_user_meta_data ->> 'position', ''),
        coalesce(new.raw_user_meta_data -> 'preferences', '[]'::jsonb)
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
