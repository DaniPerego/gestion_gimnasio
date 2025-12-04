import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-950 transition-colors overflow-hidden">
      {/* Botón de tema flotante */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Efectos de fondo (simplificados del original para mantener el toque moderno pero menos intrusivo) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
        <div className="h-[300px] w-[480px] rounded-full bg-blue-500/20 blur-[100px] dark:bg-blue-600/20" />
      </div>

      <div className="z-10 flex flex-col items-center text-center gap-8 max-w-3xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Administración de Gimnasios
          </h1>
          <p className="text-lg leading-8 text-gray-600 dark:text-gray-300">
            Sistema integral White-Label para el control de socios, asistencias, pagos y reportes financieros.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:scale-105"
          >
            Ingresar al Sistema
          </Link>
          
          <Link
            href="/kiosco"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:underline underline-offset-4"
          >
            Ir al Kiosco de Acceso <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} GMS White-Label. Todos los derechos reservados.</p>
      </div>
    </main>
  );
}
