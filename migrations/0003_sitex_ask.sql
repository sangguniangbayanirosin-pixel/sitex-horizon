-- Passenger “is this bus coming?” asks; driver/conductor confirms.
create table if not exists sitex_ask (
  id text primary key,
  bus_id text not null,
  plate text not null,
  destination text not null,
  zip text not null,
  status text not null default 'pending',
  asked_at bigint not null,
  confirmed_at bigint
);

create index if not exists sitex_ask_bus_idx on sitex_ask (bus_id, status);
create index if not exists sitex_ask_asked_idx on sitex_ask (asked_at desc);
