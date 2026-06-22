import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useICIVET, ESPECIES_CONFIG, TIPOS_MOVIMIENTO } from '../context/ICIVETContext'
import FichaAnimalICIVET from './FichaAnimalICIVET'
import RegistroActividades from './RegistroActividades'

// ── Utilidades ────────────────────────────────────────────────────────────────
function edadAprox(fechaNacimiento) {
  if (!fechaNacimiento) return '—'
  const dias = Math.round((Date.now() - new Date(fechaNacimiento + 'T00:00:00')) / 86400000)
  if (dias < 30)  return `${dias}d`
  if (dias < 90)  return `${Math.floor(dias / 7)} sem`
  return `${Math.floor(dias / 30)} meses`
}
function mesActual() { return new Date().toISOString().slice(0, 7) }
function esIngreso(tipo) { return tipo === 'ingreso_produccion' || tipo === 'ingreso_manual' }

// ── Componentes base ──────────────────────────────────────────────────────────
function Badge({ children, color = '#8a9bb0' }) {
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}18`, border: `1px solid ${color}50`, color }}>
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

// ── Campo / Input genéricos ───────────────────────────────────────────────────
function Campo({ label, children }) {
  const { tema } = useTheme()
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>{label}</label>
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
function InputNum({ value, onChange, min = 0, max, placeholder }) {
  const { tema } = useTheme()
  return (
    <input type="number" min={min} max={max} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
      style={{ background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary }} />
  )
}
function Select({ value, onChange, children }) {
  const { tema } = useTheme()
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
      style={{ background: 'rgba(8,13,26,0.95)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textPrimary }}>
      {children}
    </select>
  )
}

// ── Modal genérico ────────────────────────────────────────────────────────────
function Modal({ titulo, subtitulo, onClose, children, accentColor = '#00e676' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0a1020', border: `1.5px solid ${accentColor}40`, maxHeight: '90vh', overflowY: 'auto' }}
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
function BotonesModal({ onCancel, onConfirm, disabled, labelConfirm = 'Confirmar', color = '#00e676' }) {
  return (
    <div className="flex gap-3 pt-1">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>
        Cancelar
      </button>
      <button onClick={onConfirm} disabled={disabled} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
        style={{ background: disabled ? `${color}08` : `${color}18`, border: `1.5px solid ${disabled ? color + '20' : color + '50'}`, color: disabled ? '#4a5f7a' : color, cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {labelConfirm}
      </button>
    </div>
  )
}

// ── Modal: Ingreso manual ─────────────────────────────────────────────────────
function ModalIngreso({ especieId, cfg, onClose }) {
  const { crearJaulaStock } = useICIVET()
  const [codigo,   setCodigo]   = useState('')
  const [sexo,     setSexo]     = useState('macho')
  const [cantidad, setCantidad] = useState('')
  const [fechaIng, setFechaIng] = useState(new Date().toISOString().split('T')[0])
  const [fechaNac, setFechaNac] = useState('')
  const [obs,      setObs]      = useState('')

  const valido = codigo.trim() && cantidad && parseInt(cantidad) > 0

  function confirmar() {
    if (!valido) return
    const ts = Date.now()
    const jId = codigo.trim()
    crearJaulaStock(especieId, {
      id: jId, codigo: jId, cepa: cfg.nombre, sexo,
      cantidadActual: parseInt(cantidad), fechaIngreso: fechaIng,
      fechaNacimiento: fechaNac || null, origenId: null, origenTipo: 'manual',
      observaciones: obs.trim(), estado: 'activo',
    }, {
      id: `MOV-${ts}`, tipo: 'ingreso_manual', fecha: fechaIng,
      cantidad: parseInt(cantidad), sexo, cepa: cfg.nombre, jaulaId: jId,
      investigador: '', proyecto: '', motivo: 'Ingreso manual', observaciones: obs.trim(),
    })
    onClose()
  }

  return (
    <Modal titulo="Ingreso manual de animales" subtitulo={cfg.nombre} onClose={onClose} accentColor={cfg.color}>
      <Campo label="Código de jaula"><InputText value={codigo} onChange={setCodigo} placeholder="Ej: JAU-S-W-003" /></Campo>
      <Campo label="Sexo">
        <Select value={sexo} onChange={setSexo}>
          <option value="macho">♂ Macho</option>
          <option value="hembra">♀ Hembra</option>
        </Select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Cantidad"><InputNum value={cantidad} onChange={setCantidad} min={1} placeholder="0" /></Campo>
        <Campo label="Fecha de ingreso"><InputText type="date" value={fechaIng} onChange={setFechaIng} /></Campo>
      </div>
      <Campo label="Fecha de nacimiento (opcional)"><InputText type="date" value={fechaNac} onChange={setFechaNac} /></Campo>
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Opcional" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabled={!valido} labelConfirm="Registrar ingreso" color={cfg.color} />
    </Modal>
  )
}

// ── Modal: Entrega / Venta / Donación ─────────────────────────────────────────
function ModalEntrega({ especieId, cfg, stock, onClose }) {
  const { registrarMovimientoStock } = useICIVET()
  const [tipo,     setTipo]     = useState('entrega')
  const [jaulaId,  setJaulaId]  = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fecha,    setFecha]    = useState(new Date().toISOString().split('T')[0])
  const [invest,   setInvest]   = useState('')
  const [proyecto, setProyecto] = useState('')
  const [obs,      setObs]      = useState('')

  const jaulas  = stock.jaulas.filter(j => j.estado === 'activo' && j.cantidadActual > 0)
  const jaula   = jaulas.find(j => j.id === jaulaId)
  const cant    = parseInt(cantidad) || 0
  const maxCant = jaula?.cantidadActual ?? 0
  const valido  = jaulaId && cant > 0 && cant <= maxCant

  function confirmar() {
    if (!valido) return
    const ts = Date.now()
    registrarMovimientoStock(especieId, {
      id: `MOV-${ts}`, tipo, fecha, cantidad: cant,
      sexo: jaula.sexo, cepa: jaula.cepa, jaulaId,
      investigador: invest.trim(), proyecto: proyecto.trim(),
      motivo: '', observaciones: obs.trim(),
    }, jaulaId, -cant)
    onClose()
  }

  return (
    <Modal titulo="Registrar salida de animales" subtitulo={cfg.nombre} onClose={onClose} accentColor="#ffb300">
      <Campo label="Tipo de salida">
        <Select value={tipo} onChange={setTipo}>
          <option value="entrega">Entrega para experimentación</option>
          <option value="venta">Venta</option>
          <option value="donacion">Donación</option>
        </Select>
      </Campo>
      <Campo label="Jaula de origen">
        <Select value={jaulaId} onChange={setJaulaId}>
          <option value="">— Seleccionar —</option>
          {jaulas.map(j => (
            <option key={j.id} value={j.id}>{j.codigo} · {j.sexo === 'macho' ? '♂' : '♀'} · {j.cantidadActual} disponibles</option>
          ))}
        </Select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label={`Cantidad (máx. ${maxCant})`}><InputNum value={cantidad} onChange={setCantidad} min={1} max={maxCant} /></Campo>
        <Campo label="Fecha"><InputText type="date" value={fecha} onChange={setFecha} /></Campo>
      </div>
      <Campo label="Investigador / Solicitante"><InputText value={invest} onChange={setInvest} placeholder="Nombre del solicitante" /></Campo>
      <Campo label="Proyecto / Protocolo"><InputText value={proyecto} onChange={setProyecto} placeholder="Ej: Protocolo EXP-2026-05" /></Campo>
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Opcional" /></Campo>
      {jaulaId && cant > maxCant && (
        <div className="rounded-lg px-3 py-2 text-xs text-center" style={{ background: 'rgba(255,61,87,0.08)', border: '1px solid rgba(255,61,87,0.3)', color: '#ff6b80' }}>
          Cantidad supera el stock disponible ({maxCant})
        </div>
      )}
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabled={!valido} labelConfirm="Confirmar salida" color="#ffb300" />
    </Modal>
  )
}

// ── Modal: Baja ───────────────────────────────────────────────────────────────
function ModalBaja({ especieId, cfg, stock, onClose }) {
  const { registrarMovimientoStock } = useICIVET()
  const [tipo,     setTipo]     = useState('baja_muerte')
  const [jaulaId,  setJaulaId]  = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fecha,    setFecha]    = useState(new Date().toISOString().split('T')[0])
  const [obs,      setObs]      = useState('')

  const jaulas  = stock.jaulas.filter(j => j.estado === 'activo' && j.cantidadActual > 0)
  const jaula   = jaulas.find(j => j.id === jaulaId)
  const cant    = parseInt(cantidad) || 0
  const maxCant = jaula?.cantidadActual ?? 0
  const valido  = jaulaId && cant > 0 && cant <= maxCant

  function confirmar() {
    if (!valido) return
    const ts = Date.now()
    registrarMovimientoStock(especieId, {
      id: `MOV-${ts}`, tipo, fecha, cantidad: cant,
      sexo: jaula?.sexo ?? '', cepa: jaula?.cepa ?? cfg.nombre, jaulaId,
      investigador: '', proyecto: '',
      motivo: TIPOS_MOVIMIENTO[tipo]?.label ?? tipo, observaciones: obs.trim(),
    }, jaulaId, -cant)
    onClose()
  }

  return (
    <Modal titulo="Registrar baja" subtitulo={cfg.nombre} onClose={onClose} accentColor="#ff3d57">
      <Campo label="Motivo">
        <Select value={tipo} onChange={setTipo}>
          <option value="baja_muerte">Muerte natural</option>
          <option value="baja_sacrificio">Sacrificio</option>
          <option value="baja_sanitaria">Baja sanitaria</option>
          <option value="correccion">Corrección de inventario</option>
        </Select>
      </Campo>
      <Campo label="Jaula">
        <Select value={jaulaId} onChange={setJaulaId}>
          <option value="">— Seleccionar —</option>
          {jaulas.map(j => (
            <option key={j.id} value={j.id}>{j.codigo} · {j.sexo === 'macho' ? '♂' : '♀'} · {j.cantidadActual} disponibles</option>
          ))}
        </Select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label={`Cantidad (máx. ${maxCant})`}><InputNum value={cantidad} onChange={setCantidad} min={1} max={maxCant} /></Campo>
        <Campo label="Fecha"><InputText type="date" value={fecha} onChange={setFecha} /></Campo>
      </div>
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Detalle adicional" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabled={!valido} labelConfirm="Registrar baja" color="#ff3d57" />
    </Modal>
  )
}

// ── Modal: Transferencia entre jaulas ────────────────────────────────────────
function ModalTransferencia({ especieId, cfg, stock, onClose }) {
  const { registrarTransferenciaStock } = useICIVET()
  const [desdeId,  setDesdeId]  = useState('')
  const [hastaId,  setHastaId]  = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fecha,    setFecha]    = useState(new Date().toISOString().split('T')[0])
  const [obs,      setObs]      = useState('')

  const activas = stock.jaulas.filter(j => j.estado === 'activo')
  const origen  = activas.find(j => j.id === desdeId)
  const cant    = parseInt(cantidad) || 0
  const valido  = desdeId && hastaId && desdeId !== hastaId && cant > 0 && cant <= (origen?.cantidadActual ?? 0)

  function confirmar() {
    if (!valido) return
    const ts   = Date.now()
    const dest = activas.find(j => j.id === hastaId)
    registrarTransferenciaStock(especieId, {
      id: `MOV-${ts}A`, tipo: 'transferencia', fecha, cantidad: cant,
      sexo: origen?.sexo ?? '', cepa: origen?.cepa ?? '', jaulaId: desdeId,
      investigador: '', proyecto: '', motivo: `Transferencia hacia ${hastaId}`, observaciones: obs.trim(),
    }, {
      id: `MOV-${ts}B`, tipo: 'transferencia', fecha, cantidad: cant,
      sexo: dest?.sexo ?? '', cepa: dest?.cepa ?? '', jaulaId: hastaId,
      investigador: '', proyecto: '', motivo: `Transferencia desde ${desdeId}`, observaciones: obs.trim(),
    }, desdeId, hastaId, cant)
    onClose()
  }

  return (
    <Modal titulo="Transferencia entre jaulas" subtitulo={cfg.nombre} onClose={onClose} accentColor="#8a9bb0">
      <Campo label="Jaula de origen">
        <Select value={desdeId} onChange={setDesdeId}>
          <option value="">— Seleccionar —</option>
          {activas.filter(j => j.cantidadActual > 0).map(j => (
            <option key={j.id} value={j.id}>{j.codigo} · {j.sexo === 'macho' ? '♂' : '♀'} · {j.cantidadActual} disponibles</option>
          ))}
        </Select>
      </Campo>
      <Campo label="Jaula de destino">
        <Select value={hastaId} onChange={setHastaId}>
          <option value="">— Seleccionar —</option>
          {activas.filter(j => j.id !== desdeId).map(j => (
            <option key={j.id} value={j.id}>{j.codigo} · {j.sexo === 'macho' ? '♂' : '♀'} · {j.cantidadActual} actuales</option>
          ))}
        </Select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label={`Cantidad (máx. ${origen?.cantidadActual ?? 0})`}><InputNum value={cantidad} onChange={setCantidad} min={1} max={origen?.cantidadActual} /></Campo>
        <Campo label="Fecha"><InputText type="date" value={fecha} onChange={setFecha} /></Campo>
      </div>
      <Campo label="Observaciones"><InputText value={obs} onChange={setObs} placeholder="Opcional" /></Campo>
      <BotonesModal onCancel={onClose} onConfirm={confirmar} disabled={!valido} labelConfirm="Confirmar transferencia" color="#8a9bb0" />
    </Modal>
  )
}

// ── Tarjeta de Jaula de Stock ─────────────────────────────────────────────────
function TarjetaJaula({ jaula, cfg, tema, onEntrega, onBaja }) {
  const vacía  = jaula.cantidadActual === 0
  const sexCol = jaula.sexo === 'macho' ? '#40c4ff' : '#ce93d8'
  const sexSim = jaula.sexo === 'macho' ? '♂' : '♀'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${vacía ? tema.bgCardBorde : cfg.colorBorde}`, opacity: vacía ? 0.6 : 1 }}>
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
        style={{ background: 'rgba(8,13,26,0.5)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{jaula.codigo}</span>
          <Badge color={sexCol}>{sexSim} {jaula.sexo === 'macho' ? 'Macho' : 'Hembra'}</Badge>
          {vacía ? <Badge color="#8a9bb0">Vacía</Badge> : <Badge color="#00e676">● Disponible</Badge>}
        </div>
        {!vacía && (
          <div className="flex gap-2">
            <button onClick={onEntrega} className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.4)', color: '#ffb300', cursor: 'pointer' }}>
              ↗ Salida
            </button>
            <button onClick={onBaja} className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,61,87,0.08)', border: '1px solid rgba(255,61,87,0.3)', color: '#ff6b80', cursor: 'pointer' }}>
              − Baja
            </button>
          </div>
        )}
      </div>
      <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Disponibles</div>
          <div className="font-mono font-bold text-2xl" style={{ color: vacía ? tema.textMuted : sexCol }}>
            {sexSim} {jaula.cantidadActual}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Cepa</div>
          <div className="text-sm font-semibold" style={{ color: tema.textSecondary }}>{jaula.cepa}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Ingreso</div>
          <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>{jaula.fechaIngreso}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Edad aprox.</div>
          <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>
            {jaula.fechaNacimiento ? edadAprox(jaula.fechaNacimiento) : '—'}
          </div>
        </div>
      </div>
      {jaula.origenId && (
        <div className="px-4 pb-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', color: '#00e676' }}>
            ← {jaula.origenTipo === 'produccion' ? 'Producción' : 'Manual'}: {jaula.origenId}
          </span>
        </div>
      )}
      {jaula.observaciones && (
        <div className="px-4 pb-3">
          <div className="rounded-lg px-3 py-2 text-xs"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted }}>
            📝 {jaula.observaciones}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fila de Movimiento ────────────────────────────────────────────────────────
function FilaMovimiento({ mov, tema, isFirst }) {
  const tcfg     = TIPOS_MOVIMIENTO[mov.tipo] ?? { label: mov.tipo, color: '#8a9bb0', signo: '?' }
  const sexCol   = mov.sexo === 'macho' ? '#40c4ff' : '#ce93d8'
  const signoCol = esIngreso(mov.tipo) ? '#00e676' : '#ff6b80'

  return (
    <tr style={{ borderTop: isFirst ? 'none' : `1px solid ${tema.bgCardBorde}` }}>
      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: tema.textMuted, whiteSpace: 'nowrap' }}>{mov.fecha}</td>
      <td className="px-4 py-2.5">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: `${tcfg.color}14`, border: `1px solid ${tcfg.color}35`, color: tcfg.color }}>
          {tcfg.label}
        </span>
      </td>
      <td className="px-4 py-2.5 font-mono font-bold text-sm" style={{ color: signoCol, whiteSpace: 'nowrap' }}>
        {tcfg.signo}{mov.cantidad}
      </td>
      <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: sexCol, whiteSpace: 'nowrap' }}>
        {mov.sexo === 'macho' ? '♂' : '♀'} {mov.sexo}
      </td>
      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: tema.textMuted }}>{mov.jaulaId}</td>
      <td className="px-4 py-2.5">
        {mov.investigador && <div className="text-xs font-semibold" style={{ color: tema.textSecondary }}>{mov.investigador}</div>}
        {mov.proyecto && <div className="text-xs" style={{ color: tema.textMuted }}>{mov.proyecto}</div>}
        {!mov.investigador && mov.motivo && <div className="text-xs" style={{ color: tema.textMuted }}>{mov.motivo}</div>}
        {mov.observaciones && <div className="text-xs italic" style={{ color: tema.textMuted, opacity: 0.7 }}>{mov.observaciones}</div>}
      </td>
    </tr>
  )
}

// ── Tab: Inicio ───────────────────────────────────────────────────────────────
function TabInicio({ stock, cfg, tema, onIrJaulas, onIrMovimientos }) {
  const { jaulas, movimientos } = stock
  const mes = mesActual()

  const totalDisp = jaulas.reduce((a, j) => a + j.cantidadActual, 0)
  const totalM    = jaulas.filter(j => j.sexo === 'macho').reduce((a, j) => a + j.cantidadActual, 0)
  const totalH    = jaulas.filter(j => j.sexo === 'hembra').reduce((a, j) => a + j.cantidadActual, 0)
  const jActivas  = jaulas.filter(j => j.cantidadActual > 0).length
  const ingMes    = movimientos.filter(m => m.fecha.startsWith(mes) && esIngreso(m.tipo)).reduce((a, m) => a + m.cantidad, 0)
  const egrMes    = movimientos.filter(m => m.fecha.startsWith(mes) && !esIngreso(m.tipo)).reduce((a, m) => a + m.cantidad, 0)

  const recientes = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI valor={totalDisp} label="Total disponibles" color={cfg.color} />
        <KPI valor={totalM}    label="Machos"            color="#40c4ff" />
        <KPI valor={totalH}    label="Hembras"           color="#ce93d8" />
        <KPI valor={jActivas}  label="Jaulas con stock"  color="#8a9bb0" />
        <KPI valor={ingMes}    label="Ingresos del mes"  color="#00e676" sub={mes} />
        <KPI valor={egrMes}    label="Egresos del mes"   color="#ff6b80" sub={mes} />
      </div>

      {/* Resumen por sexo */}
      <div className="rounded-2xl overflow-hidden" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${tema.bgCardBorde}`, background: 'rgba(8,13,26,0.4)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>Resumen de stock — {cfg.nombre}</span>
        </div>
        {jaulas.length === 0 ? (
          <div className="px-5 py-6 text-sm text-center" style={{ color: tema.textMuted }}>
            Sin animales en stock. Los animales ingresarán automáticamente desde Producción al completar la selección.
          </div>
        ) : (
          <div className="px-5 py-4">
            {['macho', 'hembra'].map(s => {
              const js = jaulas.filter(j => j.sexo === s)
              if (js.length === 0) return null
              const tot = js.reduce((a, j) => a + j.cantidadActual, 0)
              return (
                <div key={s} className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base" style={{ color: s === 'macho' ? '#40c4ff' : '#ce93d8' }}>
                      {s === 'macho' ? '♂' : '♀'} {s === 'macho' ? 'Machos' : 'Hembras'}
                    </span>
                    <span className="text-xs" style={{ color: tema.textMuted }}>{js.length} jaula{js.length !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="font-mono font-bold text-xl" style={{ color: s === 'macho' ? '#40c4ff' : '#ce93d8' }}>{tot}</span>
                </div>
              )
            })}
            <div className="flex items-center justify-between pt-3">
              <span className="font-semibold text-sm" style={{ color: tema.textSecondary }}>Total disponible</span>
              <span className="font-mono font-bold text-2xl" style={{ color: cfg.color }}>{totalDisp}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actividad reciente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold" style={{ color: tema.textSecondary }}>Actividad reciente</h4>
          {movimientos.length > 5 && (
            <button onClick={onIrMovimientos} className="text-xs font-semibold"
              style={{ color: cfg.color, background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver todos →
            </button>
          )}
        </div>
        {recientes.length === 0 ? (
          <div className="text-sm" style={{ color: tema.textMuted }}>Sin movimientos registrados aún.</div>
        ) : (
          <div className="space-y-2">
            {recientes.map(mov => {
              const tcfg     = TIPOS_MOVIMIENTO[mov.tipo] ?? { label: mov.tipo, color: '#8a9bb0', signo: '?' }
              const signoCol = esIngreso(mov.tipo) ? '#00e676' : '#ff6b80'
              return (
                <div key={mov.id} className="rounded-xl px-4 py-2.5 flex items-center gap-3"
                  style={{ background: tema.bgCard, border: `1px solid ${tcfg.color}20` }}>
                  <span className="font-mono font-bold text-base w-5 text-center flex-shrink-0" style={{ color: signoCol }}>{tcfg.signo}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold" style={{ color: tcfg.color }}>{tcfg.label}</span>
                    {mov.investigador && <span className="text-xs ml-2" style={{ color: tema.textMuted }}>— {mov.investigador}</span>}
                    {!mov.investigador && mov.motivo && <span className="text-xs ml-2" style={{ color: tema.textMuted }}>— {mov.motivo}</span>}
                  </div>
                  <span className="font-mono font-bold flex-shrink-0" style={{ color: mov.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>
                    {mov.sexo === 'macho' ? '♂' : '♀'} {mov.cantidad}
                  </span>
                  <span className="font-mono text-xs flex-shrink-0" style={{ color: tema.textMuted }}>{mov.fecha}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Jaulas rápido */}
      {jaulas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold" style={{ color: tema.textSecondary }}>Jaulas ({jaulas.length})</h4>
            <button onClick={onIrJaulas} className="text-xs font-semibold"
              style={{ color: cfg.color, background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver todas →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {jaulas.map(j => {
              const sexCol = j.sexo === 'macho' ? '#40c4ff' : '#ce93d8'
              return (
                <div key={j.id} className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: tema.bgCard, border: `1px solid ${j.cantidadActual > 0 ? cfg.colorBorde : tema.bgCardBorde}` }}>
                  <div className="font-mono font-bold text-2xl flex-shrink-0" style={{ color: j.cantidadActual > 0 ? sexCol : tema.textMuted }}>
                    {j.sexo === 'macho' ? '♂' : '♀'} {j.cantidadActual}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-bold text-xs truncate" style={{ color: cfg.color }}>{j.codigo}</div>
                    <div className="text-xs" style={{ color: tema.textMuted }}>Ingreso {j.fechaIngreso}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab: Jaulas ───────────────────────────────────────────────────────────────
function TabJaulas({ stock, cfg, tema, onEntrega, onBaja }) {
  const [filtroSexo,   setFiltroSexo]   = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('activo')

  const jaulas = useMemo(() => stock.jaulas.filter(j => {
    if (filtroSexo   !== 'todos'  && j.sexo !== filtroSexo)       return false
    if (filtroEstado === 'activo' && j.cantidadActual <= 0)        return false
    if (filtroEstado === 'vacia'  && j.cantidadActual > 0)         return false
    return true
  }), [stock.jaulas, filtroSexo, filtroEstado])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Jaulas de stock</h3>
        <div className="flex gap-1 ml-auto flex-wrap">
          {[['todos','Todos'],['macho','♂ Machos'],['hembra','♀ Hembras']].map(([v,l]) => (
            <button key={v} onClick={() => setFiltroSexo(v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: filtroSexo === v ? `${cfg.color}18` : 'transparent', border: `1px solid ${filtroSexo === v ? cfg.color + '50' : tema.bgCardBorde}`, color: filtroSexo === v ? cfg.color : tema.textMuted, cursor: 'pointer' }}>
              {l}
            </button>
          ))}
          {[['activo','Con stock'],['vacia','Vacías'],['todos','Todas']].map(([v,l]) => (
            <button key={v} onClick={() => setFiltroEstado(v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: filtroEstado === v ? 'rgba(138,155,176,0.15)' : 'transparent', border: `1px solid ${filtroEstado === v ? 'rgba(138,155,176,0.4)' : tema.bgCardBorde}`, color: filtroEstado === v ? '#8a9bb0' : tema.textMuted, cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {jaulas.length === 0 ? (
        <div className="text-center py-10" style={{ color: tema.textMuted }}>
          {stock.jaulas.length === 0
            ? 'No hay jaulas de stock. Los animales ingresarán automáticamente desde Producción, o podés registrar un ingreso manual.'
            : 'Ninguna jaula coincide con los filtros aplicados.'}
        </div>
      ) : (
        <div className="space-y-4">
          {jaulas.map(j => (
            <TarjetaJaula key={j.id} jaula={j} cfg={cfg} tema={tema}
              onEntrega={onEntrega} onBaja={onBaja} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Movimientos ──────────────────────────────────────────────────────────
function TabMovimientos({ stock, cfg, tema }) {
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroSexo, setFiltroSexo] = useState('todos')

  const movimientos = useMemo(() => {
    return [...stock.movimientos]
      .filter(m => {
        if (filtroTipo === 'ingresos' && !esIngreso(m.tipo))   return false
        if (filtroTipo === 'salidas'  && esIngreso(m.tipo))    return false
        if (filtroSexo !== 'todos'   && m.sexo !== filtroSexo) return false
        return true
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [stock.movimientos, filtroTipo, filtroSexo])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Registro de movimientos</h3>
        <div className="flex gap-1 ml-auto flex-wrap">
          {[['todos','Todos'],['ingresos','Ingresos'],['salidas','Salidas']].map(([v,l]) => (
            <button key={v} onClick={() => setFiltroTipo(v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: filtroTipo === v ? `${cfg.color}18` : 'transparent', border: `1px solid ${filtroTipo === v ? cfg.color + '50' : tema.bgCardBorde}`, color: filtroTipo === v ? cfg.color : tema.textMuted, cursor: 'pointer' }}>
              {l}
            </button>
          ))}
          {[['todos','♂♀ Todos'],['macho','♂ Machos'],['hembra','♀ Hembras']].map(([v,l]) => (
            <button key={v} onClick={() => setFiltroSexo(v)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: filtroSexo === v ? 'rgba(138,155,176,0.15)' : 'transparent', border: `1px solid ${filtroSexo === v ? 'rgba(138,155,176,0.4)' : tema.bgCardBorde}`, color: filtroSexo === v ? '#8a9bb0' : tema.textMuted, cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="text-center py-10" style={{ color: tema.textMuted }}>
          {stock.movimientos.length === 0 ? 'Sin movimientos registrados aún.' : 'Ningún movimiento coincide con los filtros.'}
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
          <table className="w-full" style={{ minWidth: '640px' }}>
            <thead>
              <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
                {['Fecha','Tipo','Cant.','Sexo','Jaula','Detalle'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov, i) => <FilaMovimiento key={mov.id} mov={mov} tema={tema} isFirst={i === 0} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab: Entregas ─────────────────────────────────────────────────────────────
function TabEntregas({ stock, cfg, tema }) {
  const tiposEntrega = ['entrega', 'venta', 'donacion']
  const entregas = useMemo(() =>
    [...stock.movimientos]
      .filter(m => tiposEntrega.includes(m.tipo))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  , [stock.movimientos])

  const totalEntregado = entregas.reduce((a, m) => a + m.cantidad, 0)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Entregas registradas</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.4)', color: '#ffb300' }}>
          {totalEntregado} animales entregados en total
        </span>
      </div>

      {entregas.length === 0 ? (
        <div className="text-center py-10" style={{ color: tema.textMuted }}>Sin entregas registradas aún.</div>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
          <table className="w-full" style={{ minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
                {['Fecha','Tipo','Cant.','Sexo','Jaula','Investigador','Proyecto','Observaciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entregas.map((m, i) => {
                const tcfg = TIPOS_MOVIMIENTO[m.tipo] ?? { label: m.tipo, color: '#ffb300' }
                return (
                  <tr key={m.id} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: tema.textMuted, whiteSpace: 'nowrap' }}>{m.fecha}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: `${tcfg.color}14`, border: `1px solid ${tcfg.color}35`, color: tcfg.color }}>
                        {tcfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-sm" style={{ color: '#ffb300' }}>{m.cantidad}</td>
                    <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: m.sexo === 'macho' ? '#40c4ff' : '#ce93d8', whiteSpace: 'nowrap' }}>
                      {m.sexo === 'macho' ? '♂' : '♀'} {m.sexo}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: tema.textMuted }}>{m.jaulaId}</td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: tema.textSecondary }}>{m.investigador || '—'}</td>
                    <td className="px-4 py-2.5 text-xs max-w-xs" style={{ color: tema.textMuted }}>{m.proyecto || '—'}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: tema.textMuted }}>{m.observaciones || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab: Transferidos ─────────────────────────────────────────────────────────
function TabTransferidosStock({ animales, historialEventos, cfg, tema, onFichaAnimal }) {
  const transferidos = (animales ?? []).filter(a =>
    a.destino === 'no_seleccionado' &&
    (historialEventos ?? []).some(e => e.animalId === a.id && e.tipo === 'transferencia_colonia' && e.coloniaDestino === 'Stock')
  )

  if (transferidos.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-10" style={{ color: tema.textMuted }}>
          No hay animales transferidos desde Producción en este stock.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Animales transferidos desde Producción</h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
          {transferidos.length} animal{transferidos.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs"
        style={{ background: `${cfg.color}06`, border: `1px solid ${cfg.color}20`, color: tema.textMuted }}>
        ℹ️ Estos animales fueron transferidos individualmente desde Producción. Conservan genealogía, fecha de nacimiento e historial.
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
              {['ID', 'Sexo', 'Nacimiento', 'Padre', 'Madre', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transferidos.map((a, i) => (
              <tr key={a.id} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-sm" style={{ color: cfg.color }}>{a.id}</span>
                </td>
                <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: a.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>
                  {a.sexo === 'macho' ? '♂' : '♀'} {a.sexo}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: tema.textMuted }}>{a.fechaNacimiento ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#40c4ff' }}>{a.padreId ? `♂ ${a.padreId}` : '—'}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#ce93d8' }}>{a.madreId ? `♀ ${a.madreId}` : '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onFichaAnimal?.(a.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}35`, color: cfg.color, cursor: 'pointer' }}>
                    Ver ficha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab: Actividades ──────────────────────────────────────────────────────────
function TabActividadesStock({ datos, especieId, cfg }) {
  const { registrarActividadColonia } = useICIVET()

  const actividadesAuto = useMemo(() => {
    return (datos.stock?.movimientos ?? []).map(mov => {
      const ti = TIPOS_MOVIMIENTO[mov.tipo]
      const sexoLabel = mov.sexo === 'macho' ? '♂' : '♀'
      let desc = `${ti?.label ?? mov.tipo}: ${sexoLabel} ${mov.cantidad} ${mov.cepa}.`
      if (mov.investigador) desc += ` Solicitante: ${mov.investigador}.`
      if (mov.proyecto)     desc += ` Protocolo: ${mov.proyecto}.`
      if (mov.motivo)       desc += ` ${mov.motivo}.`
      if (mov.observaciones) desc += ` ${mov.observaciones}.`
      return {
        id: `auto-stock-mov-${mov.id}`,
        fecha: mov.fecha, hora: '--',
        usuario: mov.investigador || 'Sistema',
        descripcion: desc,
        tipo: 'automatico',
        tag: mov.tipo.startsWith('ingreso') ? 'ingreso' : mov.tipo.startsWith('baja') ? 'baja' : 'salida',
      }
    })
  }, [datos.stock?.movimientos])

  return (
    <RegistroActividades
      actividadesManuales={datos.actividadesColonia?.stock ?? []}
      actividadesAuto={actividadesAuto}
      accentColor={cfg.color}
      coloniaLabel="Stock"
      onRegistrar={act => registrarActividadColonia(especieId, 'stock', act)}
    />
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
const TABS_STOCK = [
  { id: 'inicio',       label: 'Inicio' },
  { id: 'jaulas',       label: 'Jaulas' },
  { id: 'movimientos',  label: 'Movimientos' },
  { id: 'entregas',     label: 'Entregas' },
  { id: 'transferidos', label: 'Transferidos' },
  { id: 'actividades',  label: 'Actividades' },
]

export default function StockPage({ especieId }) {
  const { getDatosEspecie } = useICIVET()
  const { tema } = useTheme()
  const cfg   = ESPECIES_CONFIG[especieId]
  const datos = getDatosEspecie(especieId)

  const [tabActual,          setTabActual]          = useState('inicio')
  const [modalIngreso,       setModalIngreso]        = useState(false)
  const [modalEntrega,       setModalEntrega]        = useState(false)
  const [modalBaja,          setModalBaja]           = useState(false)
  const [modalTransferencia, setModalTransferencia]  = useState(false)
  const [fichaAnimalId,      setFichaAnimalId]       = useState(null)

  if (!cfg || !datos?.stock) {
    return <div className="p-6 text-center" style={{ color: tema.textMuted }}>Sin datos de stock.</div>
  }

  const stock = datos.stock

  return (
    <div className="min-h-full" style={{ background: tema.bgMain }}>
      {/* Modales */}
      {fichaAnimalId      && <FichaAnimalICIVET animalId={fichaAnimalId} especieId={especieId} onClose={() => setFichaAnimalId(null)} />}
      {modalIngreso       && <ModalIngreso       especieId={especieId} cfg={cfg} onClose={() => setModalIngreso(false)} />}
      {modalEntrega       && <ModalEntrega       especieId={especieId} cfg={cfg} stock={stock} onClose={() => setModalEntrega(false)} />}
      {modalBaja          && <ModalBaja          especieId={especieId} cfg={cfg} stock={stock} onClose={() => setModalBaja(false)} />}
      {modalTransferencia && <ModalTransferencia especieId={especieId} cfg={cfg} stock={stock} onClose={() => setModalTransferencia(false)} />}

      {/* Header */}
      <div className="px-4 md:px-6 pt-5 pb-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}` }}>
            📦
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: tema.textPrimary }}>Stock de Animales</h2>
            <p className="text-xs font-mono" style={{ color: tema.textMuted }}>
              {cfg.nombre} · Inventario disponible para entrega
            </p>
          </div>

          {/* Botones de acción */}
          <div className="ml-auto flex gap-2 flex-wrap justify-end">
            <button onClick={() => setModalTransferencia(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl"
              style={{ background: 'transparent', border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted, cursor: 'pointer' }}>
              ↔ Transferir
            </button>
            <button onClick={() => setModalBaja(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,61,87,0.06)', border: '1px solid rgba(255,61,87,0.25)', color: '#ff6b80', cursor: 'pointer' }}>
              − Baja
            </button>
            <button onClick={() => setModalEntrega(true)}
              className="text-xs font-bold px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.4)', color: '#ffb300', cursor: 'pointer' }}>
              ↗ Entrega
            </button>
            <button onClick={() => setModalIngreso(true)}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ background: cfg.colorDim, border: `1.5px solid ${cfg.colorBorde}`, color: cfg.color, cursor: 'pointer' }}>
              + Ingreso
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
          {TABS_STOCK.map(tab => {
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
      {tabActual === 'inicio'       && <TabInicio           stock={stock} cfg={cfg} tema={tema} onIrJaulas={() => setTabActual('jaulas')} onIrMovimientos={() => setTabActual('movimientos')} />}
      {tabActual === 'jaulas'       && <TabJaulas           stock={stock} cfg={cfg} tema={tema} onEntrega={() => setModalEntrega(true)} onBaja={() => setModalBaja(true)} />}
      {tabActual === 'movimientos'  && <TabMovimientos      stock={stock} cfg={cfg} tema={tema} />}
      {tabActual === 'entregas'     && <TabEntregas         stock={stock} cfg={cfg} tema={tema} />}
      {tabActual === 'transferidos' && <TabTransferidosStock animales={datos.animales} historialEventos={datos.historialEventos} cfg={cfg} tema={tema} onFichaAnimal={setFichaAnimalId} />}
      {tabActual === 'actividades'  && <TabActividadesStock datos={datos} especieId={especieId} cfg={cfg} />}
    </div>
  )
}
