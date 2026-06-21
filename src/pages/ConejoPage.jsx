import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { ESPECIES_CONFIG } from '../context/ICIVETContext'
import logoNavDark  from '../assets/logoiterate.png'
import logoNavLight from '../assets/logoiteratefondoclaro.png'

export default function ConejoPage() {
  const navigate = useNavigate()
  const { tema, modoBrillo } = useTheme()
  const cfg = ESPECIES_CONFIG.conejos

  return (
    <div className="min-h-screen flex flex-col" style={{ background: tema.bgMain }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{ background: tema.bgTopbar, borderBottom: `1px solid ${tema.bgSidebarBorde}` }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600,
            background: tema.accentDim, border: `1px solid ${tema.accentBorde}`,
            color: tema.accent,
          }}
        >
          ← Inicio
        </button>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}` }}
        >
          <span>{cfg.icono}</span>
          <span className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.nombre}</span>
        </div>
        <div className="ml-auto hidden md:block" style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <img
            src={modoBrillo ? logoNavLight : logoNavDark}
            alt="ITeRatE"
            style={{ height: '36px', width: 'auto', mixBlendMode: modoBrillo ? 'multiply' : 'screen' }}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="rounded-2xl px-8 py-12 text-center max-w-md w-full"
          style={{ background: tema.bgCard, border: `1px solid ${cfg.colorBorde}` }}
        >
          <div className="text-5xl mb-5">🐇</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: tema.textPrimary }}>
            Conejos Nueva Zelanda
          </h2>
          <p className="text-sm font-mono italic mb-5" style={{ color: tema.textMuted }}>
            Oryctolagus cuniculus
          </p>
          <div
            className="rounded-xl px-5 py-4 text-sm leading-relaxed text-left"
            style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.25)', color: tema.textSecondary }}
          >
            <div className="font-semibold mb-1 text-amber-400" style={{ color: '#ffb300' }}>
              🔬 Pendiente de modelado
            </div>
            Se implementará una vez relevado el procedimiento específico para conejos.
          </div>
          <p className="text-xs mt-5" style={{ color: tema.textMuted }}>
            La estructura de Fundación, Producción y Stock será definida luego del relevamiento del flujo real de trabajo.
          </p>
        </div>
      </div>
    </div>
  )
}
