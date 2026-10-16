export function backupDue(lastFinishedAt, now = new Date()) {
  const last = Date.parse(lastFinishedAt);
  if (!Number.isFinite(last) || last > now.getTime() + 60000) return true;
  const boundary = new Date(now);
  boundary.setHours(3, 0, 0, 0);
  if (boundary > now) boundary.setDate(boundary.getDate() - 1);
  return last < boundary.getTime();
}
