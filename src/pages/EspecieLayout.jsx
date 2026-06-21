import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { ESPECIES_CONFIG } from '../context/ICIVETContext'
import Fundacion from './Fundacion'
import Produccion from './Produccion'
import StockPage from './StockPage'
import ConejoPage from './ConejoPage'
import logoNavDark  from '../assets/logoiterate.png'
import logoNavLight from '../assets/logoiteratefondoclaro.png'

const TABS = [
  { id: 'fundacion', label: 'Fundación', activo: true },
  { id: 'produccion', label: 'Producción', activo: true },
  { id: 'stock', label: 'Stock', activo: true },
]

export default function EspecieLayout() {
  const { especieId } = useParams()
  const navigate = useNavigate()
  const { tema, modoBrillo } = useTheme()
  const cfg = ESPECIES_CONFIG[especieId]

  if (!cfg) return <Navigate to="/" replace />

  if (especieId === 'conejos') {
    return <ConejoPage />
  }

  const tabActual = window.location.pathname.includes('/produccion')
    ? 'produccion'
    : window.location.pathname.includes('/stock')
    ? 'stock'
    : 'fundacion'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: tema.bgMain }}>
      {/* Topbar */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 shrink-0"
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
          <span className="text-xs font-mono hidden sm:inline" style={{ color: tema.textMuted }}>
            {cfg.nombreCientifico}
          </span>
        </div>

        <div className="ml-auto hidden md:block" style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <img
            src={modoBrillo ? logoNavLight : logoNavDark}
            alt="ITeRatE"
            style={{ height: '36px', width: 'auto', mixBlendMode: modoBrillo ? 'multiply' : 'screen' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 px-4 pt-4 pb-0"
        style={{ borderBottom: `1px solid ${tema.bgCardBorde}`, background: tema.bgMain }}
      >
        {TABS.map((tab) => {
          const activo = tabActual === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(`/especie/${especieId}/${tab.id}`)}
              className="px-5 py-2.5 text-sm font-semibold relative"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activo ? `2px solid ${cfg.color}` : '2px solid transparent',
                color: activo ? cfg.color : tema.textMuted,
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
              {!tab.activo && (
                <span
                  className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,179,0,0.1)', color: '#ffb300', fontSize: '9px' }}
                >
                  próximamente
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      <div className="flex-1">
        <Routes>
          <Route path="fundacion" element={<Fundacion especieId={especieId} />} />
          <Route path="produccion" element={<Produccion especieId={especieId} cfg={cfg} />} />
          <Route path="stock" element={<StockPage especieId={especieId} cfg={cfg} />} />
          <Route path="*" element={<Navigate to="fundacion" replace />} />
        </Routes>
      </div>
    </div>
  )
}
