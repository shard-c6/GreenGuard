## What & why

<!-- What changes, and what problem it solves. Link the issue: Closes #123 -->

Closes #

## Area
<!-- Check all that apply -->
- [ ] Backend  - [ ] Frontend  - [ ] Database/migrations  - [ ] AI/ML  - [ ] DevOps/CI  - [ ] Docs

## Verification

<!-- How did you confirm this works? "It builds" is not verification. -->

- [ ] Ran locally and exercised the changed path
- [ ] `npm run lint` passes
- [ ] Tests added or updated (or: why not)

## Migration safety
<!-- Delete if no database changes -->
- [ ] Migration is idempotent — every `CREATE POLICY` has a `DROP POLICY IF EXISTS` above it
- [ ] `supabase db reset` replays cleanly from empty, twice in a row
- [ ] `docs/MIGRATIONS.md` updated

## Safety check

- [ ] No code path returns fabricated AI output outside an explicit, labelled `DEMO_MODE`
- [ ] No credentials, API keys, or secret literals added
- [ ] Failure modes fail **closed**, not open

## Screenshots
<!-- UI changes only -->
