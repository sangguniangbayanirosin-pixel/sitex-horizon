-- Shared live board: GPS, announcements, reports, ads. Unowned (no user_id).
create table if not exists sitex_bus (
  id text primary key,
  plate text not null,
  operator text not null,
  route_id text not null,
  destination text not null,
  zip text not null,
  via text not null,
  total_km double precision not null,
  remaining_km double precision not null,
  speed_kmh double precision not null,
  target_speed_kmh double precision not null,
  cruise_kmh double precision not null,
  status text not null,
  lat double precision not null,
  lng double precision not null,
  heading double precision not null,
  last_fix_at bigint not null,
  gps_source text not null,
  gps_accuracy_m double precision,
  driver_controlled boolean not null default false
);

create table if not exists sitex_announcement (
  id integer primary key,
  level text not null,
  title text not null,
  body text not null,
  show_hotlines boolean not null default false,
  updated_at bigint not null
);

create table if not exists sitex_weather (
  id integer primary key,
  weather text not null,
  updated_at bigint not null
);

create table if not exists sitex_report (
  id text primary key,
  ticket text not null,
  category text not null,
  route text not null default '',
  issue_note text not null default '',
  status text not null,
  forwarded_to text,
  created_at bigint not null
);

create table if not exists sitex_ad (
  id text primary key,
  kind text not null,
  src text not null,
  poster_src text,
  sponsor text not null default '',
  headline text not null,
  caption text not null default '',
  cta_label text not null default '',
  cta_url text not null default '',
  dwell_sec integer not null default 12,
  active boolean not null default true,
  updated_at bigint not null
);

insert into sitex_announcement (id, level, title, body, show_hotlines, updated_at)
values (1, 'none', '', '', false, 0)
on conflict (id) do nothing;

insert into sitex_weather (id, weather, updated_at)
values (1, 'clear', 0)
on conflict (id) do nothing;
