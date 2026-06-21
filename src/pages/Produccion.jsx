import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useICIVET, ESPECIES_CONFIG, GESTACION_DIAS, DESTETE_DIAS } from '../context/ICIVETContext'

// ── Utilidades de fechas ─────────────────────────────────────────────────────
function addDias(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
function diasHasta(dateStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const t = new Date(dateStr + 'T00:00:00')
  return Math.round((t - hoy) / 86400000)
}
function mesActual() { return new Date().toISOString().slice(0,7) }

// ── Componentes base ─────────────────────────────────────────────────────────
function Badge({ children, color = '#00e676', bg, borde }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: bg ?? `${color}18`, border: `1px solid ${borde ?? color + '50'}`, color }}>
      {children}
    </span>
  )
}

function KPI({ valor, label, color, sub }) {
  const { tema } = useTheme()
  return (
    <div className="rounded-xl px-4 py-3 text-center"
      style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
      <div className="font-mono font-bold text-2xl" style={{ color }}>{valor}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: tema.textMuted }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: tema.textMuted, opacity: 0.6 }}>{sub}</div>}
    </div>
  )
}

function Separador({ tema }) {
  return <div style={{ height: '1px', background: tema.bgCardBorde, margin: '4px 0' }} />
}

// ── Input reutilizable ───────────────────────────────────────────────────────
function Campo({ label, children }) {
  const { tema } = useTheme()
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>
        {label}
      </label>
      {children}
    </div>
  )
}
function InputText({ value, onChange, placeholder, type = 'text' }) {
  const { tema } = useTheme()
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
      style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary }} />
  )
}
function InputNum({ value, onChange, placeholder, min = 0 }) {
  const { tema } = useTheme()
  return (
    <input type="number" min={min} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
      style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary }} />
  )
}

// ── Modal genérico ───────────────────────────────────────────────────────────
function Modal({ titulo, subtitulo, onClose, children, accentColor = '#00e676' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: `1.5px solid ${accentColor}40`, boxShadow: `0 0 60px ${accentColor}08`, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${accentColor}20`, background: `${accentColor}04` }}>
          <div className="font-bold text-base" style={{ color: '#c9d4e0' }}>{titulo}</div>
          {subtitulo && <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{subtitulo}</div>}
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
      </div>
    </div>
  )
}
function BotonesModal({ onCancel, onConfirm, disabledConfirm, labelConfirm = 'Confirmar', color = '#00e676' }) {
  return (
    <div className="flex gap-3 pt-1">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>
        Cancelar
      </button>
      <button onClick={onConfirm} disabled={disabledConfirm}
        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
        style={{
          background: disabledConfirm ? `${color}08` : `${color}18`,
          border: `1.5px solid ${disabledConfirm ? color + '20' : color + '50'}`,
          color: disabledConfirm ? '#4a5f7a' : color,
          cursor: disabledConfirm ? 'not-allowed' : 'pointer',
        }}>
        {labelConfirm}
      </button>
    </div>
  )
}

// ── Modal: Crear Jaula ───────────────────────────────────────────────────────
function ModalCrearJaula({ especieId, cfg, onClose }) {
  const { crearJaula } = useICIVET()
  const { tema } = useTheme()
  const [codigo,  setCodigo]  = useState('')
  const [machoId, setMachoId] = useState('')
  const [h1, setH1] = useState(''); const [h2, setH2] = useState(''); const [h3, setH3] = useState('')
  const [fecha,   setFecha]   = useState(new Date().toISOString().split('T')[0])
  const [obs,     setObs]     = useState('')

  const hembraIds = [h1, h2, h3].filter(Boolean)
  const valido = codigo.trim() && machoId.trim() && hembraIds.length > 0

  function confirmar() {
    if (!valido) return
    crearJaula(especieId, {
      id: `JAU-P-${especieId.toUpperCase()}-${Date.now()}`,
      codigo: codigo.trim(), cepa: cfg.nombre,
      machoId: machoId.trim(), hembraIds,
      fechaFormacion: fecha, estado: 'activo', observaciones: obs.trim(),
    })
    onClose()
  }

  return (
    <Modal titulo="Nueva jaula reproductiva" subtitulo={cfg.nombre} onClose={onClose} accentColor={cfg.color}>
      <Campo label="Código de jaula"><InputText value={codigo} onChange={setCodigo} placeholder="Ej: JAU-P-W-003" /></Campo>
      <Campo label="Macho reproductor (ID de Fundación)"><InputText value={machoId} onChange={setMachoId} placeholder="Ej: A-W-001-04" /></Campo>
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>
          Hembras (hasta 3)
        </label>
        <div className="space-y-2">
          <InputText value={h1} onChange={setH1} placeholder="Hembra 1 (obligatorio)" />
          <InputText value={h2} onChange={setH2} placeholder="Hembra 2 (opcional)" />
          <InputText value={h3} onChange={setH3} placeholder="Hembra 3 (opcional)" />
        </div>
      </div>
      <Campo label="Fecha de formación">
        <InputText type="date" value={fecha} onChange={setFecha} />
      </Campo>
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Opcional" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabledConfirm={!valido} labelConfirm="Crear jaula" color={cfg.color} />
    </Modal>
  )
}

// ── Modal: Registrar Nacimiento ──────────────────────────────────────────────
function ModalNacimiento({ jaula, especieId, cfg, onClose }) {
  const { registrarNacimientoProd } = useICIVET()
  const [fecha,  setFecha]  = useState(new Date().toISOString().split('T')[0])
  const [crias,  setCrias]  = useState('')
  const [obs,    setObs]    = useState('')
  const valido = crias && parseInt(crias) > 0

  function confirmar() {
    if (!valido) return
    const idx = Date.now()
    registrarNacimientoProd(especieId, {
      id: `CAM-P-${especieId.toUpperCase()}-${idx}`,
      codigo: `CAM-P-${especieId.toUpperCase().slice(0,1)}-${idx.toString().slice(-4)}`,
      jaulaId: jaula.id, machoId: jaula.machoId, hembraIds: jaula.hembraIds,
      fechaNacimiento: fecha, cantidadNacida: parseInt(crias),
      observaciones: obs.trim(), destete: null, seleccion: null, stock: null,
    })
    onClose()
  }

  return (
    <Modal titulo="Registrar nacimiento" subtitulo={`Jaula ${jaula.codigo}`} onClose={onClose} accentColor={cfg.color}>
      <Campo label="Fecha de nacimiento"><InputText type="date" value={fecha} onChange={setFecha} /></Campo>
      <Campo label="Número de crías nacidas"><InputNum value={crias} onChange={setCrias} placeholder="0" min={1} /></Campo>
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Opcional" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabledConfirm={!valido} labelConfirm="Registrar nacimiento" color={cfg.color} />
    </Modal>
  )
}

// ── Modal: Registrar Destete ─────────────────────────────────────────────────
function ModalDesteeProd({ camada, especieId, cfg, onClose }) {
  const { registrarDesteeProd } = useICIVET()
  const [fecha,   setFecha]   = useState(new Date().toISOString().split('T')[0])
  const [machos,  setMachos]  = useState('')
  const [hembras, setHembras] = useState('')
  const [obs,     setObs]     = useState('')

  const m = parseInt(machos) || 0
  const h = parseInt(hembras) || 0
  const suma = m + h
  const totalOk = machos !== '' && hembras !== '' && suma === camada.cantidadNacida

  function confirmar() {
    if (!totalOk) return
    registrarDesteeProd(especieId, camada.id, { fecha, machos: m, hembras: h, observaciones: obs.trim() })
    onClose()
  }

  return (
    <Modal titulo="Registrar destete" subtitulo={camada.codigo} onClose={onClose} accentColor={cfg.color}>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a9bb0' }}>
        {camada.cantidadNacida} crías nacidas el {camada.fechaNacimiento}
      </div>
      <Campo label="Fecha de destete"><InputText type="date" value={fecha} onChange={setFecha} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Machos ♂"><InputNum value={machos} onChange={setMachos} placeholder="0" /></Campo>
        <Campo label="Hembras ♀"><InputNum value={hembras} onChange={setHembras} placeholder="0" /></Campo>
      </div>
      {machos !== '' && hembras !== '' && (
        <div className="rounded-lg px-3 py-2 text-xs text-center"
          style={{ background: totalOk ? 'rgba(0,230,118,0.08)' : 'rgba(255,61,87,0.08)', border: `1px solid ${totalOk ? 'rgba(0,230,118,0.3)' : 'rgba(255,61,87,0.3)'}`, color: totalOk ? '#00e676' : '#ff6b80' }}>
          {totalOk ? `✓ ${m}M + ${h}H = ${suma} — correcto` : `${m}M + ${h}H = ${suma} ≠ ${camada.cantidadNacida} — revisar`}
        </div>
      )}
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Opcional" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabledConfirm={!totalOk} labelConfirm="Confirmar destete" color={cfg.color} />
    </Modal>
  )
}

// ── Modal: Registrar Selección ───────────────────────────────────────────────
function ModalSeleccion({ camada, especieId, cfg, onClose }) {
  const { registrarSeleccionProd } = useICIVET()
  const [mSel,   setMSel]   = useState('')
  const [hSel,   setHSel]   = useState('')
  const [motivo, setMotivo]  = useState('')

  const totalM = camada.destete?.machos  ?? 0
  const totalH = camada.destete?.hembras ?? 0
  const mS = parseInt(mSel) || 0
  const hS = parseInt(hSel) || 0
  const mStock = totalM - mS
  const hStock = totalH - hS
  const valido = mSel !== '' && hSel !== '' && mS <= totalM && hS <= totalH && mS >= 0 && hS >= 0

  function confirmar() {
    if (!valido) return
    const hoy = new Date().toISOString().split('T')[0]
    registrarSeleccionProd(
      especieId, camada.id,
      { machosSeleccionados: mS, hembrasSeleccionadas: hS, motivo: motivo.trim(), fecha: hoy },
      { machos: mStock, hembras: hStock, fechaIngreso: hoy }
    )
    onClose()
  }

  return (
    <Modal titulo="Seleccionar reproductores" subtitulo={camada.codigo} onClose={onClose} accentColor={cfg.color}>
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a9bb0' }}>
        Disponibles: <span style={{ color: '#40c4ff' }}>♂ {totalM}</span> — <span style={{ color: '#ce93d8' }}>♀ {totalH}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label={`Machos seleccionados (max ${totalM})`}><InputNum value={mSel} onChange={setMSel} placeholder="0" /></Campo>
        <Campo label={`Hembras seleccionadas (max ${totalH})`}><InputNum value={hSel} onChange={setHSel} placeholder="0" /></Campo>
      </div>
      {valido && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg px-3 py-2 text-xs text-center" style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', color: '#00e676' }}>
            <div className="font-bold">→ Seleccionados</div>
            <div>♂ {mS} — ♀ {hS}</div>
          </div>
          <div className="rounded-lg px-3 py-2 text-xs text-center" style={{ background: 'rgba(64,196,255,0.08)', border: '1px solid rgba(64,196,255,0.25)', color: '#40c4ff' }}>
            <div className="font-bold">→ Stock</div>
            <div>♂ {mStock} — ♀ {hStock}</div>
          </div>
        </div>
      )}
      <Campo label="Motivo de selección"><InputText value={motivo} onChange={setMotivo} placeholder="Ej: Buen desarrollo corporal" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabledConfirm={!valido} labelConfirm="Confirmar selección" color={cfg.color} />
    </Modal>
  )
}

// ── Tarjeta de Jaula ─────────────────────────────────────────────────────────
function TarjetaJaula({ jaula, camadas, cfg, tema, onNacimiento, onCambiarEstado }) {
  const camadasJaula   = camadas.filter(c => c.jaulaId === jaula.id)
  const camadasActivas = camadasJaula.filter(c => !c.destete)
  const gestDias       = GESTACION_DIAS[cfg.id] ?? 21
  const nacimientoEst  = addDias(jaula.fechaFormacion, gestDias)
  const diasNac        = diasHasta(nacimientoEst)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(8,13,26,0.5)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{jaula.codigo}</span>
          <Badge color={jaula.estado === 'activo' ? '#00e676' : '#8a9bb0'}>
            {jaula.estado === 'activo' ? '● Activa' : '○ Inactiva'}
          </Badge>
        </div>
        <div className="flex gap-2">
          {jaula.estado === 'activo' && camadasActivas.length === 0 && (
            <button onClick={onNacimiento}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}50`, color: cfg.color, cursor: 'pointer' }}>
              + Nacimiento
            </button>
          )}
          <button onClick={() => onCambiarEstado(jaula.estado === 'activo' ? 'inactivo' : 'activo')}
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: 'transparent', border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted, cursor: 'pointer' }}>
            {jaula.estado === 'activo' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      {/* Datos */}
      <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Macho</div>
          <div className="font-mono text-sm font-bold" style={{ color: '#40c4ff' }}>♂ {jaula.machoId}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Hembras</div>
          <div className="space-y-0.5">
            {jaula.hembraIds.map(h => (
              <div key={h} className="font-mono text-sm font-bold" style={{ color: '#ce93d8' }}>♀ {h}</div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Formación</div>
          <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>{jaula.fechaFormacion}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Próx. nacimiento est.</div>
          {camadasActivas.length > 0 ? (
            <Badge color="#ffb300">Camada activa</Badge>
          ) : diasNac > 0 ? (
            <div>
              <div className="font-mono text-sm" style={{ color: '#ffb300' }}>{nacimientoEst}</div>
              <div className="text-xs" style={{ color: tema.textMuted }}>en {diasNac} días</div>
            </div>
          ) : (
            <Badge color="#ff6b80">Confirmar</Badge>
          )}
        </div>
      </div>

      {/* Resumen de camadas */}
      {camadasJaula.length > 0 && (
        <div className="px-4 pb-3">
          <Separador tema={tema} />
          <div className="text-xs font-semibold uppercase tracking-widest mb-2 mt-2" style={{ color: tema.textMuted }}>
            Camadas ({camadasJaula.length})
          </div>
          <div className="flex gap-2 flex-wrap">
            {camadasJaula.map(c => (
              <span key={c.id} className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: c.seleccion ? 'rgba(0,230,118,0.1)' : c.destete ? 'rgba(255,179,0,0.1)' : 'rgba(206,147,216,0.1)', border: `1px solid ${c.seleccion ? 'rgba(0,230,118,0.3)' : c.destete ? 'rgba(255,179,0,0.3)' : 'rgba(206,147,216,0.3)'}`, color: c.seleccion ? '#00e676' : c.destete ? '#ffb300' : '#ce93d8' }}>
                {c.codigo} · {c.seleccion ? 'Finalizada' : c.destete ? 'Pendiente selección' : 'En lactancia'}
              </span>
            ))}
          </div>
        </div>
      )}

      {jaula.observaciones && (
        <div className="px-4 pb-3">
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted }}>
            📝 {jaula.observaciones}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tarjeta de Camada ────────────────────────────────────────────────────────
function TarjetaCamada({ camada, cfg, tema, onDestete, onSeleccion }) {
  const desteteEst = addDias(camada.fechaNacimiento, DESTETE_DIAS)
  const diasDest   = diasHasta(desteteEst)

  const estadoBadge = camada.seleccion
    ? { label: '✓ Finalizada', color: '#00e676' }
    : camada.destete
    ? { label: 'Pendiente selección', color: '#ffb300' }
    : { label: 'En lactancia', color: '#ce93d8' }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{ background: 'rgba(8,13,26,0.5)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{camada.codigo}</span>
          <span className="text-xs font-mono" style={{ color: tema.textMuted }}>Jaula {camada.jaulaId}</span>
          <Badge color={estadoBadge.color}>{estadoBadge.label}</Badge>
        </div>
        <div className="flex gap-2">
          {!camada.destete && (
            <button onClick={onDestete}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.4)', color: '#ffb300', cursor: 'pointer' }}>
              Registrar destete
            </button>
          )}
          {camada.destete && !camada.seleccion && (
            <button onClick={onSeleccion}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.4)', color: '#00e676', cursor: 'pointer' }}>
              Seleccionar reproductores
            </button>
          )}
        </div>
      </div>

      {/* Datos de nacimiento */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Macho</div>
            <div className="font-mono text-sm font-bold" style={{ color: '#40c4ff' }}>♂ {camada.machoId}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Hembras</div>
            <div className="space-y-0.5">
              {camada.hembraIds.map(h => <div key={h} className="font-mono text-sm font-bold" style={{ color: '#ce93d8' }}>♀ {h}</div>)}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Nacimiento</div>
            <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>{camada.fechaNacimiento}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Crías</div>
            <div className="font-mono text-xl font-bold" style={{ color: tema.textPrimary }}>{camada.cantidadNacida}</div>
          </div>
        </div>

        {/* Destete estimado o registrado */}
        {!camada.destete ? (
          <div className="rounded-xl px-3 py-2 flex items-center justify-between"
            style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.2)' }}>
            <span className="text-xs font-semibold" style={{ color: '#ffb300' }}>Destete estimado: {desteteEst}</span>
            <span className="text-xs font-mono" style={{ color: diasDest > 0 ? '#ffb300' : '#ff6b80' }}>
              {diasDest > 0 ? `en ${diasDest} días` : diasDest === 0 ? '¡hoy!' : `hace ${Math.abs(diasDest)} días`}
            </span>
          </div>
        ) : (
          <>
            <Separador tema={tema} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Destete</div>
                <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>{camada.destete.fecha}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Machos</div>
                <div className="font-mono text-lg font-bold" style={{ color: '#40c4ff' }}>♂ {camada.destete.machos}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Hembras</div>
                <div className="font-mono text-lg font-bold" style={{ color: '#ce93d8' }}>♀ {camada.destete.hembras}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Total destetado</div>
                <div className="font-mono text-lg font-bold" style={{ color: tema.textPrimary }}>{camada.destete.machos + camada.destete.hembras}</div>
              </div>
            </div>
          </>
        )}

        {/* Selección y stock */}
        {camada.seleccion && (
          <>
            <Separador tema={tema} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl px-3 py-2.5 text-center"
                style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#00e676' }}>Seleccionados</div>
                <div className="font-mono text-sm font-bold" style={{ color: '#00e676' }}>
                  ♂ {camada.seleccion.machosSeleccionados} — ♀ {camada.seleccion.hembrasSeleccionadas}
                </div>
                {camada.seleccion.motivo && (
                  <div className="text-xs mt-1" style={{ color: 'rgba(0,230,118,0.7)' }}>{camada.seleccion.motivo}</div>
                )}
              </div>
              <div className="rounded-xl px-3 py-2.5 text-center"
                style={{ background: 'rgba(64,196,255,0.08)', border: '1px solid rgba(64,196,255,0.25)' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#40c4ff' }}>Stock</div>
                <div className="font-mono text-sm font-bold" style={{ color: '#40c4ff' }}>
                  ♂ {camada.stock.machos} — ♀ {camada.stock.hembras}
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(64,196,255,0.7)' }}>Ingreso: {camada.stock.fechaIngreso}</div>
              </div>
            </div>
          </>
        )}

        {camada.observaciones && (
          <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted }}>
            📝 {camada.observaciones}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Inicio (Dashboard) ──────────────────────────────────────────────────
function TabInicio({ prod, cfg, tema, onIrJaulas, onIrCamadas }) {
  const { jaulas, camadas } = prod
  const jaulasActivas  = jaulas.filter(j => j.estado === 'activo')
  const camadasActivas = camadas.filter(c => !c.destete)
  const pendDest       = camadas.filter(c => c.destete && !c.seleccion)
  const finalizadas    = camadas.filter(c => c.seleccion)
  const mes            = mesActual()
  const nacMes         = camadas.filter(c => c.fechaNacimiento?.startsWith(mes)).length
  const totalSel       = finalizadas.reduce((a, c) => a + (c.seleccion?.machosSeleccionados ?? 0) + (c.seleccion?.hembrasSeleccionadas ?? 0), 0)
  const totalStock     = finalizadas.reduce((a, c) => a + (c.stock?.machos ?? 0) + (c.stock?.hembras ?? 0), 0)
  const totalReprod    = jaulas.reduce((a, j) => a + 1 + j.hembraIds.length, 0)

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI valor={jaulasActivas.length}  label="Jaulas activas"      color={cfg.color} />
        <KPI valor={totalReprod}           label="Reproductores"       color="#8a9bb0" />
        <KPI valor={camadasActivas.length} label="Camadas activas"     color="#ce93d8" />
        <KPI valor={nacMes}                label="Nacimientos del mes" color="#ffb300" sub={mes} />
        <KPI valor={totalSel}              label="→ Seleccionados"     color="#00e676" />
        <KPI valor={totalStock}            label="→ Stock"             color="#40c4ff" />
      </div>

      {/* Flujo visual */}
      <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
        <div className="px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted, borderBottom: `1px solid ${tema.bgCardBorde}`, background: 'rgba(8,13,26,0.4)' }}>
          Flujo de Producción
        </div>
        <div className="px-5 py-4 flex items-center gap-2 flex-wrap text-sm font-semibold" style={{ color: tema.textMuted }}>
          {[
            { label: 'Fundación', color: cfg.color, count: null },
            { label: '→' },
            { label: 'Jaula', color: cfg.color, count: jaulas.length },
            { label: '→' },
            { label: 'Nacimiento', color: '#ce93d8', count: camadas.length },
            { label: '→' },
            { label: 'Destete', color: '#ffb300', count: camadas.filter(c=>c.destete).length },
            { label: '→' },
            { label: 'Selección', color: '#8a9bb0', count: pendDest.length },
            { label: '→' },
            { label: 'Seleccionados', color: '#00e676', count: totalSel },
            { label: '/' },
            { label: 'Stock', color: '#40c4ff', count: totalStock },
          ].map((step, i) => step.label === '→' || step.label === '/'
            ? <span key={i} style={{ color: tema.textMuted }}>{step.label}</span>
            : (
              <span key={i} className="px-2 py-1 rounded-lg text-xs"
                style={{ background: step.color ? `${step.color}14` : 'transparent', color: step.color ?? tema.textMuted, border: step.color ? `1px solid ${step.color}35` : 'none' }}>
                {step.label}{step.count !== null && step.count !== undefined ? ` (${step.count})` : ''}
              </span>
            )
          )}
        </div>
      </div>

      {/* Pendientes */}
      {(camadasActivas.length > 0 || pendDest.length > 0) && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: tema.textSecondary }}>Acciones pendientes</h4>
          {camadasActivas.map(c => {
            const dias = diasHasta(addDias(c.fechaNacimiento, DESTETE_DIAS))
            return (
              <button key={c.id} onClick={onIrCamadas}
                className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between"
                style={{ background: 'rgba(206,147,216,0.06)', border: '1px solid rgba(206,147,216,0.25)', cursor: 'pointer' }}>
                <div>
                  <span className="font-mono text-sm font-bold" style={{ color: '#ce93d8' }}>{c.codigo}</span>
                  <span className="text-xs ml-3" style={{ color: tema.textMuted }}>En lactancia · {c.cantidadNacida} crías · Jaula {c.jaulaId}</span>
                </div>
                <Badge color="#ffb300">{dias > 0 ? `Destete en ${dias}d` : dias === 0 ? 'Destete hoy' : 'Destete pendiente'}</Badge>
              </button>
            )
          })}
          {pendDest.map(c => (
            <button key={c.id} onClick={onIrCamadas}
              className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(255,179,0,0.05)', border: '1px solid rgba(255,179,0,0.25)', cursor: 'pointer' }}>
              <div>
                <span className="font-mono text-sm font-bold" style={{ color: '#ffb300' }}>{c.codigo}</span>
                <span className="text-xs ml-3" style={{ color: tema.textMuted }}>
                  Destetada {c.destete?.fecha} · ♂{c.destete?.machos} ♀{c.destete?.hembras}
                </span>
              </div>
              <Badge color="#00e676">Seleccionar reproductores</Badge>
            </button>
          ))}
        </div>
      )}

      {/* Jaulas rápidas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold" style={{ color: tema.textSecondary }}>Jaulas reproductivas ({jaulas.length})</h4>
          <button onClick={onIrJaulas} className="text-xs font-semibold"
            style={{ color: cfg.color, background: 'none', border: 'none', cursor: 'pointer' }}>
            Ver todas →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jaulas.map(j => {
            const camsJ = camadas.filter(c => c.jaulaId === j.id)
            return (
              <div key={j.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: tema.bgCard, border: `1px solid ${j.estado === 'activo' ? cfg.colorBorde : tema.bgCardBorde}` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{j.codigo}</span>
                    <Badge color={j.estado === 'activo' ? '#00e676' : '#8a9bb0'} >{j.estado === 'activo' ? '● Activa' : '○ Inactiva'}</Badge>
                  </div>
                  <div className="text-xs font-mono" style={{ color: tema.textMuted }}>
                    ♂ {j.machoId} · {j.hembraIds.length} hembra{j.hembraIds.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm" style={{ color: '#ce93d8' }}>{camsJ.length}</div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>camadas</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Jaulas ──────────────────────────────────────────────────────────────
function TabJaulas({ prod, especieId, cfg, tema, onNacimiento }) {
  const { editarEstadoJaula } = useICIVET()
  const { jaulas, camadas } = prod

  const activas   = jaulas.filter(j => j.estado === 'activo')
  const inactivas = jaulas.filter(j => j.estado !== 'activo')

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Jaulas reproductivas</h3>
        <div className="flex gap-2">
          <Badge color="#00e676">{activas.length} activas</Badge>
          {inactivas.length > 0 && <Badge color="#8a9bb0">{inactivas.length} inactivas</Badge>}
        </div>
      </div>

      {jaulas.length === 0 ? (
        <div className="text-center py-10" style={{ color: tema.textMuted }}>
          No hay jaulas creadas. Usá el botón "Nueva jaula" para comenzar.
        </div>
      ) : (
        <div className="space-y-4">
          {jaulas.map(j => (
            <TarjetaJaula
              key={j.id}
              jaula={j}
              camadas={camadas}
              cfg={cfg}
              tema={tema}
              onNacimiento={() => onNacimiento(j)}
              onCambiarEstado={(estado) => editarEstadoJaula(especieId, j.id, estado)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Camadas ─────────────────────────────────────────────────────────────
function TabCamadas({ prod, especieId, cfg, tema, onDestete, onSeleccion }) {
  const { camadas } = prod
  const activas  = camadas.filter(c => !c.destete)
  const pendSel  = camadas.filter(c => c.destete && !c.seleccion)
  const finales  = camadas.filter(c => c.seleccion)

  const grupos = [
    { label: 'En lactancia',         items: activas,  color: '#ce93d8' },
    { label: 'Pendiente selección',  items: pendSel,  color: '#ffb300' },
    { label: 'Finalizadas',          items: finales,  color: '#00e676' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {camadas.length === 0 ? (
        <div className="text-center py-10" style={{ color: tema.textMuted }}>
          No hay camadas registradas. Registrá un nacimiento desde la pestaña Jaulas.
        </div>
      ) : grupos.map(({ label, items, color }) => items.length > 0 && (
        <div key={label}>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold" style={{ color: tema.textSecondary }}>{label}</h4>
            <Badge color={color}>{items.length}</Badge>
          </div>
          <div className="space-y-4">
            {items.map(c => (
              <TarjetaCamada
                key={c.id}
                camada={c}
                cfg={cfg}
                tema={tema}
                onDestete={() => onDestete(c)}
                onSeleccion={() => onSeleccion(c)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Seleccionados ───────────────────────────────────────────────────────
function TabSeleccionados({ prod, cfg, tema }) {
  const seleccionados = prod.camadas.filter(c => c.seleccion)
  const total = seleccionados.reduce((a, c) => a + c.seleccion.machosSeleccionados + c.seleccion.hembrasSeleccionadas, 0)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Animales seleccionados como reproductores</h3>
        <Badge color="#00e676">{total} animales</Badge>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.2)', color: tema.textMuted }}>
        ℹ️ Estos animales fueron seleccionados para su potencial como futuros reproductores dentro de Producción.
      </div>

      {seleccionados.length === 0 ? (
        <div className="text-center py-8" style={{ color: tema.textMuted }}>Sin animales seleccionados aún.</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
                {['Camada', 'Fecha selección', 'Machos', 'Hembras', 'Total', 'Motivo'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seleccionados.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                  <td className="px-4 py-3"><span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>{c.codigo}</span></td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: tema.textSecondary }}>{c.seleccion.fecha}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#40c4ff' }}>♂ {c.seleccion.machosSeleccionados}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#ce93d8' }}>♀ {c.seleccion.hembrasSeleccionadas}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#00e676' }}>{c.seleccion.machosSeleccionados + c.seleccion.hembrasSeleccionadas}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: tema.textMuted }}>{c.seleccion.motivo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab: Stock ───────────────────────────────────────────────────────────────
function TabStock({ prod, cfg, tema }) {
  const conStock = prod.camadas.filter(c => c.stock)
  const totalM = conStock.reduce((a, c) => a + (c.stock?.machos ?? 0), 0)
  const totalH = conStock.reduce((a, c) => a + (c.stock?.hembras ?? 0), 0)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Stock generado por Producción</h3>
        <div className="flex gap-2">
          <Badge color="#40c4ff">♂ {totalM}</Badge>
          <Badge color="#ce93d8">♀ {totalH}</Badge>
          <Badge color="#8a9bb0">Total: {totalM + totalH}</Badge>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(64,196,255,0.04)', border: '1px solid rgba(64,196,255,0.2)', color: tema.textMuted }}>
        ℹ️ Animales no seleccionados como reproductores. Disponibles para abastecimiento interno o externo.
      </div>

      {conStock.length === 0 ? (
        <div className="text-center py-8" style={{ color: tema.textMuted }}>Sin animales en stock aún.</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
                {['Camada', 'Fecha ingreso', 'Machos', 'Hembras', 'Total'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conStock.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                  <td className="px-4 py-3"><span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>{c.codigo}</span></td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: tema.textSecondary }}>{c.stock.fechaIngreso}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#40c4ff' }}>♂ {c.stock.machos}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#ce93d8' }}>♀ {c.stock.hembras}</td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: '#8a9bb0' }}>{c.stock.machos + c.stock.hembras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Producción principal ─────────────────────────────────────────────────────
const TABS_PROD = [
  { id: 'inicio',        label: 'Inicio' },
  { id: 'jaulas',        label: 'Jaulas' },
  { id: 'camadas',       label: 'Camadas' },
  { id: 'seleccionados', label: 'Seleccionados' },
  { id: 'stock',         label: 'Stock' },
]

export default function Produccion({ especieId }) {
  const { getDatosEspecie, crearJaula: _crearJaula } = useICIVET()
  const { tema } = useTheme()
  const cfg    = ESPECIES_CONFIG[especieId]
  const datos  = getDatosEspecie(especieId)
  const [tabActual, setTabActual] = useState('inicio')

  // Modales
  const [modalJaula,     setModalJaula]     = useState(false)
  const [modalNac,       setModalNac]       = useState(null)  // jaula obj
  const [modalDestete,   setModalDestete]   = useState(null)  // camada obj
  const [modalSeleccion, setModalSeleccion] = useState(null)  // camada obj

  if (!datos?.produccion) {
    return <div className="p-6 text-center" style={{ color: tema.textMuted }}>Sin datos de producción.</div>
  }

  const prod = datos.produccion

  return (
    <div className="min-h-full" style={{ background: tema.bgMain }}>
      {/* Modales */}
      {modalJaula     && <ModalCrearJaula   especieId={especieId} cfg={cfg} onClose={() => setModalJaula(false)} />}
      {modalNac       && <ModalNacimiento   jaula={modalNac}     especieId={especieId} cfg={cfg} onClose={() => setModalNac(null)} />}
      {modalDestete   && <ModalDesteeProd   camada={modalDestete}  especieId={especieId} cfg={cfg} onClose={() => setModalDestete(null)} />}
      {modalSeleccion && <ModalSeleccion    camada={modalSeleccion} especieId={especieId} cfg={cfg} onClose={() => setModalSeleccion(null)} />}

      {/* Header */}
      <div className="px-4 md:px-6 pt-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}` }}>
            🏭
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: tema.textPrimary }}>Colonia de Producción</h2>
            <p className="text-xs font-mono" style={{ color: tema.textMuted }}>
              {cfg.nombre} · Reproductores provenientes de Fundación
            </p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setModalJaula(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: cfg.colorDim, border: `1.5px solid ${cfg.colorBorde}`, color: cfg.color, cursor: 'pointer' }}>
              + Nueva jaula
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
          {TABS_PROD.map(tab => {
            const activo = tabActual === tab.id
            return (
              <button key={tab.id} onClick={() => setTabActual(tab.id)}
                className="px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0"
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: activo ? `2px solid ${cfg.color}` : '2px solid transparent',
                  color: activo ? cfg.color : tema.textMuted,
                  cursor: 'pointer', marginBottom: '-1px',
                }}>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenido */}
      {tabActual === 'inicio'        && <TabInicio prod={prod} cfg={cfg} tema={tema} onIrJaulas={() => setTabActual('jaulas')} onIrCamadas={() => setTabActual('camadas')} />}
      {tabActual === 'jaulas'        && <TabJaulas prod={prod} especieId={especieId} cfg={cfg} tema={tema} onNacimiento={setModalNac} />}
      {tabActual === 'camadas'       && <TabCamadas prod={prod} especieId={especieId} cfg={cfg} tema={tema} onDestete={setModalDestete} onSeleccion={setModalSeleccion} />}
      {tabActual === 'seleccionados' && <TabSeleccionados prod={prod} cfg={cfg} tema={tema} />}
      {tabActual === 'stock'         && <TabStock prod={prod} cfg={cfg} tema={tema} />}
    </div>
  )
}
