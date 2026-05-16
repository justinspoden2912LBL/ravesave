// Notfall-Informationen — lokal im Browser, niemals an Server gesendet.
import { z } from "zod";

export const emergencyInfoSchema = z.object({
  contactName: z.string().trim().max(80).optional().default(""),
  contactPhone: z.string().trim().max(40).regex(/^[+\d\s()/-]*$/, "Nur Ziffern und + ( ) - /").optional().default(""),
  contactRelation: z.string().trim().max(40).optional().default(""),
  bloodType: z.string().trim().max(8).optional().default(""),
  allergies: z.string().trim().max(500).optional().default(""),
  conditions: z.string().trim().max(500).optional().default(""),
  medications: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
});

export type EmergencyInfo = z.infer<typeof emergencyInfoSchema>;

const KEY = "trace.emergencyInfo.v1";

export function emptyEmergencyInfo(): EmergencyInfo {
  return {
    contactName: "",
    contactPhone: "",
    contactRelation: "",
    bloodType: "",
    allergies: "",
    conditions: "",
    medications: "",
    notes: "",
  };
}

export function loadEmergencyInfo(): EmergencyInfo {
  if (typeof window === "undefined") return emptyEmergencyInfo();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyEmergencyInfo();
    const parsed = emergencyInfoSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyEmergencyInfo();
  } catch {
    return emptyEmergencyInfo();
  }
}

export function saveEmergencyInfo(info: EmergencyInfo) {
  localStorage.setItem(KEY, JSON.stringify(info));
}

export function clearEmergencyInfo() {
  localStorage.removeItem(KEY);
}

export function hasAnyEmergencyInfo(info: EmergencyInfo): boolean {
  return Object.values(info).some((v) => (v ?? "").trim().length > 0);
}
