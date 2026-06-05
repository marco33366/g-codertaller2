import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { DashboardScreen } from "@/features/dashboard/components/DashboardScreen"

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["gerente"]}>
      <DashboardScreen />
    </ProtectedRoute>
  )
}
