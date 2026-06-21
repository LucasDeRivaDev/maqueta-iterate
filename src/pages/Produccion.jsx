import { useTheme } from '../context/ThemeContext'

export default function Produccion({ cfg }) {
  const { tema } = useTheme()

  return (
    <div className="p-6 flex items-center justify-center min-h-64">
      <div
        className="rounded-2xl px-8 py-10 text-center max-w-md w-full"
        style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}
      >
        <div className="text-4xl mb-4">🏗️</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: tema.textPrimary }}>
          Producción
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: tema.textSecondary }}>
          Pendiente de relevamiento del flujo de Producción.
        </p>
        <div
          className="mt-6 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.2)', color: '#ffb300' }}
        >
          Esta sección se implementará una vez documentado el flujo real de trabajo.
        </div>
      </div>
    </div>
  )
}
