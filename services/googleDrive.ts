import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackupData } from '@/types';

const GOOGLE_ACCESS_TOKEN_KEY = '@kishan_google_access_token';
const GOOGLE_USER_EMAIL_KEY = '@kishan_google_email';

const BACKUP_FILENAME = 'kishan-ledger-backup.json';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export async function saveGoogleSession(accessToken: string, email: string): Promise<void> {
  await AsyncStorage.multiSet([
    [GOOGLE_ACCESS_TOKEN_KEY, accessToken],
    [GOOGLE_USER_EMAIL_KEY, email],
  ]);
}

export async function getGoogleSession(): Promise<{ accessToken: string; email: string } | null> {
  const values = await AsyncStorage.multiGet([GOOGLE_ACCESS_TOKEN_KEY, GOOGLE_USER_EMAIL_KEY]);
  const accessToken = values[0][1];
  const email = values[1][1];
  if (accessToken && email) {
    return { accessToken, email };
  }
  return null;
}

export async function clearGoogleSession(): Promise<void> {
  await AsyncStorage.multiRemove([GOOGLE_ACCESS_TOKEN_KEY, GOOGLE_USER_EMAIL_KEY]);
}

export async function getUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Failed to get Google user info');
  }
  const info = await response.json();
  return (info.email as string) || '';
}

async function findBackupFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${BACKUP_FILENAME}'`);
  const response = await fetch(
    `${DRIVE_API_BASE}/files?spaces=appDataFolder&q=${query}&fields=files(id,modifiedTime)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Failed to search Drive files');
  }
  const result = await response.json();
  return (result.files?.[0]?.id as string) ?? null;
}

export async function backupToDrive(accessToken: string, data: BackupData): Promise<void> {
  const json = JSON.stringify(data);
  const existingFileId = await findBackupFile(accessToken);

  if (existingFileId) {
    const response = await fetch(
      `${DRIVE_UPLOAD_API}/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: json,
      }
    );
    if (!response.ok) {
      if (response.status === 401) throw new Error('UNAUTHORIZED');
      throw new Error('Failed to update Drive backup');
    }
  } else {
    const boundary = `kishan_backup_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const metadata = JSON.stringify({
      name: BACKUP_FILENAME,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    });
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      json,
      `--${boundary}--`,
    ].join('\r\n');

    const response = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!response.ok) {
      if (response.status === 401) throw new Error('UNAUTHORIZED');
      throw new Error('Failed to create Drive backup');
    }
  }
}

export async function restoreFromDrive(accessToken: string): Promise<BackupData | null> {
  const fileId = await findBackupFile(accessToken);
  if (!fileId) return null;

  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Failed to download backup from Drive');
  }
  const data = await response.json();
  if (
    !data ||
    !Array.isArray(data.farmers) ||
    !Array.isArray(data.workEntries) ||
    !Array.isArray(data.payments) ||
    !Array.isArray(data.invoices)
  ) {
    throw new Error('INVALID_BACKUP');
  }
  return data as BackupData;
}
