import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useConejo, TIPOS_EVENTO } from '../../context/ConejoContext'
import FichaAnimalModal from './FichaAnimalModal'

const ACCENT = '#ffb300'

function fmt(d) {
  if (!d) return '—'
  const [y, mo, day] = d.split('T')[0].split('-'); return `${day}/${mo}/${y}`
}

function Campo({ label, children }) {
  const { tema } = useTheme()
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', as }) {
  const { tema } = useTheme()
  const style = { background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%' }
  if (as === 'select') return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...style, cursor: 'pointer' }}>
      {children}
    </select>
  )
  if (as === 'textarea') return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
      style={{ ...style, resize: 'vertical' }} />
  )
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
}

function Btn({ onClick, children, color = ACCENT, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
      style={{
        background: outline ? 'transparent' : disabled ? `${color}08` : `${color}18`,
        border: `1px solid ${disabled ? color + '20' : color + '50'}`,
        color: disabled ? '#4a5f7a' : color,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {children}
    </button>
  )
}

// ── Modal: Registrar Evento Sanitario ────────────────────────────────────────
function ModalEvento({ animalId, onClose }) {
  const { tema } = useTheme()
  const { registrarEventoSanitario } = useConejo()
  const [tipo,    setTipo]    = useState('evaluacion_clinica')
  const [fecha,   setFecha]   = useState(new Date().toISOString().split('T')[0])
  const [result,  setResult]  = useState('')
  const [prof,    setProf]    = useState('')
  const [obs,     setObs]     = useState('')
  const valido = result.trim() && prof.trim()

  function confirmar() {
    if (!valido) return
    registrarEventoSanitario({
      id: `EV-${Date.now()}`, animalId, fecha, tipo,
      resultado: result.trim(), profesionalResponsable: prof.trim(),
      archivos: [], observaciones: obs.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)', zIndex: 60 }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: `1.5px solid ${ACCENT}40`, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${ACCENT}20`, background: `${ACCENT}04` }}>
          <div className="font-bold text-base" style={{ color: '#c9d4e0' }}>Registrar Evento Sanitario</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{animalId}</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Campo label="Tipo de evento">
            <select value={tipo} onChange={e => setTipo(e.target.value)}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', cursor: 'pointer' }}>
              {Object.entries(TIPOS_EVENTO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Campo>
          <Campo label="Fecha">
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%' }} />
          </Campo>
          <Campo label="Resultado / Hallazgo *">
            <textarea value={result} onChange={e => setResult(e.target.value)} placeholder="Describir resultado o hallazgo..." rows={3}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </Campo>
          <Campo label="Profesional responsable *">
            <input value={prof} onChange={e => setProf(e.target.value)} placeholder="Ej: Dr. González"
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%' }} />
          </Campo>
          <Campo label="Observaciones adicionales">
            <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Opcional..." rows={2}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </Campo>
          <div className="flex gap-3 pt-1">
            <Btn onClick={onClose} color="#8a9bb0">Cancelar</Btn>
            <button onClick={confirmar} disabled={!valido}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: !valido ? `${ACCENT}08` : `${ACCENT}18`, border: `1.5px solid ${!valido ? ACCENT + '20' : ACCENT + '50'}`, color: !valido ? '#4a5f7a' : ACCENT, cursor: !valido ? 'not-allowed' : 'pointer' }}>
              Registrar Evento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Decisión de cuarentena ────────────────────────────────────────────
function ModalDecision({ animalId, onClose }) {
  const { tema } = useTheme()
  const { tomarDecisionCuarentena } = useConejo()
  const [decision,    setDecision]    = useState('aprobado')
  const [responsable, setResponsable] = useState('')
  const [motivo,      setMotivo]      = useState('')
  const valido = responsable.trim() && motivo.trim()

  const OPCIONES = [
    { v: 'aprobado',  l: 'Aprobar ingreso a colonia',  color: '#00e676', desc: 'El animal pasa a estado Reproductor' },
    { v: 'extendido', l: 'Extender cuarentena',        color: ACCENT,    desc: 'Se mantiene en estado Cuarentena' },
    { v: 'rechazado', l: 'Rechazar ingreso',           color: '#ff6b80', desc: 'El animal pasa a estado Baja' },
  ]

  function confirmar() {
    if (!valido) return
    tomarDecisionCuarentena(animalId, decision, responsable.trim(), motivo.trim())
    onClose()
  }

  const opcSel = OPCIONES.find(o => o.v === decision)
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)', zIndex: 60 }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: `1.5px solid ${opcSel?.color ?? ACCENT}40` }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${opcSel?.color ?? ACCENT}20`, background: `${opcSel?.color ?? ACCENT}04` }}>
          <div className="font-bold text-base" style={{ color: '#c9d4e0' }}>Decisión de Cuarentena</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{animalId}</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Campo label="Decisión">
            <div className="space-y-2">
              {OPCIONES.map(op => (
                <label key={op.v} className="flex items-start gap-3 rounded-xl p-3 cursor-pointer"
                  style={{ background: decision === op.v ? `${op.color}10` : tema.bgCard, border: `1px solid ${decision === op.v ? op.color + '50' : tema.bgCardBorde}` }}>
                  <input type="radio" name="decision" value={op.v} checked={decision === op.v} onChange={() => setDecision(op.v)} style={{ marginTop: 2 }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: decision === op.v ? op.color : tema.textPrimary }}>{op.l}</div>
                    <div className="text-xs" style={{ color: tema.textMuted }}>{op.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </Campo>
          <Campo label="Responsable sanitario *">
            <input value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Nombre del profesional"
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%' }} />
          </Campo>
          <Campo label="Motivo / Justificación *">
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Justificación de la decisión..." rows={3}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </Campo>
          <div className="flex gap-3 pt-1">
            <Btn onClick={onClose} color="#8a9bb0">Cancelar</Btn>
            <button onClick={confirmar} disabled={!valido}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: !valido ? `${opcSel?.color}08` : `${opcSel?.color}20`, border: `1.5px solid ${!valido ? (opcSel?.color ?? ACCENT) + '20' : (opcSel?.color ?? ACCENT) + '60'}`, color: !valido ? '#4a5f7a' : opcSel?.color ?? ACCENT, cursor: !valido ? 'not-allowed' : 'pointer' }}>
              Confirmar Decisión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Panel por animal en cuarentena ───────────────────────────────────────────
function PanelCuarentena({ animal }) {
  const { tema } = useTheme()
  const { datos } = useConejo()
  const [showEvento,   setShowEvento]   = useState(false)
  const [showDecision, setShowDecision] = useState(false)
  const [showFicha,    setShowFicha]    = useState(false)

  const ingreso = datos.ingresos.find(i => i.animalesIds.includes(animal.id))
  const eventos = datos.eventosSanitarios.filter(e => e.animalId === animal.id)
  const tieneDecision = datos.decisiones.some(d => d.animalId === animal.id)

  function diasEnCuarentena() {
    const f = ingreso?.fechaIngreso
    if (!f) return '—'
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const ing = new Date(f + 'T00:00:00')
    return Math.floor((hoy - ing) / 86400000)
  }

  const eventosPendientes = eventos.filter(e => e.resultado?.toLowerCase().includes('pendiente'))

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${ACCENT}40` }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3" style={{ background: `${ACCENT}06`, borderBottom: `1px solid ${ACCENT}20` }}>
        <div className="font-mono font-bold" style={{ color: ACCENT }}>{animal.id}</div>
        <div className="text-xs" style={{ color: tema.textMuted }}>{animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'} · {animal.cepa}</div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}40`, color: ACCENT }}>
            Día {diasEnCuarentena()} de cuarentena
          </span>
          {eventosPendientes.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,128,0.15)', border: '1px solid rgba(255,107,128,0.4)', color: '#ff6b80' }}>
              {eventosPendientes.length} resultado{eventosPendientes.length > 1 ? 's' : ''} pendiente{eventosPendientes.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-5 py-3">
        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
          <div><span style={{ color: tema.textMuted }}>Ingreso: </span><span style={{ color: tema.textPrimary }}>{fmt(ingreso?.fechaIngreso)}</span></div>
          <div><span style={{ color: tema.textMuted }}>Lote: </span><span style={{ color: tema.textPrimary }}>{ingreso?.loteCompra ?? '—'}</span></div>
          <div><span style={{ color: tema.textMuted }}>Origen: </span><span style={{ color: tema.textPrimary }}>{ingreso?.procedencia ?? '—'}</span></div>
        </div>

        {/* Eventos */}
        <div className="mb-3">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>
            Eventos sanitarios ({eventos.length})
          </div>
          {eventos.length === 0 ? (
            <div className="text-xs py-2 text-center rounded-lg" style={{ color: tema.textMuted, background: tema.bgMain }}>Sin eventos registrados aún.</div>
          ) : (
            <div className="space-y-1.5">
              {eventos.map(ev => {
                const tipoInfo = TIPOS_EVENTO[ev.tipo]
                const esPendiente = ev.resultado?.toLowerCase().includes('pendiente')
                return (
                  <div key={ev.id} className="flex items-start gap-2 rounded-lg px-3 py-2"
                    style={{ background: tema.bgMain, border: `1px solid ${esPendiente ? 'rgba(255,107,128,0.25)' : tema.bgCardBorde}` }}>
                    <span className="text-xs font-bold shrink-0 mt-0.5"
                      style={{ color: tipoInfo?.color ?? '#8a9bb0' }}>
                      {tipoInfo?.label ?? ev.tipo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs leading-relaxed" style={{ color: esPendiente ? '#ffb300' : tema.textSecondary }}>{ev.resultado}</div>
                    </div>
                    <span className="text-xs font-mono shrink-0" style={{ color: tema.textMuted }}>{fmt(ev.fecha)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 flex-wrap">
          <Btn onClick={() => setShowEvento(true)} color={ACCENT}>+ Evento Sanitario</Btn>
          <Btn onClick={() => setShowDecision(true)} color="#00e676" disabled={tieneDecision && animal.estado !== 'cuarentena'}>
            {animal.estado !== 'cuarentena' ? '✓ Decidido' : '⚖ Tomar Decisión'}
          </Btn>
          <Btn onClick={() => setShowFicha(true)} color="#40c4ff">Ver Ficha</Btn>
        </div>
      </div>

      {showEvento   && <ModalEvento   animalId={animal.id} onClose={() => setShowEvento(false)} />}
      {showDecision && <ModalDecision animalId={animal.id} onClose={() => setShowDecision(false)} />}
      {showFicha    && <FichaAnimalModal animalId={animal.id} onClose={() => setShowFicha(false)} />}
    </div>
  )
}

// ── Tab principal ────────────────────────────────────────────────────────────
export default function CuarentenaTab() {
  const { tema } = useTheme()
  const { datos } = useConejo()
  const enCuarentena = datos.animales.filter(a => a.estado === 'cuarentena')

  if (enCuarentena.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center rounded-2xl px-8 py-10 max-w-sm" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
          <div className="text-4xl mb-4">✓</div>
          <div className="font-bold text-base mb-2" style={{ color: '#00e676' }}>Sin animales en cuarentena</div>
          <div className="text-sm" style={{ color: tema.textMuted }}>No hay animales aguardando liberación sanitaria en este momento.</div>
        </div>
      </div>
    )
  }

  const pendientes = enCuarentena.filter(a => a.estadoSanitario === 'pendiente')
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div>
          <div className="font-bold text-lg" style={{ color: tema.textPrimary }}>Control de Cuarentena</div>
          <div className="text-sm" style={{ color: tema.textMuted }}>Animales en período de aislamiento sanitario previo al ingreso a colonia</div>
        </div>
        <div className="ml-auto flex gap-3">
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30` }}>
            <div className="font-mono font-bold text-xl" style={{ color: ACCENT }}>{enCuarentena.length}</div>
            <div className="text-xs" style={{ color: tema.textMuted }}>En cuarentena</div>
          </div>
          {pendientes.length > 0 && (
            <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(255,107,128,0.1)', border: '1px solid rgba(255,107,128,0.3)' }}>
              <div className="font-mono font-bold text-xl" style={{ color: '#ff6b80' }}>{pendientes.length}</div>
              <div className="text-xs" style={{ color: tema.textMuted }}>Result. pendiente</div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: `${ACCENT}06`, border: `1px solid ${ACCENT}25`, color: tema.textSecondary }}>
        <span style={{ color: ACCENT, fontWeight: 700 }}>Protocolo: </span>
        Los animales en cuarentena no pueden participar en reproducción ni protocolos experimentales hasta que el responsable sanitario emita decisión de aprobación.
      </div>

      <div className="space-y-4">
        {enCuarentena.map(a => <PanelCuarentena key={a.id} animal={a} />)}
      </div>
    </div>
  )
}
