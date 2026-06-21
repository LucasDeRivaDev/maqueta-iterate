import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useConejo, ESTADOS_ANIMAL } from '../../context/ConejoContext'
import FichaAnimalModal from './FichaAnimalModal'

const ACCENT = '#ffb300'

function calcEdad(f) {
  if (!f) return '—'
  const hoy = new Date(); const nac = new Date(f + 'T00:00:00')
  const m = (hoy.getFullYear() - nac.getFullYear()) * 12 + hoy.getMonth() - nac.getMonth()
  if (m < 1) return `${Math.floor((hoy - nac) / 86400000)}d`
  if (m < 12) return `${m}m`
  return `${Math.floor(m / 12)}a ${m % 12 > 0 ? m % 12 + 'm' : ''}`
}
function fmt(d) {
  if (!d) return '—'
  const [y, mo, day] = d.split('-'); return `${day}/${mo}/${y}`
}

function Badge({ children, color, bg, borde, small }) {
  return (
    <span className={`font-bold rounded-full ${small ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}`}
      style={{ background: bg ?? `${color}18`, border: `1px solid ${borde ?? color + '50'}`, color, display: 'inline-block' }}>
      {children}
    </span>
  )
}

function KPI({ valor, label, color, sub }) {
  const { tema } = useTheme()
  return (
    <div className="rounded-xl px-4 py-3 text-center" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
      <div className="font-mono font-bold text-2xl" style={{ color }}>{valor}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: tema.textMuted }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: tema.textMuted, opacity: 0.6 }}>{sub}</div>}
    </div>
  )
}

export default function ColoniaTab() {
  const { tema } = useTheme()
  const { datos } = useConejo()
  const { animales } = datos

  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroSexo,   setFiltroSexo]   = useState('todos')
  const [busqueda,     setBusqueda]     = useState('')
  const [fichaId,      setFichaId]      = useState(null)

  const filtrados = animales.filter(a => {
    if (filtroEstado !== 'todos' && a.estado !== filtroEstado) return false
    if (filtroSexo   !== 'todos' && a.sexo   !== filtroSexo)   return false
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      if (!a.id.toLowerCase().includes(q) && !a.origen.toLowerCase().includes(q) && !a.cepa.toLowerCase().includes(q)) return false
    }
    return true
  })

  const counts = Object.fromEntries(Object.keys(ESTADOS_ANIMAL).map(k => [k, animales.filter(a => a.estado === k).length]))

  const inputStyle = {
    background: tema.bgInput, border: `1px solid ${tema.bgInputBorde}`,
    color: tema.textPrimary, borderRadius: '10px', padding: '7px 12px',
    fontSize: '13px', outline: 'none',
  }

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
        <KPI valor={animales.length} label="Total" color={ACCENT} />
        {Object.entries(ESTADOS_ANIMAL).map(([k, v]) => (
          <KPI key={k} valor={counts[k] ?? 0} label={v.label} color={v.color} />
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar ID, origen, cepa..."
          style={{ ...inputStyle, minWidth: '200px', flex: 1 }} />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="todos">Todos los estados</option>
          {Object.entries(ESTADOS_ANIMAL).map(([k, v]) => (
            <option key={k} value={k}>{v.label} ({counts[k] ?? 0})</option>
          ))}
        </select>
        <select value={filtroSexo} onChange={e => setFiltroSexo(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="todos">Ambos sexos</option>
          <option value="macho">Machos ({animales.filter(a => a.sexo === 'macho').length})</option>
          <option value="hembra">Hembras ({animales.filter(a => a.sexo === 'hembra').length})</option>
        </select>
        <div className="text-xs font-mono" style={{ color: tema.textMuted }}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
        {/* Header */}
        <div className="grid text-xs font-bold uppercase tracking-widest px-4 py-2.5"
          style={{ gridTemplateColumns: '1fr 80px 80px 100px 1fr 130px 90px', background: `${ACCENT}06`, borderBottom: `1px solid ${ACCENT}20`, color: tema.textMuted }}>
          <div>Identificador</div><div>Sexo</div><div>Edad</div><div>Nacimiento</div><div>Origen</div><div>Estado</div><div>Sanitario</div>
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: tema.textMuted }}>Sin animales que coincidan con los filtros.</div>
        )}

        {filtrados.map((a, i) => {
          const est = ESTADOS_ANIMAL[a.estado]
          return (
            <div key={a.id}
              className="grid items-center px-4 py-3 cursor-pointer transition-all"
              style={{
                gridTemplateColumns: '1fr 80px 80px 100px 1fr 130px 90px',
                borderBottom: i < filtrados.length - 1 ? `1px solid ${tema.bgCardBorde}` : 'none',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${ACCENT}06` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              onClick={() => setFichaId(a.id)}>
              <div>
                <div className="font-mono font-bold text-sm" style={{ color: ACCENT }}>{a.id}</div>
                <div className="text-xs" style={{ color: tema.textMuted }}>{a.cepa}</div>
              </div>
              <div className="text-sm" style={{ color: tema.textSecondary }}>
                {a.sexo === 'macho' ? <span style={{ color: '#40c4ff' }}>♂ M</span> : <span style={{ color: '#ce93d8' }}>♀ H</span>}
              </div>
              <div className="text-sm font-mono" style={{ color: tema.textSecondary }}>{calcEdad(a.fechaNacimiento)}</div>
              <div className="text-xs font-mono" style={{ color: tema.textMuted }}>{fmt(a.fechaNacimiento)}</div>
              <div className="text-xs truncate pr-2" style={{ color: tema.textSecondary }} title={a.origen}>{a.origen}</div>
              <div><Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge></div>
              <div>
                <span className="text-xs font-semibold" style={{ color: a.estadoSanitario === 'ok' ? '#00e676' : a.estadoSanitario === 'pendiente' ? ACCENT : '#ff6b80' }}>
                  {a.estadoSanitario === 'ok' ? '✓ OK' : a.estadoSanitario === 'pendiente' ? '⏳' : '⚠'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-xs text-center" style={{ color: tema.textMuted }}>
        Clic sobre una fila para ver la ficha completa del animal
      </div>

      {fichaId && <FichaAnimalModal animalId={fichaId} onClose={() => setFichaId(null)} />}
    </div>
  )
}
