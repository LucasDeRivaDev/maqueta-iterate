import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useConejo, ESTADOS_ANIMAL, TIPOS_EVENTO } from '../../context/ConejoContext'
import { generarFichaPDF } from './pdfUtils'

const ACCENT = '#ffb300'

// ── Tipos de eventos generales del historial ─────────────────────────────────
const TIPOS_EVENTO_HISTORIAL = {
  observacion:      { label: 'Observación',         color: '#40c4ff' },
  manipulacion:     { label: 'Manipulación',        color: '#8a9bb0' },
  traslado:         { label: 'Traslado',            color: '#ffb300' },
  procedimiento:    { label: 'Procedimiento',       color: '#ce93d8' },
  tratamiento:      { label: 'Tratamiento',         color: '#00e676' },
  evaluacion:       { label: 'Evaluación',          color: '#40c4ff' },
  uso_experimental: { label: 'Uso experimental',    color: '#ce93d8' },
  incidente:        { label: 'Incidente',           color: '#ff6b80' },
  otro:             { label: 'Otro',                color: '#8a9bb0' },
}

// ── Utilidades ───────────────────────────────────────────────────────────────
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

// Niveles de ancestros para árbol genealógico
function computeNiveles(animalId, animales, maxNivel = 8) {
  const niveles = []
  let nivel = [animalId]
  for (let n = 0; n < maxNivel; n++) {
    const sig = nivel.flatMap(id => {
      if (!id) return [null, null]
      const a = animales.find(x => x.id === id)
      return [a?.padreId ?? null, a?.madreId ?? null]
    })
    if (!sig.some(id => id && animales.find(x => x.id === id))) break
    niveles.push(sig)
    nivel = sig
  }
  return niveles
}

// Construye el historial completo combinando todas las fuentes
function buildHistorialCompleto(animal, datos) {
  const id = animal.id
  const evs = []

  // Ingreso al sistema
  const ingreso = datos.ingresos?.find(i => i.animalesIds.includes(id))
  if (ingreso) evs.push({
    fecha: ingreso.fechaIngreso + 'T00:00:00', tipo: 'Ingreso al sistema', color: '#00e676',
    descripcion: `Ingreso desde ${ingreso.procedencia}. Lote: ${ingreso.loteCompra}.`,
    usuario: ingreso.responsableRecepcion, obs: ingreso.observaciones,
  })

  // Cambios de estado (auditoría)
  datos.auditoria?.filter(a => a.entidadId === id).forEach(a => {
    const label = a.accion === 'crear'
      ? 'Registro en sistema'
      : a.accion === 'cambio_estado'
        ? `Cambio de estado: ${a.valorAnterior ?? 'ninguno'} → ${a.valorNuevo}`
        : a.accion
    evs.push({
      fecha: a.fecha, tipo: 'Auditoría', color: '#8a9bb0',
      descripcion: label, usuario: a.usuario, obs: '',
    })
  })

  // Eventos sanitarios
  datos.eventosSanitarios?.filter(e => e.animalId === id).forEach(e => {
    const ti = TIPOS_EVENTO[e.tipo]
    evs.push({
      fecha: e.fecha + 'T00:00:00', tipo: ti?.label ?? e.tipo, color: ti?.color ?? '#8a9bb0',
      descripcion: e.resultado, usuario: e.profesionalResponsable, obs: e.observaciones,
    })
  })

  // Decisiones de cuarentena
  datos.decisiones?.filter(d => d.animalId === id).forEach(d => {
    evs.push({
      fecha: d.fecha + 'T00:00:00',
      tipo: d.decision === 'aprobado' ? 'Aprobado para colonia' : d.decision === 'rechazado' ? 'Baja por cuarentena' : 'Cuarentena extendida',
      color: d.decision === 'aprobado' ? '#00e676' : d.decision === 'rechazado' ? '#ff6b80' : ACCENT,
      descripcion: d.motivo, usuario: d.responsable, obs: '',
    })
  })

  // Servicios reproductivos
  datos.servicios?.filter(s => s.machoId === id || s.hembraId === id).forEach(s => {
    const rol = s.machoId === id ? 'Macho' : 'Hembra'
    evs.push({
      fecha: s.fechaServicio + 'T00:00:00', tipo: 'Servicio reproductivo', color: '#ce93d8',
      descripcion: `Rol: ${rol}. ${s.machoId === id ? `Hembra: ${s.hembraId}` : `Macho: ${s.machoId}`}. ID: ${s.id}`,
      usuario: 'Sistema', obs: s.observaciones,
    })
    if (s.fechaPartoReal) evs.push({
      fecha: s.fechaPartoReal + 'T00:00:00', tipo: 'Parto', color: '#00e676',
      descripcion: `Parto registrado. Nacidos vivos: ${s.nacidos?.vivos ?? '—'}. Camada: ${s.id}.`,
      usuario: 'Sistema', obs: '',
    })
    if (s.destete?.fecha) evs.push({
      fecha: s.destete.fecha + 'T00:00:00', tipo: 'Destete', color: ACCENT,
      descripcion: `Destete. Destetados: ${s.destete.destetados}. ♂ ${s.destete.machos} ♀ ${s.destete.hembras}.`,
      usuario: 'Sistema', obs: '',
    })
  })

  // Eventos de historial manual
  datos.historialEventos?.filter(e => e.animalId === id).forEach(e => {
    const ti = TIPOS_EVENTO_HISTORIAL[e.tipo]
    evs.push({
      fecha: e.fecha + 'T00:00:00', tipo: ti?.label ?? e.tipo, color: ti?.color ?? '#8a9bb0',
      descripcion: e.descripcion, usuario: e.usuario, obs: e.observaciones,
    })
  })

  return evs.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

// ── Componentes base ─────────────────────────────────────────────────────────
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
    <button onClick={onClick} className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
      style={{
        background: active ? `${ACCENT}18` : 'transparent',
        border: `1px solid ${active ? ACCENT + '50' : 'transparent'}`,
        color: active ? ACCENT : tema.textMuted, cursor: 'pointer',
      }}>
      {label}
    </button>
  )
}

function Fila({ label, value }) {
  const { tema } = useTheme()
  return (
    <div>
      <div style={{ color: tema.textMuted, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: tema.textPrimary }}>{value || '—'}</div>
    </div>
  )
}

// ── Tab: Datos generales ─────────────────────────────────────────────────────
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
        {animal.padreId && <Fila label="Padre (ID)" value={<span className="font-mono font-semibold" style={{ color: '#40c4ff' }}>♂ {animal.padreId}</span>} />}
        {animal.madreId && <Fila label="Madre (ID)" value={<span className="font-mono font-semibold" style={{ color: '#ce93d8' }}>♀ {animal.madreId}</span>} />}
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
            <div className="text-xs leading-relaxed mt-1" style={{ color: '#8a9bb0' }}>{ingreso.observaciones}</div>
          )}
        </div>
      )}

      {animal.observaciones && (
        <div className="rounded-xl p-3 text-sm leading-relaxed" style={{ background: '#0d1528', border: '1px solid rgba(30,51,82,0.8)', color: '#8a9bb0' }}>
          <div style={{ color: '#4a5f7a', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Observaciones</div>
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
              <div className="rounded-lg px-2 py-1 shrink-0 text-xs font-bold"
                style={{ background: `${tipoInfo?.color ?? '#8a9bb0'}18`, color: tipoInfo?.color ?? '#8a9bb0', border: `1px solid ${tipoInfo?.color ?? '#8a9bb0'}40` }}>
                {tipoInfo?.label ?? ev.tipo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: tema.textMuted }}>{fmt(ev.fecha)}</span>
                  <span style={{ color: tema.textMuted }}>·</span>
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
            <div key={d.id} className="rounded-xl p-3 mb-2"
              style={{ background: d.decision === 'aprobado' ? 'rgba(0,230,118,0.06)' : d.decision === 'rechazado' ? 'rgba(255,107,128,0.06)' : `${ACCENT}06`, border: `1px solid ${d.decision === 'aprobado' ? 'rgba(0,230,118,0.3)' : d.decision === 'rechazado' ? 'rgba(255,107,128,0.3)' : ACCENT + '30'}` }}>
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
  const partos  = propios.filter(s => s.fechaPartoReal)
  const totalNacidos    = partos.reduce((s, sv) => s + (sv.nacidos?.vivos ?? 0), 0)
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
          { v: totalNacidos,  l: 'Nacidos vivos' },
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

// ── Tab: Genealogía (navegable) ──────────────────────────────────────────────
const NIVEL_LABELS = ['Padres', 'Abuelos', 'Bisabuelos', 'Tatarabuelos', 'Trisabuelos']

function CardAncestor({ animalId, animales, onNavegar }) {
  const { tema } = useTheme()
  if (!animalId) {
    return (
      <div className="rounded-xl p-3 text-center" style={{ border: `1px dashed ${tema.bgCardBorde}` }}>
        <div className="text-xs" style={{ color: tema.textMuted }}>No registrado</div>
      </div>
    )
  }
  const a = animales.find(x => x.id === animalId)
  if (!a) {
    return (
      <div className="rounded-xl p-3" style={{ border: `1px dashed ${tema.bgCardBorde}` }}>
        <div className="font-mono text-xs font-bold" style={{ color: tema.textMuted }}>{animalId}</div>
        <div className="text-xs" style={{ color: tema.textMuted, opacity: 0.5 }}>No disponible</div>
      </div>
    )
  }
  const est = ESTADOS_ANIMAL[a.estado]
  return (
    <button onClick={() => onNavegar?.(animalId)}
      className="w-full rounded-xl p-3 text-left transition-all"
      style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, cursor: 'pointer' }}>
      <div className="font-mono font-bold text-xs" style={{ color: ACCENT }}>{a.id}</div>
      <div className="text-xs mt-0.5" style={{ color: a.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>
        {a.sexo === 'macho' ? '♂' : '♀'} {a.cepa}
      </div>
      <div className="mt-1">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: est.bg, border: `1px solid ${est.borde}`, color: est.color }}>
          {est.label}
        </span>
      </div>
      <div style={{ color: ACCENT, fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>→ Ver ficha</div>
    </button>
  )
}

function TabGenealogiaConejo({ animal, todos, onNavegar }) {
  const { tema } = useTheme()
  const niveles = computeNiveles(animal.id, todos)
  const descendientes = todos.filter(a => a.padreId === animal.id || a.madreId === animal.id)

  return (
    <div className="space-y-5">
      {niveles.length === 0 && descendientes.length === 0 ? (
        <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin genealogía registrada.</div>
      ) : (
        <>
          {[...niveles].reverse().map((ancestorIds, i) => {
            const nivelNum = niveles.length - i
            const label = NIVEL_LABELS[nivelNum - 1] ?? `Generación +${nivelNum}`
            const cols = Math.min(ancestorIds.length, 4)
            return (
              <div key={nivelNum}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>
                  {label}
                </div>
                <div className="gap-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {ancestorIds.map((id, j) => (
                    <CardAncestor key={j} animalId={id} animales={todos} onNavegar={id ? onNavegar : null} />
                  ))}
                </div>
                <div className="text-center mt-2" style={{ color: tema.textMuted }}>↓</div>
              </div>
            )
          })}

          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Animal actual</div>
            <div className="rounded-xl p-4" style={{ background: `${ACCENT}08`, border: `1.5px solid ${ACCENT}40` }}>
              <div className="font-mono font-bold text-base" style={{ color: ACCENT }}>{animal.id}</div>
              <div className="text-sm mt-0.5" style={{ color: animal.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>
                {animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'} · {animal.cepa}
                {animal.fechaNacimiento ? ` · Nac. ${fmt(animal.fechaNacimiento)}` : ''}
              </div>
            </div>
          </div>

          {descendientes.length > 0 && (
            <div>
              <div className="text-center mb-2" style={{ color: tema.textMuted }}>↓</div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>
                Descendencia ({descendientes.length})
              </div>
              <div className="space-y-1.5">
                {descendientes.map(d => {
                  const est = ESTADOS_ANIMAL[d.estado]
                  return (
                    <button key={d.id} onClick={() => onNavegar(d.id)}
                      className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left"
                      style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, cursor: 'pointer' }}>
                      <span style={{ color: d.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>{d.sexo === 'macho' ? '♂' : '♀'}</span>
                      <span className="font-mono font-bold text-sm" style={{ color: tema.textPrimary }}>{d.id}</span>
                      <span className="text-xs" style={{ color: tema.textMuted }}>Nac. {fmt(d.fechaNacimiento)}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge>
                        <span style={{ color: ACCENT, fontSize: '11px' }}>→</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Tab: Historial completo ──────────────────────────────────────────────────
function TabHistorialCompleto({ animal, datos }) {
  const { tema } = useTheme()
  const eventos = buildHistorialCompleto(animal, datos)

  if (eventos.length === 0) {
    return <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin eventos registrados.</div>
  }

  return (
    <div className="space-y-0">
      {eventos.map((ev, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ev.color }} />
            {i < eventos.length - 1 && <div className="w-px flex-1 my-1" style={{ background: tema.bgCardBorde }} />}
          </div>
          <div className="flex-1 min-w-0 pb-4">
            <div className="rounded-xl p-3" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}40`, color: ev.color }}>
                  {ev.tipo}
                </span>
                <span className="font-mono text-xs" style={{ color: tema.textMuted }}>{fmt(ev.fecha)}</span>
                {ev.usuario && <span className="text-xs" style={{ color: tema.textMuted }}>— {ev.usuario}</span>}
              </div>
              <div className="text-sm leading-relaxed" style={{ color: tema.textPrimary }}>{ev.descripcion}</div>
              {ev.obs && <div className="text-xs mt-1" style={{ color: tema.textMuted }}>{ev.obs}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Movimientos ─────────────────────────────────────────────────────────
function TabMovimientos({ animal, datos }) {
  const { tema } = useTheme()

  // Derivar movimientos de auditoría y eventos del sistema
  const movs = []
  const ingreso = datos.ingresos?.find(i => i.animalesIds.includes(animal.id))
  if (ingreso) movs.push({
    fecha: ingreso.fechaIngreso, evento: 'Ingreso al sistema', colonia: 'Cuarentena',
    jaula: `Lote ${ingreso.loteCompra}`, usuario: ingreso.responsableRecepcion,
  })

  datos.auditoria?.filter(a => a.entidadId === animal.id && a.accion === 'cambio_estado')
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .forEach(a => {
      const COLONIA = {
        cuarentena:   'Cuarentena',
        reproductor:  'Colonia Reproductora',
        reemplazo:    'Reemplazos',
        stock:        'Stock',
        experimental: 'Experimental',
        baja:         'Baja',
        fallecido:    'Fallecido',
      }
      movs.push({
        fecha: a.fecha.split('T')[0],
        evento: `Cambio de estado: ${a.valorAnterior ?? '—'} → ${a.valorNuevo}`,
        colonia: COLONIA[a.valorNuevo] ?? a.valorNuevo,
        jaula: '—', usuario: a.usuario,
      })
    })

  if (movs.length === 0) {
    return <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin movimientos registrados.</div>
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
              {['Fecha', 'Evento', 'Colonia / Estado', 'Usuario'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movs.map((m, i) => (
              <tr key={i} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap" style={{ color: tema.textMuted }}>{fmt(m.fecha)}</td>
                <td className="px-4 py-2.5 text-xs" style={{ color: tema.textSecondary }}>{m.evento}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, color: ACCENT }}>
                    {m.colonia}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: tema.textMuted }}>{m.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab: Registrar Evento ────────────────────────────────────────────────────
function TabRegistrarEvento({ animal, onEventoRegistrado }) {
  const { registrarEventoHistorial } = useConejo()
  const { tema } = useTheme()
  const [tipo,          setTipo]          = useState('observacion')
  const [descripcion,   setDescripcion]   = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [usuario,       setUsuario]       = useState('')
  const [fecha,         setFecha]         = useState(new Date().toISOString().split('T')[0])
  const [guardado,      setGuardado]      = useState(false)

  function handleGuardar() {
    if (!descripcion.trim()) return
    registrarEventoHistorial({
      id: `EV-H-${Date.now()}`,
      animalId: animal.id,
      fecha,
      tipo,
      descripcion: descripcion.trim(),
      usuario: usuario.trim() || 'Usuario',
      observaciones: observaciones.trim(),
    })
    setDescripcion(''); setObservaciones('')
    setGuardado(true)
    setTimeout(() => { setGuardado(false); onEventoRegistrado?.() }, 1500)
  }

  const inp = {
    background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,51,82,0.9)',
    color: '#c9d4e0', borderRadius: '10px', padding: '8px 12px',
    fontSize: '13px', outline: 'none', width: '100%',
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: `${ACCENT}06`, border: `1px solid ${ACCENT}20`, color: '#8a9bb0' }}>
        Registrando evento para <span className="font-mono font-bold" style={{ color: ACCENT }}>{animal.id}</span>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Tipo de evento</label>
        <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inp, cursor: 'pointer', background: 'rgba(8,13,26,0.95)' }}>
          {Object.entries(TIPOS_EVENTO_HISTORIAL).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Responsable</label>
          <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Nombre" style={inp} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Descripción *</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
          placeholder="Describir el evento..." style={{ ...inp, resize: 'vertical' }} />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Observaciones</label>
        <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2}
          placeholder="Opcional" style={{ ...inp, resize: 'vertical' }} />
      </div>

      <button onClick={handleGuardar} disabled={!descripcion.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-bold"
        style={{
          background: descripcion.trim() ? `${ACCENT}18` : `${ACCENT}08`,
          border: `1.5px solid ${descripcion.trim() ? ACCENT + '50' : ACCENT + '20'}`,
          color: descripcion.trim() ? ACCENT : '#4a5f7a',
          cursor: descripcion.trim() ? 'pointer' : 'not-allowed',
        }}>
        {guardado ? '✓ Evento registrado' : 'Registrar evento'}
      </button>
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────
export default function FichaAnimalModal({ animalId, onClose }) {
  const { tema } = useTheme()
  const { datos } = useConejo()

  const [navStack, setNavStack] = useState([animalId])
  const [tabActivo, setTabActivo] = useState('datos')

  const fichaId = navStack[navStack.length - 1]
  const animal  = datos.animales.find(a => a.id === fichaId)

  function navegarA(id) {
    if (id && id !== fichaId && datos.animales.find(a => a.id === id)) {
      setNavStack(prev => [...prev, id])
      setTabActivo('datos')
    }
  }

  function volver() {
    if (navStack.length > 1) {
      setNavStack(prev => prev.slice(0, -1))
      setTabActivo('datos')
    }
  }

  if (!animal) return null

  const ingreso     = datos.ingresos.find(i => i.animalesIds.includes(fichaId))
  const eventos     = datos.eventosSanitarios.filter(e => e.animalId === fichaId)
  const decisiones  = datos.decisiones.filter(d => d.animalId === fichaId)
  const historialC  = buildHistorialCompleto(animal, datos)
  const est         = ESTADOS_ANIMAL[animal.estado]

  function handlePDF() {
    generarFichaPDF(animal, datos.animales, datos.eventosSanitarios, datos.servicios, datos.auditoria, datos.decisiones, datos.ingresos)
  }

  const TABS = [
    { id: 'datos',       label: 'Datos' },
    { id: 'historial',   label: `Historial (${historialC.length})` },
    { id: 'sanitaria',   label: `Sanitaria (${eventos.length})` },
    { id: 'reproduccion', label: 'Reproducción' },
    { id: 'genealogia',  label: 'Genealogía' },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'evento',      label: '+ Evento' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#080d1a', border: `1.5px solid ${ACCENT}40`, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Breadcrumb */}
        {navStack.length > 1 && (
          <div className="px-4 pt-2.5 pb-2 flex items-center gap-2 shrink-0 flex-wrap"
            style={{ borderBottom: `1px solid ${ACCENT}15`, background: `${ACCENT}03` }}>
            <button onClick={volver}
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, cursor: 'pointer' }}>
              ← Volver
            </button>
            <div className="text-xs flex items-center gap-1 overflow-x-auto">
              {navStack.map((id, i) => (
                <span key={`${id}-${i}`}>
                  {i > 0 && <span style={{ color: tema.textMuted }}> / </span>}
                  <span className="font-mono"
                    style={{ color: i === navStack.length - 1 ? ACCENT : tema.textMuted, fontWeight: i === navStack.length - 1 ? 700 : 400 }}>
                    {id}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: `1px solid ${ACCENT}20`, background: `${ACCENT}04` }}>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-bold text-lg" style={{ color: ACCENT }}>{animal.id}</div>
            <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>
              {animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'} · {animal.cepa}
              {animal.fechaNacimiento ? ` · Nac. ${fmt(animal.fechaNacimiento)} · ${calcEdad(animal.fechaNacimiento)}` : ''}
            </div>
          </div>
          <Badge color={est.color} bg={est.bg} borde={est.borde}>{est.label}</Badge>
          <button onClick={handlePDF}
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}50`, color: ACCENT, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            📄 PDF
          </button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(255,107,128,0.12)', border: '1px solid rgba(255,107,128,0.3)', color: '#ff6b80', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
          {TABS.map(t => <TabBtn key={t.id} label={t.label} active={tabActivo === t.id} onClick={() => setTabActivo(t.id)} />)}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tabActivo === 'datos'       && <TabDatos animal={animal} ingreso={ingreso} decision={decisiones[0]} />}
          {tabActivo === 'historial'   && <TabHistorialCompleto animal={animal} datos={datos} />}
          {tabActivo === 'sanitaria'   && <TabSanitaria eventos={eventos} decisiones={decisiones} />}
          {tabActivo === 'reproduccion' && <TabReproduccion animal={animal} servicios={datos.servicios} />}
          {tabActivo === 'genealogia'  && <TabGenealogiaConejo animal={animal} todos={datos.animales} onNavegar={navegarA} />}
          {tabActivo === 'movimientos' && <TabMovimientos animal={animal} datos={datos} />}
          {tabActivo === 'evento'      && <TabRegistrarEvento animal={animal} onEventoRegistrado={() => setTabActivo('historial')} />}
        </div>
      </div>
    </div>
  )
}
