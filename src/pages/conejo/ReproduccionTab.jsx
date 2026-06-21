import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useConejo, GESTACION_DIAS_CONEJO, DESTETE_DIAS_CONEJO } from '../../context/ConejoContext'

const ACCENT = '#ffb300'

function addDias(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00'); d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
function diasDesde(dateStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.round((hoy - new Date(dateStr + 'T00:00:00')) / 86400000)
}
function diasHasta(dateStr) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.round((new Date(dateStr + 'T00:00:00') - hoy) / 86400000)
}
function fmt(d) {
  if (!d) return '—'
  const [y, mo, day] = d.split('T')[0].split('-'); return `${day}/${mo}/${y}`
}

function Badge({ children, color, bg, borde }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: bg ?? `${color}18`, border: `1px solid ${borde ?? color + '50'}`, color, display: 'inline-block' }}>
      {children}
    </span>
  )
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
function StyledInput({ value, onChange, type = 'text', placeholder }) {
  const { tema } = useTheme()
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%' }} />
}

// ── Modal: Nuevo Servicio ────────────────────────────────────────────────────
function ModalNuevoServicio({ onClose }) {
  const { tema } = useTheme()
  const { datos, registrarServicio } = useConejo()
  const [machoId, setMachoId] = useState('')
  const [hembraId, setHembraId] = useState('')
  const [detCelo, setDetCelo] = useState('')
  const [fechaSrv, setFechaSrv] = useState(new Date().toISOString().split('T')[0])
  const [obs, setObs] = useState('')

  const machos  = datos.animales.filter(a => a.sexo === 'macho'  && a.estado === 'reproductor')
  const hembras = datos.animales.filter(a => a.sexo === 'hembra' && a.estado === 'reproductor')
  const valido  = machoId && hembraId && fechaSrv

  const fechaPartoProbable = fechaSrv ? addDias(fechaSrv, GESTACION_DIAS_CONEJO) : null

  function confirmar() {
    if (!valido) return
    registrarServicio({
      id: `SRV-${Date.now()}`, machoId, hembraId,
      deteccionCelo: detCelo || null, fechaServicio: fechaSrv,
      confirmacionPrenez: null,
      fechaPartoProbable, fechaPartoReal: null,
      nacidos: null, destete: null,
      observaciones: obs.trim(),
    })
    onClose()
  }

  const selectStyle = { background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', cursor: 'pointer' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: `1.5px solid ${ACCENT}40` }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${ACCENT}20`, background: `${ACCENT}04` }}>
          <div className="font-bold text-base" style={{ color: '#c9d4e0' }}>Registrar Servicio</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>Apareamiento discontinuo</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Campo label="Macho reproductor *">
            <select value={machoId} onChange={e => setMachoId(e.target.value)} style={selectStyle}>
              <option value="">Seleccionar macho...</option>
              {machos.map(a => <option key={a.id} value={a.id}>{a.id} — {a.cepa}</option>)}
            </select>
          </Campo>
          <Campo label="Hembra reproductora *">
            <select value={hembraId} onChange={e => setHembraId(e.target.value)} style={selectStyle}>
              <option value="">Seleccionar hembra...</option>
              {hembras.map(a => <option key={a.id} value={a.id}>{a.id} — {a.cepa}</option>)}
            </select>
          </Campo>
          <Campo label="Detección de celo">
            <StyledInput type="date" value={detCelo} onChange={setDetCelo} />
          </Campo>
          <Campo label="Fecha de servicio *">
            <StyledInput type="date" value={fechaSrv} onChange={setFechaSrv} />
          </Campo>
          {fechaPartoProbable && (
            <div className="rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}25` }}>
              <span className="text-xs" style={{ color: tema.textMuted }}>Fecha probable de parto:</span>
              <span className="text-sm font-mono font-bold" style={{ color: ACCENT }}>{fmt(fechaPartoProbable)}</span>
              <span className="text-xs" style={{ color: tema.textMuted }}>(+{GESTACION_DIAS_CONEJO} días)</span>
            </div>
          )}
          <Campo label="Observaciones">
            <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Opcional..." rows={2}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </Campo>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={confirmar} disabled={!valido}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: !valido ? `${ACCENT}08` : `${ACCENT}18`, border: `1.5px solid ${!valido ? ACCENT + '20' : ACCENT + '50'}`, color: !valido ? '#4a5f7a' : ACCENT, cursor: !valido ? 'not-allowed' : 'pointer' }}>
              Registrar Servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Confirmar Preñez ──────────────────────────────────────────────────
function ModalConfirmarPrenez({ servicio, onClose }) {
  const { tema } = useTheme()
  const { actualizarServicio } = useConejo()
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [resultado, setResultado] = useState('positivo')
  const [metodo, setMetodo] = useState('Palpación abdominal')

  function confirmar() {
    actualizarServicio(servicio.id, { confirmacionPrenez: { fecha, resultado, metodo } }, 'Sistema')
    onClose()
  }

  const selectStyle = { background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', cursor: 'pointer' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: `1.5px solid ${ACCENT}40` }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${ACCENT}20`, background: `${ACCENT}04` }}>
          <div className="font-bold" style={{ color: '#c9d4e0' }}>Confirmar Preñez</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{servicio.id}</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Campo label="Fecha de evaluación"><StyledInput type="date" value={fecha} onChange={setFecha} /></Campo>
          <Campo label="Resultado">
            <select value={resultado} onChange={e => setResultado(e.target.value)} style={selectStyle}>
              <option value="positivo">Positivo — Preñada</option>
              <option value="negativo">Negativo — No preñada</option>
              <option value="dudoso">Dudoso — Repetir</option>
            </select>
          </Campo>
          <Campo label="Método de diagnóstico"><StyledInput value={metodo} onChange={setMetodo} placeholder="Ej: Palpación abdominal" /></Campo>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={confirmar} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: `${ACCENT}18`, border: `1.5px solid ${ACCENT}50`, color: ACCENT, cursor: 'pointer' }}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Registrar Parto ───────────────────────────────────────────────────
function ModalParto({ servicio, onClose }) {
  const { actualizarServicio } = useConejo()
  const { tema } = useTheme()
  const [fecha,   setFecha]   = useState(new Date().toISOString().split('T')[0])
  const [vivos,   setVivos]   = useState('')
  const [muertos, setMuertos] = useState('0')
  const [obs,     setObs]     = useState('')
  const valido = vivos && parseInt(vivos) >= 0

  function confirmar() {
    if (!valido) return
    const total = parseInt(vivos) + parseInt(muertos || 0)
    actualizarServicio(servicio.id, {
      fechaPartoReal: fecha,
      nacidos: { total, vivos: parseInt(vivos), muertos: parseInt(muertos || 0) },
    }, 'Sistema')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: '1.5px solid rgba(0,230,118,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(0,230,118,0.2)', background: 'rgba(0,230,118,0.04)' }}>
          <div className="font-bold" style={{ color: '#c9d4e0' }}>Registrar Parto</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{servicio.id} · {servicio.hembraId}</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Campo label="Fecha de parto"><StyledInput type="date" value={fecha} onChange={setFecha} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Nacidos vivos *"><StyledInput type="number" value={vivos} onChange={setVivos} placeholder="0" /></Campo>
            <Campo label="Nacidos muertos"><StyledInput type="number" value={muertos} onChange={setMuertos} placeholder="0" /></Campo>
          </div>
          <Campo label="Observaciones">
            <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Novedades del parto..." rows={2}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </Campo>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={confirmar} disabled={!valido}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: !valido ? 'rgba(0,230,118,0.05)' : 'rgba(0,230,118,0.15)', border: `1.5px solid ${!valido ? 'rgba(0,230,118,0.2)' : 'rgba(0,230,118,0.5)'}`, color: !valido ? '#4a5f7a' : '#00e676', cursor: !valido ? 'not-allowed' : 'pointer' }}>
              Registrar Parto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal: Registrar Destete ─────────────────────────────────────────────────
function ModalDestete({ servicio, onClose }) {
  const { actualizarServicio } = useConejo()
  const { tema } = useTheme()
  const [fecha,    setFecha]    = useState(new Date().toISOString().split('T')[0])
  const [destet,   setDestet]   = useState('')
  const [machos,   setMachos]   = useState('')
  const [hembras,  setHembras]  = useState('')
  const [obs,      setObs]      = useState('')
  const valido = destet && machos && hembras && (parseInt(machos) + parseInt(hembras) <= parseInt(destet))

  function confirmar() {
    if (!valido) return
    actualizarServicio(servicio.id, {
      destete: { fecha, destetados: parseInt(destet), machos: parseInt(machos), hembras: parseInt(hembras), observaciones: obs.trim() }
    }, 'Sistema')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: '1.5px solid rgba(64,196,255,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(64,196,255,0.2)', background: 'rgba(64,196,255,0.04)' }}>
          <div className="font-bold" style={{ color: '#c9d4e0' }}>Registrar Destete</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{servicio.id} · {servicio.nacidos?.vivos ?? '?'} nacidos vivos</div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <Campo label="Fecha de destete"><StyledInput type="date" value={fecha} onChange={setFecha} /></Campo>
          <Campo label="Total destetados *"><StyledInput type="number" value={destet} onChange={setDestet} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Machos"><StyledInput type="number" value={machos} onChange={setMachos} /></Campo>
            <Campo label="Hembras"><StyledInput type="number" value={hembras} onChange={setHembras} /></Campo>
          </div>
          <Campo label="Observaciones">
            <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Novedades del destete..." rows={2}
              style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical' }} />
          </Campo>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={confirmar} disabled={!valido}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: !valido ? 'rgba(64,196,255,0.05)' : 'rgba(64,196,255,0.15)', border: `1.5px solid ${!valido ? 'rgba(64,196,255,0.2)' : 'rgba(64,196,255,0.5)'}`, color: !valido ? '#4a5f7a' : '#40c4ff', cursor: !valido ? 'not-allowed' : 'pointer' }}>
              Registrar Destete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta de servicio ──────────────────────────────────────────────────────
function TarjetaServicio({ srv }) {
  const { tema } = useTheme()
  const [showPrenez,  setShowPrenez]  = useState(false)
  const [showParto,   setShowParto]   = useState(false)
  const [showDestete, setShowDestete] = useState(false)

  const etapa = !srv.confirmacionPrenez ? 'servicio'
    : !srv.fechaPartoReal ? 'gestacion'
    : !srv.destete ? 'lactancia'
    : 'completo'

  const etapaColor = { servicio: ACCENT, gestacion: '#ce93d8', lactancia: '#40c4ff', completo: '#00e676' }[etapa]
  const etapaLabel = { servicio: 'Post-servicio', gestacion: 'En gestación', lactancia: 'En lactancia', completo: 'Completo' }[etapa]

  const diasParto = srv.fechaPartoProbable && !srv.fechaPartoReal ? diasHasta(srv.fechaPartoProbable) : null
  const partoRetrasado = diasParto !== null && diasParto < 0
  const diasLactancia  = srv.fechaPartoReal && !srv.destete ? diasDesde(srv.fechaPartoReal) : null
  const fechaDestetePrev = srv.fechaPartoReal && !srv.destete ? addDias(srv.fechaPartoReal, DESTETE_DIAS_CONEJO) : null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${etapaColor}30` }}>
      <div className="flex items-center gap-3 px-5 py-3" style={{ background: `${etapaColor}06`, borderBottom: `1px solid ${etapaColor}20` }}>
        <div className="font-mono font-bold text-sm" style={{ color: etapaColor }}>{srv.id}</div>
        <div className="text-xs" style={{ color: tema.textMuted }}>
          ♂ {srv.machoId} × ♀ {srv.hembraId}
        </div>
        <div className="ml-auto">
          <Badge color={etapaColor}>{etapaLabel}</Badge>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
          <div>
            <div style={{ color: tema.textMuted }}>Servicio</div>
            <div className="font-medium" style={{ color: tema.textPrimary }}>{fmt(srv.fechaServicio)}</div>
          </div>
          <div>
            <div style={{ color: tema.textMuted }}>Preñez</div>
            <div className="font-medium" style={{ color: !srv.confirmacionPrenez ? tema.textMuted : srv.confirmacionPrenez.resultado === 'positivo' ? '#00e676' : '#ff6b80' }}>
              {!srv.confirmacionPrenez ? 'Pendiente' : srv.confirmacionPrenez.resultado}
            </div>
          </div>
          <div>
            <div style={{ color: tema.textMuted }}>Parto {srv.fechaPartoReal ? 'real' : 'probable'}</div>
            <div className="font-medium" style={{ color: partoRetrasado ? '#ff6b80' : tema.textPrimary }}>
              {fmt(srv.fechaPartoReal ?? srv.fechaPartoProbable)}
              {diasParto !== null && !srv.fechaPartoReal && (
                <span style={{ color: partoRetrasado ? '#ff6b80' : tema.textMuted, marginLeft: 4 }}>
                  ({partoRetrasado ? `${Math.abs(diasParto)}d retrasado` : `en ${diasParto}d`})
                </span>
              )}
            </div>
          </div>
          <div>
            <div style={{ color: tema.textMuted }}>Nacidos / Destetados</div>
            <div className="font-medium" style={{ color: tema.textPrimary }}>
              {srv.nacidos ? srv.nacidos.vivos : '—'} / {srv.destete ? srv.destete.destetados : '—'}
            </div>
          </div>
        </div>

        {diasLactancia !== null && (
          <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: 'rgba(64,196,255,0.08)', border: '1px solid rgba(64,196,255,0.25)' }}>
            <span style={{ color: '#40c4ff', fontWeight: 700 }}>Lactancia: </span>
            <span style={{ color: tema.textSecondary }}>Día {diasLactancia} · Destete previsto {fmt(fechaDestetePrev)}</span>
          </div>
        )}

        {partoRetrasado && !srv.fechaPartoReal && (
          <div className="rounded-lg px-3 py-2 mb-3 text-xs" style={{ background: 'rgba(255,107,128,0.08)', border: '1px solid rgba(255,107,128,0.3)' }}>
            <span style={{ color: '#ff6b80', fontWeight: 700 }}>⚠ Parto retrasado: </span>
            <span style={{ color: tema.textSecondary }}>{Math.abs(diasParto)} días sobre fecha probable. Requiere evaluación.</span>
          </div>
        )}

        {srv.observaciones && <div className="text-xs mb-3 italic" style={{ color: tema.textMuted }}>{srv.observaciones}</div>}

        <div className="flex gap-2 flex-wrap">
          {!srv.confirmacionPrenez && (
            <button onClick={() => setShowPrenez(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}40`, color: ACCENT, cursor: 'pointer' }}>
              Confirmar preñez
            </button>
          )}
          {srv.confirmacionPrenez && !srv.fechaPartoReal && (
            <button onClick={() => setShowParto(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.4)', color: '#00e676', cursor: 'pointer' }}>
              Registrar parto
            </button>
          )}
          {srv.fechaPartoReal && !srv.destete && (
            <button onClick={() => setShowDestete(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(64,196,255,0.12)', border: '1px solid rgba(64,196,255,0.4)', color: '#40c4ff', cursor: 'pointer' }}>
              Registrar destete
            </button>
          )}
          {etapa === 'completo' && (
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ color: '#00e676', opacity: 0.7 }}>✓ Ciclo completo</span>
          )}
        </div>
      </div>

      {showPrenez  && <ModalConfirmarPrenez servicio={srv} onClose={() => setShowPrenez(false)} />}
      {showParto   && <ModalParto           servicio={srv} onClose={() => setShowParto(false)} />}
      {showDestete && <ModalDestete         servicio={srv} onClose={() => setShowDestete(false)} />}
    </div>
  )
}

// ── Tab principal ────────────────────────────────────────────────────────────
export default function ReproduccionTab() {
  const { tema } = useTheme()
  const { datos } = useConejo()
  const [showNuevo, setShowNuevo] = useState(false)
  const [verTodos,  setVerTodos]  = useState(false)

  const { servicios } = datos
  const activos   = servicios.filter(s => !s.destete)
  const completos = servicios.filter(s => s.destete)
  const enGest    = activos.filter(s => s.confirmacionPrenez?.resultado === 'positivo' && !s.fechaPartoReal)
  const partos    = servicios.filter(s => s.fechaPartoReal)

  const totalNacidos    = partos.reduce((s, sv) => s + (sv.nacidos?.vivos ?? 0), 0)
  const totalDestetados = completos.reduce((s, sv) => s + (sv.destete?.destetados ?? 0), 0)
  const tasaDestete     = totalNacidos > 0 ? ((totalDestetados / totalNacidos) * 100).toFixed(0) : '—'

  const mostrados = verTodos ? [...servicios].reverse() : activos.length > 0 ? [...activos].reverse() : [...completos].slice(-3).reverse()

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { v: servicios.length, l: 'Total servicios',  color: ACCENT },
          { v: enGest.length,    l: 'En gestación',     color: '#ce93d8' },
          { v: partos.length,    l: 'Partos realizados',color: '#00e676' },
          { v: totalNacidos,     l: 'Nacidos vivos',    color: '#40c4ff' },
          { v: `${tasaDestete}${tasaDestete !== '—' ? '%' : ''}`, l: 'Tasa de destete', color: '#00e676' },
        ].map(({ v, l, color }) => (
          <div key={l} className="rounded-xl px-4 py-3 text-center" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="font-mono font-bold text-2xl" style={{ color }}>{v}</div>
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <button onClick={() => setShowNuevo(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}50`, color: ACCENT, cursor: 'pointer' }}>
          + Registrar servicio
        </button>
        <button onClick={() => setVerTodos(v => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted, cursor: 'pointer' }}>
          {verTodos ? 'Ver activos' : `Ver historial (${completos.length})`}
        </button>
        <div className="text-xs font-mono ml-auto" style={{ color: tema.textMuted }}>
          {verTodos ? `${servicios.length} servicios` : `${activos.length} activos`}
        </div>
      </div>

      {mostrados.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: tema.textMuted }}>Sin servicios registrados.</div>
      ) : (
        <div className="space-y-4">
          {mostrados.map(s => <TarjetaServicio key={s.id} srv={s} />)}
        </div>
      )}

      {showNuevo && <ModalNuevoServicio onClose={() => setShowNuevo(false)} />}
    </div>
  )
}
