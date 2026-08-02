-- Remove test rows created during MFA testing (multi-tenant-hardening-plan.md, item #3).
-- Cascades to their buildings/rooms/admins via existing FK ON DELETE CASCADE.
delete from public.universities
where name in ('Test University QA', 'Test University Login QA');
