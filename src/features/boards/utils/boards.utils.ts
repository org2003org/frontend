export function avatarColor(name: string): string {
  const palette = ['#7C4DFF', '#E91E63', '#009688', '#FF5722', '#3F51B5', '#0288D1', '#F57C00'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1d';
  return `${diff}d`;
}

/** Safely extract the assignee name whether it's an object or a plain ID string. */
export function resolveAssigneeName(
  assignee: { _id: string; name: string; email: string } | string | null | undefined,
): string | null {
  if (assignee && typeof assignee === 'object' && assignee.name) return assignee.name;
  return null;
}
