-- Telegram channel (docs/TELEGRAM.md): a chat linked to an ANDA account, and one-time link codes.
-- Service role only: the bot and /api/telegram/link read and write these server-side.

create table if not exists public.telegram_links (
  chat_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The last question that found no reviewed answer, kept until they press "Send to an expert".
  pending_question text check (char_length(pending_question) <= 1000),
  linked_at timestamptz not null default now()
);
create index if not exists telegram_links_user_idx on public.telegram_links (user_id);
alter table public.telegram_links enable row level security;
revoke all on public.telegram_links from anon, authenticated;

create table if not exists public.telegram_link_codes (
  code_hash text primary key, -- sha256 of the code; the code itself is never stored
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null
);
alter table public.telegram_link_codes enable row level security;
revoke all on public.telegram_link_codes from anon, authenticated;
