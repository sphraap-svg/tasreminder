-- ═══════════════════════════════════════════════════════════════════
-- Team Workspace Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════

-- ─── Workspaces ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Workspace Members ───────────────────────────────────────────────
-- One row per (user × workspace). role = manager | member.
CREATE TABLE IF NOT EXISTS workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('manager', 'member')) DEFAULT 'member',
  display_name  TEXT NOT NULL DEFAULT '',
  UNIQUE (workspace_id, user_id)
);

-- ─── Workspace Tasks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('team', 'personal')) DEFAULT 'team',
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  assigned_to   UUID REFERENCES auth.users(id),
  status        TEXT NOT NULL CHECK (status IN ('pending', 'done', 'not_done')) DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspace_tasks_updated_at
  BEFORE UPDATE ON workspace_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks   ENABLE ROW LEVEL SECURITY;

-- Helper: get workspace_id for current user (returns first workspace)
CREATE OR REPLACE FUNCTION my_workspace_id()
RETURNS UUID AS $$
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: current user's role in a workspace
CREATE OR REPLACE FUNCTION my_role_in(ws_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM workspace_members WHERE workspace_id = ws_id AND user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── workspaces ──────────────────────────────────────────────────────
-- Members can see their own workspace
CREATE POLICY "members see own workspace"
  ON workspaces FOR SELECT
  USING (id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- ─── workspace_members ───────────────────────────────────────────────
-- Members can see other members of the same workspace
CREATE POLICY "members see same workspace members"
  ON workspace_members FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()));

-- ─── workspace_tasks SELECT ──────────────────────────────────────────
-- Team tasks: all workspace members see them
-- Personal tasks: manager sees all; member sees only their own
CREATE POLICY "select workspace tasks"
  ON workspace_tasks FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    AND (
      type = 'team'
      OR my_role_in(workspace_id) = 'manager'
      OR assigned_to = auth.uid()
      OR created_by = auth.uid()
    )
  );

-- ─── workspace_tasks INSERT ──────────────────────────────────────────
-- Only managers can create tasks
CREATE POLICY "managers insert tasks"
  ON workspace_tasks FOR INSERT
  WITH CHECK (
    my_role_in(workspace_id) = 'manager'
    AND created_by = auth.uid()
  );

-- ─── workspace_tasks UPDATE ──────────────────────────────────────────
-- Manager: can update all fields of any task in their workspace
-- Member:  can only update status of tasks assigned to them
--   (frontend enforces column restriction; RLS enforces row access)
CREATE POLICY "authorized update tasks"
  ON workspace_tasks FOR UPDATE
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    AND (
      my_role_in(workspace_id) = 'manager'
      OR assigned_to = auth.uid()
    )
  );

-- ─── workspace_tasks DELETE ──────────────────────────────────────────
CREATE POLICY "managers delete tasks"
  ON workspace_tasks FOR DELETE
  USING (my_role_in(workspace_id) = 'manager');

-- ═══════════════════════════════════════════════════════════════════
-- Seed: create a demo workspace + manager account
-- Run AFTER creating your first user via Supabase Auth.
-- Replace 'YOUR_USER_UUID' with the UUID from auth.users.
-- ═══════════════════════════════════════════════════════════════════

-- INSERT INTO workspaces (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'تیم من');
-- INSERT INTO workspace_members (workspace_id, user_id, role, display_name)
--   VALUES ('00000000-0000-0000-0000-000000000001', 'YOUR_USER_UUID', 'manager', 'مدیر');
