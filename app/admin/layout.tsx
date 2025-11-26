import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Panel de Administración - COBRA",
  description: "Gestiona el contenido del menú de tu restaurante",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
