/**
 * CSV export utilities for Raghava v1.0 CEO OS
 */

import { Contact, Task, VaultItem, PasswordItem } from './seed';

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
  const escape = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    // Mitigate CSV formula injection in spreadsheet apps
    if (/^[=+\-@\t\s]/.test(str)) {
      str = "'" + str;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escape).join(',');
  const rows = data.map(row => 
    headers.map(header => escape(row[header])).join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export contacts to CSV
 */
export function exportContactsCSV(contacts: Contact[]) {
  const headers = ['id', 'name', 'email', 'role', 'department', 'org', 'phone', 'tags', 'ftuId', 'notes', 'createdAt'];
  const data = contacts.map(c => ({
    ...c,
    tags: c.tags.join('; ')
  }));
  
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `raghava-contacts-${timestamp}.csv`);
}

/**
 * Export tasks to CSV
 */
export function exportTasksCSV(tasks: Task[]) {
  const headers = ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'assigneeUserId', 'createdByUserId', 'ftuId', 'commentsCount', 'createdAt', 'updatedAt'];
  const data = tasks.map(t => ({
    ...t,
    commentsCount: t.comments.length,
    comments: undefined
  }));
  
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `raghava-tasks-${timestamp}.csv`);
}

/**
 * Export vault metadata to CSV (no sensitive content)
 */
export function exportVaultMetadataCSV(items: VaultItem[]) {
  const headers = ['id', 'title', 'type', 'tags', 'ftuId', 'sensitivity', 'createdAt'];
  const data = items.map(v => ({
    id: v.id,
    title: v.title,
    type: v.type,
    tags: v.tags.join('; '),
    ftuId: v.ftuId || '',
    sensitivity: v.sensitivity,
    createdAt: v.createdAt
  }));
  
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `raghava-vault-metadata-${timestamp}.csv`);
}

/**
 * Export password metadata to CSV (no passwords)
 */
export function exportPasswordMetadataCSV(items: PasswordItem[]) {
  const headers = ['id', 'title', 'username', 'url', 'tags', 'ftuId', 'createdAt'];
  const data = items.map(p => ({
    id: p.id,
    title: p.title,
    username: p.username || '',
    url: p.url || '',
    tags: p.tags.join('; '),
    ftuId: p.ftuId || '',
    createdAt: p.createdAt
  }));
  
  const csv = arrayToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `raghava-passwords-metadata-${timestamp}.csv`);
}

/**
 * Export CEO dashboard snapshot with Focus Spotlight
 */
export function exportCEODashboardCSV(spotlightData: {
  date: string;
  focusCode: string;
  focusTitle: string;
  topicCode: string;
  topicTitle: string;
  score: number;
  deltaWoW: number;
}) {
  const headers = ['date', 'focusCode', 'focusTitle', 'topicCode', 'topicTitle', 'score', 'deltaWoW'];
  const csv = arrayToCSV([spotlightData], headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `raghava-ceo-snapshot-${timestamp}.csv`);
}
