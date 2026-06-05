import { GCODER_API_BASE_URL } from "@/lib/env"

export type DashboardSummary = {
  total_file_uploads: number
  total_successful_conversions: number
  total_failed_analysis: number
  total_exports: number
  active_users: number
  inactive_users: number
  last_activity_at: string | null
  most_used_extension: string | null
  top_operator: string | null
}

async function readError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null)
  return typeof body?.detail === "string" ? body.detail : fallback
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummary> {
  const response = await fetch(`${GCODER_API_BASE_URL}/api/dashboard/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    throw new Error("Tu sesion expiro. Inicia sesion nuevamente.")
  }

  if (response.status === 403) {
    throw new Error("No tienes permisos para ver el panel gerencial.")
  }

  if (!response.ok) {
    throw new Error(await readError(response, "No se pudo cargar el panel gerencial."))
  }

  return response.json()
}
