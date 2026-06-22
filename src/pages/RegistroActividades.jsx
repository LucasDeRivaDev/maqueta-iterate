import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'

// ── Colores por categoría de actividad ───────────────────────────────────────
const TAG_CONFIG = {
  nacimiento:    { label: 'Nacimiento',    color: '#ce93d8' },
  destete:       { label: 'Destete',       color: '#ffb300' },
  transferencia: { label: 'Transferencia', color: '#40c4ff' },
  seleccion:     { label: 'Selección',     color: '#00e676' },
  jaula:         { label: 'Nueva jaula',   color: '#00e676' },
  ingreso:       { label: 'Ingreso',       color: '#00e676' },
  salida:        { label: 'Salida',        color: '#ff6b80' },
  baja:          { label: 'Baja',          color: '#ff3d57' },
  manual:        { label: 'Actividad',     color: '#8a9bb0' },
}

function fmt(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('T')[0].split('-')
  return `${day}/${m}/${y}`
}

function horaActual() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
function fechaHoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const inp = {
  background: 'rgba(8,13,26,0.8)',
  border: '1px solid rgba(30,51,82,0.9)',
  color: '#c9d4e0',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function RegistroActividades({
  actividadesManuales = [],
  actividadesAuto     = [],
  accentColor         = '#ffb300',
  coloniaLabel        = 'Colonia',
  onRegistrar,
}) {
  const { tema } = useTheme()
  const [showForm, setShowForm]   = useState(false)
  const [desc,     setDesc]       = useState('')
  const [fecha,    setFecha]      = useState(fechaHoy)
  const [hora,     setHora]       = useState(horaActual)
  const [usuario,  setUsuario]    = useState('')
  const [guardado, setGuardado]   = useState(false)

  // Merge y ordenar por fecha desc, luego hora desc
  const todas = useMemo(() => {
    const combined = [...actividadesAuto, ...actividadesManuales]
    return combined.sort((a, b) => {
      const fa = `${a.fecha}T${a.hora !== '--' ? a.hora : '00:00'}`
      const fb = `${b.fecha}T${b.hora !== '--' ? b.hora : '00:00'}`
      return fb.localeCompare(fa)
    })
  }, [actividadesManuales, actividadesAuto])

  function handleGuardar() {
    if (!desc.trim()) return
    onRegistrar?.({
      id: `ACT-${Date.now()}`,
      fecha,
      hora,
      usuario: usuario.trim() || 'Usuario',
      descripcion: desc.trim(),
      tipo: 'manual',
      tag:  'manual',
    })
    setDesc('')
    setGuardado(true)
    setTimeout(() => { setGuardado(false); setShowForm(false) }, 1400)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold" style={{ color: tema.textPrimary }}>Registro de Actividades</h3>
          <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>
            {coloniaLabel} · {todas.length} entrada{todas.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{
            background: showForm ? `${accentColor}22` : `${accentColor}14`,
            border: `1.5px solid ${accentColor}50`,
            color: accentColor,
            cursor: 'pointer',
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Registrar actividad'}
        </button>
      </div>

      {/* Leyenda de tipos (solo si hay auto-activities) */}
      {actividadesAuto.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs" style={{ color: tema.textMuted }}>Leyenda:</span>
          {Object.entries(TAG_CONFIG).filter(([k]) => k !== 'manual').map(([k, v]) => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${v.color}12`, border: `1px solid ${v.color}35`, color: v.color }}>
              {v.label}
            </span>
          ))}
        </div>
      )}

      {/* Formulario de nueva actividad */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: `${accentColor}05`, border: `1.5px solid ${accentColor}28` }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            Nueva actividad — {coloniaLabel}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Hora</label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)} style={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Responsable</label>
              <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Nombre del responsable" style={inp} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Descripción *</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Describir la actividad, procedimiento, novedad u observación registrada en esta colonia…"
              style={{ ...inp, resize: 'vertical' }}
            />
          </div>

          <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#4a5f7a' }}>
            Ejemplos: cambio de cama, revisión general, reparación de luminaria, transferencia de animales, procedimiento experimental, observación sanitaria…
          </div>

          <button
            onClick={handleGuardar}
            disabled={!desc.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-bold"
            style={{
              background:  desc.trim() ? `${accentColor}18` : `${accentColor}08`,
              border: `1.5px solid ${desc.trim() ? accentColor + '50' : accentColor + '20'}`,
              color:       desc.trim() ? accentColor : '#4a5f7a',
              cursor:      desc.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {guardado ? '✓ Actividad registrada' : 'Guardar actividad'}
          </button>
        </div>
      )}

      {/* Línea de tiempo */}
      {todas.length === 0 ? (
        <div className="text-center py-16" style={{ color: tema.textMuted }}>
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm font-medium" style={{ color: tema.textSecondary }}>Sin actividades registradas</div>
          <div className="text-xs mt-1">Las actividades del sistema aparecerán aquí automáticamente.<br/>También podés agregar entradas manualmente con el botón de arriba.</div>
        </div>
      ) : (
        <div className="space-y-0">
          {todas.map((act, i) => {
            const tagCfg  = TAG_CONFIG[act.tag] ?? TAG_CONFIG.manual
            const esAuto  = act.tipo === 'automatico'
            const dotColor = esAuto ? (TAG_CONFIG[act.tag]?.color ?? '#4a5f7a') : accentColor

            return (
              <div key={act.id} className="flex gap-3">
                {/* Eje vertical */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full mt-4"
                    style={{
                      background:  dotColor,
                      boxShadow:   esAuto ? 'none' : `0 0 6px ${dotColor}60`,
                    }}
                  />
                  {i < todas.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ background: tema.bgCardBorde }} />
                  )}
                </div>

                {/* Tarjeta */}
                <div className="flex-1 min-w-0 pb-3">
                  <div
                    className="rounded-xl p-3.5"
                    style={{
                      background: esAuto ? 'rgba(10,16,32,0.6)' : tema.bgCard,
                      border:     `1px solid ${esAuto ? 'rgba(30,51,82,0.4)' : tema.bgCardBorde}`,
                    }}
                  >
                    {/* Meta-row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${tagCfg.color}14`,
                          border:     `1px solid ${tagCfg.color}38`,
                          color:       tagCfg.color,
                        }}
                      >
                        {esAuto ? '⚡ ' : ''}{tagCfg.label}
                      </span>

                      <span className="font-mono text-xs" style={{ color: tema.textMuted }}>
                        {fmt(act.fecha)}
                      </span>

                      {act.hora !== '--' && (
                        <span className="font-mono text-xs" style={{ color: tema.textMuted }}>
                          {act.hora}
                        </span>
                      )}

                      <span style={{ color: tema.bgCardBorde }}>·</span>

                      <span className="text-xs" style={{ color: esAuto ? '#3a4f6a' : tema.textMuted }}>
                        {act.usuario}
                      </span>
                    </div>

                    {/* Descripción */}
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: esAuto ? '#4a5f7a' : tema.textSecondary }}
                    >
                      {act.descripcion}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
