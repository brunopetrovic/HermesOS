-- Performance indexes for hot read paths
-- (Task list, Calendar list, Goal list, AgentRuns filter, SyncLog entityType)

CREATE INDEX IF NOT EXISTS "Task_instanceId_idx" ON "Task"("instanceId");
CREATE INDEX IF NOT EXISTS "Task_updatedAt_idx" ON "Task"("updatedAt");
CREATE INDEX IF NOT EXISTS "Task_goalId_idx" ON "Task"("goalId");
CREATE INDEX IF NOT EXISTS "CalendarEvent_startDate_idx" ON "CalendarEvent"("startDate");
CREATE INDEX IF NOT EXISTS "Goal_status_idx" ON "Goal"("status");
CREATE INDEX IF NOT EXISTS "SyncLog_entityType_idx" ON "SyncLog"("entityType");
CREATE INDEX IF NOT EXISTS "AgentRun_agentType_status_createdAt_idx" ON "AgentRun"("agentType", "status", "createdAt");
