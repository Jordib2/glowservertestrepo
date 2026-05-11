import { API_URL } from "./api";
import type { School } from "../types/School";

export type { School } from "../types/School";

export async function getSchools(): Promise<School[]> {
  const res = await fetch(`${API_URL}/api/schools`);
  if (!res.ok) {
    throw new Error("Unable to load schools");
  }

  const data = await res.json();
  return data.schools || [];
}
