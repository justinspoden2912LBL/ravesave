/**
 * Export / Import aller lokalen App-Daten als JSON.
 * Bewusst breit: jeder localStorage-Key, der mit unserem Prefix beginnt.
 */

const PREFIXES = ["trace.", "trace_", "ravesave.", "ravesave_"];

export interface BackupBundle {
  app: "ravesave";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

export function buildBackup(): BackupBundle {
  const data: Record<string, string> = {};
  if (typeof window === "undefined") return { app: "ravesave", version: 1, exportedAt: new Date().toISOString(), data };
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (PREFIXES.some((p) => k.startsWith(p))) {
      data[k] = localStorage.getItem(k) ?? "";
    }
  }
  return { app: "ravesave", version: 1, exportedAt: new Date().toISOString(), data };
}

export function downloadBackup() {
  const bundle = buildBackup();
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ravesave-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type ImportMode = "merge" | "replace";

export function applyBackup(bundle: BackupBundle, mode: ImportMode = "merge"): { imported: number } {
  if (typeof window === "undefined") return { imported: 0 };
  if (bundle.app !== "ravesave") throw new Error("Datei stammt nicht aus Ravesave.");
  if (mode === "replace") {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && PREFIXES.some((p) => k.startsWith(p))) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }
  let imported = 0;
  for (const [k, v] of Object.entries(bundle.data)) {
    localStorage.setItem(k, v);
    imported++;
  }
  return { imported };
}

export async function readBackupFile(file: File): Promise<BackupBundle> {
  const text = await file.text();
  const parsed = JSON.parse(text) as BackupBundle;
  if (!parsed || parsed.app !== "ravesave" || typeof parsed.data !== "object") {
    throw new Error("Ungültiges Backup-Format.");
  }
  return parsed;
}
