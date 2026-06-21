import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useConejo, ESTADOS_ANIMAL, TIPOS_EVENTO } from '../../context/ConejoContext'
import { generarFichaPDF } from './pdfUtils'

const ACCENT = '#ffb300'

function calcEdad(f) {
  if (!f) return '—'
  const hoy = new Date(); const nac = new Date(f + 'T00:00:00')
  const m = (hoy.getFullYear() - nac.getFullYear()) * 12 + hoy.getMonth() - nac.getMonth()
  if (m < 1) return `${Math.floor((hoy - nac) / 86400000)} días`
  if (m < 12) return `${m} meses`
  const a = Math.floor(m / 12); return `${a} año${a > 1 ? 's' : ''}${m % 12 > 0 ? ` ${m % 12} m.` : ''}`
}
function fmt(d) {
  if (!d) return '—'
  const [y, mo, day] = d.split('T')[0].split('-'); return `${day}/${mo}/${y}`
}

function Badge({ children, color, bg, borde }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: bg ?? `${color}18`, border: `1px solid ${borde ?? color + '50'}`, color }}>
      {children}
    </span>
  )
}

function TabBtn({ label, active, onClick }) {
  const { tema } = useTheme()
  return (
    <button onClick={onClick} className="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
      style={{
        background: active ? `${ACCENT}18` : 'transparent',
        border: `1px solid ${active ? ACCENT + '50' : 'transparent'}`,
        color: active ? ACCENT : tema.textMuted,
        cursor: 'pointer',
      }}>
      {label}
    </button>
  )
}

function Fila({ label, value }) {
  const { tema } = useTheme()
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: tema.textMuted, fontSize: '10px' }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: tema.textPrimary }}>{value || '—'}</div>
    </div>
  )
}

// ── Tab: Datos Generales ─────────────────────────────────────────────────────
function TabDatos({ animal, ingreso, decision }) {
  const { tema } = useTheme()
  const est = ESTADOS_ANIMAL[animal.estado]
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Fila label="Identificador" value={<span className="font-mono font-bold text-base" style={{ color: ACCENT }}>{animal.id}</span>} />
        <Fila label="Estado actual" value={<Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge>} />
        <Fila label="Sexo" value={animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'} />
        <Fila label="Fecha de nacimiento" value={fmt(animal.fechaNacimiento)} />
        <Fila label="Edad" value={calcEdad(animal.fechaNacimiento)} />
        <Fila label="Cepa / Línea genética" value={animal.cepa} />
        <Fila label="Origen" value={animal.origen} />
        <Fila label="Estado sanitario" value={
          <span className="text-xs font-bold" style={{ color: animal.estadoSanitario === 'ok' ? '#00e676' : animal.estadoSanitario === 'pendiente' ? ACCENT : '#ff6b80' }}>
            {animal.estadoSanitario === 'ok' ? '✓ OK' : animal.estadoSanitario === 'pendiente' ? '⏳ Pendiente' : '⚠ Alerta'}
          </span>
        } />
      </div>

      {ingreso && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: `${ACCENT}06`, border: `1px solid ${ACCENT}20` }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Evento de Ingreso</div>
          <div className="grid grid-cols-2 gap-3">
            <Fila label="Fecha de ingreso" value={fmt(ingreso.fechaIngreso)} />
            <Fila label="Lote de compra" value={ingreso.loteCompra} />
            <Fila label="Procedencia" value={ingreso.procedencia} />
            <Fila label="Responsable de recepción" value={ingreso.responsableRecepcion} />
          </div>
          {ingreso.documentacion && <Fila label="Documentación" value={ingreso.documentacion} />}
          {ingreso.observaciones && (
            <div className="text-xs leading-relaxed mt-1" style={{ color: tema.textSecondary }}>{ingreso.observaciones}</div>
          )}
        </div>
      )}

      {animal.observaciones && (
        <div className="rounded-xl p-3 text-sm leading-relaxed" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, color: tema.textSecondary }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tema.textMuted }}>Observaciones</div>
          {animal.observaciones}
        </div>
      )}
    </div>
  )
}

// ── Tab: Historia Sanitaria ──────────────────────────────────────────────────
function TabSanitaria({ eventos, decisiones }) {
  const { tema } = useTheme()
  const ordenados = [...eventos].sort((a, b) => b.fecha.localeCompare(a.fecha))
  return (
    <div className="space-y-3">
      {ordenados.length === 0 && (
        <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin eventos sanitarios registrados.</div>
      )}
      {ordenados.map(ev => {
        const tipoInfo = TIPOS_EVENTO[ev.tipo]
        return (
          <div key={ev.id} className="rounded-xl p-4" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="flex items-start gap-3">
              <div className="rounded-lg px-2 py-1 shrink-0 text-xs font-bold" style={{ background: `${tipoInfo?.color ?? '#8a9bb0'}18`, color: tipoInfo?.color ?? '#8a9bb0', border: `1px solid ${tipoInfo?.color ?? '#8a9bb0'}40` }}>
                {tipoInfo?.label ?? ev.tipo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: tema.textMuted }}>{fmt(ev.fecha)}</span>
                  <span className="text-xs" style={{ color: tema.textMuted }}>·</span>
                  <span className="text-xs" style={{ color: tema.textMuted }}>{ev.profesionalResponsable}</span>
                </div>
                <div className="text-sm font-medium leading-relaxed" style={{ color: tema.textPrimary }}>{ev.resultado}</div>
                {ev.observaciones && (
                  <div className="text-xs mt-1 leading-relaxed" style={{ color: tema.textMuted }}>{ev.observaciones}</div>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {decisiones.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>Decisiones de cuarentena</div>
          {decisiones.map(d => (
            <div key={d.id} className="rounded-xl p-3 mb-2" style={{ background: d.decision === 'aprobado' ? 'rgba(0,230,118,0.06)' : d.decision === 'rechazado' ? 'rgba(255,107,128,0.06)' : `${ACCENT}06`, border: `1px solid ${d.decision === 'aprobado' ? 'rgba(0,230,118,0.3)' : d.decision === 'rechazado' ? 'rgba(255,107,128,0.3)' : ACCENT + '30'}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: d.decision === 'aprobado' ? '#00e676' : d.decision === 'rechazado' ? '#ff6b80' : ACCENT }}>
                  {d.decision === 'aprobado' ? '✓ Aprobado' : d.decision === 'rechazado' ? '✗ Rechazado' : '↻ Extendido'}
                </span>
                <span className="text-xs font-mono" style={{ color: tema.textMuted }}>{fmt(d.fecha)}</span>
                <span className="text-xs" style={{ color: tema.textMuted }}>— {d.responsable}</span>
              </div>
              <div className="text-xs" style={{ color: tema.textSecondary }}>{d.motivo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Reproducción ────────────────────────────────────────────────────────
function TabReproduccion({ animal, servicios }) {
  const { tema } = useTheme()
  const propios = servicios.filter(s => s.machoId === animal.id || s.hembraId === animal.id)
  const partos = propios.filter(s => s.fechaPartoReal)
  const totalNacidos = partos.reduce((s, sv) => s + (sv.nacidos?.vivos ?? 0), 0)
  const totalDestetados = partos.filter(s => s.destete).reduce((s, sv) => s + (sv.destete?.destetados ?? 0), 0)

  if (propios.length === 0) {
    return <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin servicios registrados.</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { v: propios.length, l: 'Servicios' },
          { v: propios.filter(s => s.confirmacionPrenez?.resultado === 'positivo').length, l: 'Preñeces conf.' },
          { v: partos.length, l: 'Partos' },
          { v: totalNacidos, l: 'Nacidos vivos' },
        ].map(({ v, l }) => (
          <div key={l} className="rounded-xl p-3 text-center" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="text-2xl font-mono font-bold" style={{ color: ACCENT }}>{v}</div>
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>{l}</div>
          </div>
        ))}
      </div>
      {animal.sexo === 'hembra' && partos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="text-xl font-mono font-bold" style={{ color: '#00e676' }}>{(totalNacidos / partos.length).toFixed(1)}</div>
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>Promedio de camada</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="text-xl font-mono font-bold" style={{ color: '#40c4ff' }}>{totalNacidos > 0 ? ((totalDestetados / totalNacidos) * 100).toFixed(0) : 0}%</div>
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>Tasa de destete</div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {[...propios].reverse().map(s => (
          <div key={s.id} className="rounded-xl p-4" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold" style={{ color: ACCENT }}>{s.id}</span>
              <span className="text-xs" style={{ color: tema.textMuted }}>{fmt(s.fechaServicio)}</span>
              <span className="text-xs" style={{ color: tema.textMuted }}>·</span>
              <span className="text-xs" style={{ color: tema.textMuted }}>{animal.sexo === 'macho' ? `Hembra: ${s.hembraId}` : `Macho: ${s.machoId}`}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><span style={{ color: tema.textMuted }}>Preñez: </span><span style={{ color: s.confirmacionPrenez ? (s.confirmacionPrenez.resultado === 'positivo' ? '#00e676' : '#ff6b80') : tema.textMuted }}>{s.confirmacionPrenez ? s.confirmacionPrenez.resultado : 'Pendiente'}</span></div>
              <div><span style={{ color: tema.textMuted }}>Parto: </span><span style={{ color: tema.textPrimary }}>{fmt(s.fechaPartoReal ?? null)}</span></div>
              <div><span style={{ color: tema.textMuted }}>Nacidos: </span><span style={{ color: tema.textPrimary }}>{s.nacidos ? s.nacidos.vivos : '—'}</span></div>
              <div><span style={{ color: tema.textMuted }}>Destete: </span><span style={{ color: tema.textPrimary }}>{fmt(s.destete?.fecha ?? null)}</span></div>
              <div><span style={{ color: tema.textMuted }}>Destetados: </span><span style={{ color: tema.textPrimary }}>{s.destete?.destetados ?? '—'}</span></div>
            </div>
            {s.observaciones && <div className="text-xs mt-2 italic" style={{ color: tema.textMuted }}>{s.observaciones}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Genealogía ──────────────────────────────────────────────────────────
function TabGenealogia({ animal, todos }) {
  const { tema } = useTheme()
  const padre = animal.padreId ? todos.find(a => a.id === animal.padreId) : null
  const madre = animal.madreId ? todos.find(a => a.id === animal.madreId) : null
  const descendencia = todos.filter(a => a.padreId === animal.id || a.madreId === animal.id)

  function AnimalCard({ a, rol }) {
    if (!a) return (
      <div className="rounded-xl p-3 text-center" style={{ background: tema.bgCard, border: `1px dashed ${tema.bgCardBorde}` }}>
        <div className="text-xs" style={{ color: tema.textMuted }}>{rol} — no registrado</div>
      </div>
    )
    const est = ESTADOS_ANIMAL[a.estado]
    return (
      <div className="rounded-xl p-3" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tema.textMuted }}>{rol}</div>
        <div className="font-mono font-bold text-sm" style={{ color: ACCENT }}>{a.id}</div>
        <div className="text-xs mt-1" style={{ color: tema.textMuted }}>{a.sexo === 'macho' ? '♂' : '♀'} · {a.cepa}</div>
        <div className="mt-1"><Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <AnimalCard a={padre} rol="Padre" />
        <AnimalCard a={madre} rol="Madre" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>Descendencia ({descendencia.length})</div>
        {descendencia.length === 0 ? (
          <div className="text-sm text-center py-6" style={{ color: tema.textMuted }}>Sin descendencia registrada en la colonia.</div>
        ) : (
          <div className="space-y-2">
            {descendencia.map(d => {
              const est = ESTADOS_ANIMAL[d.estado]
              return (
                <div key={d.id} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
                  <span className="font-mono font-bold text-sm" style={{ color: tema.textPrimary }}>{d.id}</span>
                  <span className="text-xs" style={{ color: tema.textMuted }}>{d.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'}</span>
                  <span className="text-xs" style={{ color: tema.textMuted }}>Nac: {fmt(d.fechaNacimiento)}</span>
                  <div className="ml-auto"><Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge></div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Auditoría ───────────────────────────────────────────────────────────
function TabAuditoria({ auditoria }) {
  const { tema } = useTheme()
  const entries = [...auditoria].sort((a, b) => b.fecha.localeCompare(a.fecha))
  return (
    <div className="space-y-2">
      {entries.length === 0 && (
        <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin registros de auditoría.</div>
      )}
      {entries.map(a => (
        <div key={a.id} className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
          <div className="shrink-0 font-mono text-xs mt-0.5" style={{ color: tema.textMuted }}>{a.fecha.replace('T', ' ').slice(0, 16)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold" style={{ color: tema.textPrimary }}>{a.accion}</div>
            {a.campo && <div className="text-xs" style={{ color: tema.textMuted }}>Campo: <span style={{ color: tema.textSecondary }}>{a.campo}</span></div>}
            {a.valorAnterior && <div className="text-xs" style={{ color: tema.textMuted }}>Anterior: <span style={{ color: '#ff6b80' }}>{a.valorAnterior}</span></div>}
            {a.valorNuevo && <div className="text-xs" style={{ color: tema.textMuted }}>Nuevo: <span style={{ color: '#00e676' }}>{a.valorNuevo}</span></div>}
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>Usuario: {a.usuario}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────
export default function FichaAnimalModal({ animalId, onClose }) {
  const { tema } = useTheme()
  const { datos } = useConejo()
  const [tabActivo, setTabActivo] = useState('datos')

  const animal = datos.animales.find(a => a.id === animalId)
  if (!animal) return null

  const ingreso = datos.ingresos.find(i => i.animalesIds.includes(animal.id))
  const eventos  = datos.eventosSanitarios.filter(e => e.animalId === animal.id)
  const decisiones = datos.decisiones.filter(d => d.animalId === animal.id)
  const auditoria  = datos.auditoria.filter(a => a.entidadId === animal.id)
  const est = ESTADOS_ANIMAL[animal.estado]

  const tabs = [
    { id: 'datos',       label: 'Datos' },
    { id: 'sanitaria',   label: `Sanitaria (${eventos.length})` },
    { id: 'reproduccion',label: 'Reproducción' },
    { id: 'genealogia',  label: 'Genealogía' },
    { id: 'auditoria',   label: `Auditoría (${auditoria.length})` },
  ]

  function handlePDF() {
    generarFichaPDF(animal, datos.animales, datos.eventosSanitarios, datos.servicios, datos.auditoria, datos.decisiones, datos.ingresos)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#080d1a', border: `1.5px solid ${ACCENT}40`, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: `1px solid ${ACCENT}20`, background: `${ACCENT}04` }}>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-bold text-lg" style={{ color: ACCENT }}>{animal.id}</div>
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>
              {animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'} · {animal.cepa} · Nac. {fmt(animal.fechaNacimiento)} · {calcEdad(animal.fechaNacimiento)}
            </div>
          </div>
          <Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge>
          <button onClick={handlePDF}
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}50`, color: ACCENT, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            📄 Ficha PDF
          </button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(255,107,128,0.12)', border: '1px solid rgba(255,107,128,0.3)', color: '#ff6b80', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
          {tabs.map(t => <TabBtn key={t.id} label={t.label} active={tabActivo === t.id} onClick={() => setTabActivo(t.id)} />)}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tabActivo === 'datos'        && <TabDatos animal={animal} ingreso={ingreso} decision={decisiones[0]} />}
          {tabActivo === 'sanitaria'    && <TabSanitaria eventos={eventos} decisiones={decisiones} />}
          {tabActivo === 'reproduccion' && <TabReproduccion animal={animal} servicios={datos.servicios} />}
          {tabActivo === 'genealogia'   && <TabGenealogia animal={animal} todos={datos.animales} />}
          {tabActivo === 'auditoria'    && <TabAuditoria auditoria={auditoria} />}
        </div>

      </div>
    </div>
  )
}
