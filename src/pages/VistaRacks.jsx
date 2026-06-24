import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { derivarRacks, SECTOR_LABEL } from '../utils/racks'

// ── Breadcrumb de navegación física ───────────────────────────────────────────
function Breadcrumb({ pasos, tema, cfg }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-sm mb-4">
      {pasos.map((p, i) => {
        const ultimo = i === pasos.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            {p.onClick && !ultimo ? (
              <button onClick={p.onClick}
                className="font-semibold"
                style={{ color: cfg.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {p.label}
              </button>
            ) : (
              <span className="font-semibold" style={{ color: ultimo ? tema.textPrimary : tema.textMuted }}>
                {p.label}
              </span>
            )}
            {!ultimo && <span style={{ color: tema.textMuted }}>›</span>}
          </span>
        )
      })}
    </div>
  )
}

// ── Nivel 1: Racks de la colonia ──────────────────────────────────────────────
function NivelRacks({ racks, sector, cfg, tema, onAbrirRack }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base" style={{ color: tema.textPrimary }}>
            Racks ventilados — {SECTOR_LABEL[sector]}
          </h3>
          <p className="text-xs" style={{ color: tema.textMuted }}>
            Seleccioná un rack para ver las jaulas alojadas en él.
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}`, color: cfg.color }}>
          {racks.length} racks
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {racks.map(rack => (
          <button key={rack.id} onClick={() => onAbrirRack(rack.id)}
            className="text-left rounded-2xl overflow-hidden transition-all"
            style={{ background: tema.bgCard, border: `1px solid ${cfg.colorBorde}`, cursor: 'pointer' }}>
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: cfg.colorDim, borderBottom: `1px solid ${tema.bgCardBorde}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: tema.bgCard, border: `1px solid ${cfg.colorBorde}` }}>
                🗄️
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: cfg.color }}>{rack.nombre}</div>
                <div className="text-xs" style={{ color: tema.textMuted }}>Sistema ventilado</div>
              </div>
            </div>
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono font-bold text-2xl" style={{ color: tema.textPrimary }}>{rack.totalJaulas}</div>
                <div className="text-xs" style={{ color: tema.textMuted }}>
                  jaula{rack.totalJaulas !== 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div className="font-mono font-bold text-2xl" style={{ color: cfg.color }}>{rack.totalAnimales}</div>
                <div className="text-xs" style={{ color: tema.textMuted }}>
                  animal{rack.totalAnimales !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Botón de volver ───────────────────────────────────────────────────────────
function BotonVolver({ label, onClick, cfg }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 mb-3"
      style={{
        padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
        fontSize: '13px', fontWeight: 600,
        background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}`, color: cfg.color,
      }}>
      <span style={{ fontSize: '15px', lineHeight: 1 }}>←</span>
      <span>{label}</span>
    </button>
  )
}

// ── Nivel 2: Jaulas dentro de un rack ─────────────────────────────────────────
function NivelJaulas({ rack, sector, cfg, tema, onAbrirJaula, onVolver }) {
  return (
    <div className="space-y-3">
      <BotonVolver label={`Volver a ${SECTOR_LABEL[sector]}`} onClick={onVolver} cfg={cfg} />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-base" style={{ color: tema.textPrimary }}>
          {rack.nombre} · Jaulas
        </h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}`, color: cfg.color }}>
          {rack.totalJaulas} jaula{rack.totalJaulas !== 1 ? 's' : ''} · {rack.totalAnimales} animales
        </span>
      </div>

      {rack.jaulas.length === 0 ? (
        <div className="text-center py-10" style={{ color: tema.textMuted }}>
          Este rack no tiene jaulas asignadas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rack.jaulas.map(jaula => {
            const inactiva = jaula.estado !== 'activo'
            return (
              <button key={jaula.id} onClick={() => onAbrirJaula(jaula.id)}
                className="text-left rounded-2xl overflow-hidden"
                style={{
                  background: tema.bgCard,
                  border: `1px solid ${inactiva ? tema.bgCardBorde : cfg.colorBorde}`,
                  opacity: inactiva ? 0.7 : 1, cursor: 'pointer',
                }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(8,13,26,0.4)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
                  <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{jaula.codigo}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                    {jaula.totalAlojados} animal{jaula.totalAlojados !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>
                    {jaula.tipo}
                  </div>
                  <div className="text-sm font-mono" style={{ color: tema.textSecondary }}>{jaula.subtitulo}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Nivel 3: Animales dentro de una jaula ─────────────────────────────────────
function NivelAnimales({ jaula, rack, cfg, tema, onFichaAnimal, onVolver }) {
  const sexColor = sexo => (sexo === 'macho' ? '#40c4ff' : sexo === 'hembra' ? '#ce93d8' : '#8a9bb0')
  const sexSimbolo = sexo => (sexo === 'macho' ? '♂' : sexo === 'hembra' ? '♀' : '•')

  return (
    <div className="space-y-3">
      <BotonVolver label={`Volver a ${rack.nombre}`} onClick={onVolver} cfg={cfg} />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base" style={{ color: tema.textPrimary }}>
            Jaula {jaula.codigo}
          </h3>
          <p className="text-xs font-mono" style={{ color: tema.textMuted }}>
            {jaula.tipo} · {jaula.subtitulo}
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}`, color: cfg.color }}>
          {jaula.totalAlojados} alojado{jaula.totalAlojados !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
        {jaula.animales.map((animal, i) => {
          const clickable = Boolean(animal.fichaId)
          const col = sexColor(animal.sexo)
          return (
            <div key={animal.key}
              className="px-4 py-3 flex items-center gap-3 flex-wrap"
              style={{
                borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none',
                background: i % 2 === 0 ? 'transparent' : 'rgba(13,21,40,0.3)',
              }}>
              <span style={{ color: col, fontSize: '15px' }}>{sexSimbolo(animal.sexo)}</span>
              {clickable ? (
                <button onClick={() => onFichaAnimal(animal.fichaId)}
                  className="font-mono text-sm font-semibold"
                  style={{ color: tema.textPrimary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationColor: `${cfg.color}66` }}>
                  {animal.nombre}
                </button>
              ) : (
                <span className="font-mono text-sm" style={{ color: tema.textMuted }}>{animal.nombre}</span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${col}14`, border: `1px solid ${col}30`, color: col }}>
                {animal.rol}
              </span>
              {clickable && (
                <button onClick={() => onFichaAnimal(animal.fichaId)}
                  className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}35`, color: cfg.color, cursor: 'pointer' }}>
                  Ver ficha →
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VistaRacks({ sector, datos, cfg, tema, onFichaAnimal }) {
  const racks = useMemo(() => derivarRacks(sector, datos), [sector, datos])
  const [rackId, setRackId] = useState(null)
  const [jaulaId, setJaulaId] = useState(null)

  const rack  = racks.find(r => r.id === rackId) ?? null
  const jaula = rack?.jaulas.find(j => j.id === jaulaId) ?? null

  const pasos = [
    { label: SECTOR_LABEL[sector], onClick: () => { setRackId(null); setJaulaId(null) } },
  ]
  if (rack)  pasos.push({ label: rack.nombre, onClick: () => setJaulaId(null) })
  if (jaula) pasos.push({ label: `Jaula ${jaula.codigo}` })

  return (
    <div className="p-4 md:p-6">
      {(rack || jaula) && <Breadcrumb pasos={pasos} tema={tema} cfg={cfg} />}

      {!rack && (
        <NivelRacks racks={racks} sector={sector} cfg={cfg} tema={tema} onAbrirRack={setRackId} />
      )}
      {rack && !jaula && (
        <NivelJaulas rack={rack} sector={sector} cfg={cfg} tema={tema}
          onAbrirJaula={setJaulaId} onVolver={() => setRackId(null)} />
      )}
      {jaula && (
        <NivelAnimales jaula={jaula} rack={rack} cfg={cfg} tema={tema}
          onFichaAnimal={onFichaAnimal} onVolver={() => setJaulaId(null)} />
      )}
    </div>
  )
}
