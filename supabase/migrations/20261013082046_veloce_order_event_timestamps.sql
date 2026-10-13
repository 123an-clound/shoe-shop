-- Preserve the sequence of multiple audit entries written in one transaction.
alter table public.veloce_order_events alter column created_at set default clock_timestamp();
