"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  FileUp,
  LogOut,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/context/AuthContext"
import { fetchDashboardSummary, type DashboardSummary } from "@/features/dashboard/api/dashboardClient"

function roleLabel(role: string | null) {
  if (role === "gerente") return "Gerente"
  if (role === "jefe_operarios") return "Jefe de operarios"
  if (role === "operario") return "Operario"
  return role ?? "-"
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value)
}

function formatDate(value: string | null) {
  if (!value) return "Sin actividad"
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return value
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate)
}

type IndicatorCard = {
  label: string
  value: string
  icon: LucideIcon
  tone: string
}

function buildCards(summary: DashboardSummary): IndicatorCard[] {
  return [
    {
      label: "Archivos cargados",
      value: formatNumber(summary.total_file_uploads),
      icon: FileUp,
      tone: "text-sky-300",
    },
    {
      label: "Conversiones exitosas",
      value: formatNumber(summary.total_successful_conversions),
      icon: CheckCircle2,
      tone: "text-emerald-300",
    },
    {
      label: "Errores de analisis",
      value: formatNumber(summary.total_failed_analysis),
      icon: AlertTriangle,
      tone: "text-amber-300",
    },
    {
      label: "Exportaciones",
      value: formatNumber(summary.total_exports),
      icon: Download,
      tone: "text-cyan-300",
    },
    {
      label: "Usuarios activos",
      value: formatNumber(summary.active_users),
      icon: UserCheck,
      tone: "text-lime-300",
    },
    {
      label: "Usuarios inactivos",
      value: formatNumber(summary.inactive_users),
      icon: UserX,
      tone: "text-red-300",
    },
    {
      label: "Ultima actividad",
      value: formatDate(summary.last_activity_at),
      icon: Clock3,
      tone: "text-violet-200",
    },
    {
      label: "Formato mas usado",
      value: summary.most_used_extension ? `.${summary.most_used_extension}` : "Sin datos",
      icon: FileText,
      tone: "text-indigo-200",
    },
    {
      label: "Operario mas activo",
      value: summary.top_operator ?? "Sin datos",
      icon: UserRound,
      tone: "text-fuchsia-200",
    },
  ]
}

export function DashboardScreen() {
  const { logout, role, token, username } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadSummary() {
      if (!token) return
      setIsLoading(true)
      setError(null)
      try {
        const result = await fetchDashboardSummary(token)
        if (!isMounted) return
        setSummary(result)
      } catch (loadError) {
        if (!isMounted) return
        const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el panel gerencial."
        setError(message)
        if (message.includes("sesion")) void logout(message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadSummary()

    return () => {
      isMounted = false
    }
  }, [logout, token])

  const cards = useMemo(() => (summary ? buildCards(summary) : []), [summary])

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Panel Gerencial</h1>
              <p className="text-sm text-muted-foreground">Operacion, usuarios y trazabilidad</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
              <UserRound className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{username}</span>
              <span className="text-muted-foreground">{roleLabel(role)}</span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Conversor
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/logs">
                <FileText className="h-4 w-4" />
                Auditoria
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 9 }).map((_, index) => (
                <article
                  className="min-h-32 rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm"
                  key={index}
                >
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="mt-6 h-8 w-24 rounded bg-muted" />
                </article>
              ))
            : cards.map((card) => {
                const Icon = card.icon
                return (
                  <article
                    className="flex min-h-32 flex-col justify-between rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm"
                    key={card.label}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                      <Icon className={`h-5 w-5 shrink-0 ${card.tone}`} />
                    </div>
                    <p className="mt-5 break-words text-3xl font-semibold text-foreground sm:text-2xl lg:text-3xl">
                      {card.value}
                    </p>
                  </article>
                )
              })}
        </section>
      </div>
    </main>
  )
}
