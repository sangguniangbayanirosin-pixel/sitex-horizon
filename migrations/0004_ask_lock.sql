-- One open ask per bus. Extra columns for revoke / arrival reset.
alter table sitex_ask add column if not exists updated_at bigint not null default 0;

update sitex_ask set updated_at = coalesce(confirmed_at, asked_at) where updated_at = 0;

delete from sitex_ask a
using sitex_ask b
where a.bus_id = b.bus_id
  and a.status in ('pending', 'confirmed')
  and b.status in ('pending', 'confirmed')
  and (
    a.asked_at > b.asked_at
    or (a.asked_at = b.asked_at and a.id > b.id)
  );

create unique index if not exists sitex_ask_one_open
  on sitex_ask (bus_id)
  where status in ('pending', 'confirmed');
