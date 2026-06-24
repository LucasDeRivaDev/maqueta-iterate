import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useICIVET, ESPECIES_CONFIG, getNombreAnimal } from '../context/ICIVETContext'

// ── Configuración de colonias ────────────────────────────────────────────────
const COLONIAS = {
  fundacion:  { label: 'Fundación',  color: '#00e676', key: 'fundacion'      },
  produccion: { label: 'Producción', color: '#40c4ff', key: 'produccion'     },
  stock:      { label: 'Stock',      color: '#ce93d8', key: 'no_seleccionado' },
}

const DESTINOS_VALIDOS = {
  fundacion:       [{ ...COLONIAS.produccion }],
  produccion:      [{ ...COLONIAS.stock }],
  no_seleccionado: [],
}

// ── Tipos de eventos manuales ────────────────────────────────────────────────
const TIPOS_EVENTO = {
  observacion:   { label: 'Observación',        color: '#40c4ff' },
  manipulacion:  { label: 'Manipulación',       color: '#8a9bb0' },
  traslado:      { label: 'Traslado',           color: '#ffb300' },
  procedimiento: { label: 'Procedimiento',      color: '#ce93d8' },
  tratamiento:   { label: 'Tratamiento',        color: '#00e676' },
  evaluacion:    { label: 'Evaluación clínica', color: '#40c4ff' },
  incidente:     { label: 'Incidente',          color: '#ff6b80' },
  uso_experimental: { label: 'Uso experimental', color: '#ce93d8' },
  otro:          { label: 'Otro',               color: '#8a9bb0' },
}

// ── Helpers de datos ─────────────────────────────────────────────────────────

function buscarAnimal(datos, id) {
  if (!id || !datos) return null
  return (
    datos.animales?.find(a => a.id === id) ??
    datos.reproductores?.find(r => r.id === id) ??
    null
  )
}

function getCamadaDeAnimal(animal, datos) {
  if (!animal?.camadaId) return null
  return (
    datos.camadas?.find(c => c.id === animal.camadaId) ??
    datos.produccion?.camadas?.find(c => c.id === animal.camadaId) ??
    null
  )
}

function getColoniaActual(animal, datos) {
  if (!animal) return '—'
  if (animal.generacion || animal.origen === 'Fundación') return 'Fundación'
  const enJaulaProd = datos.produccion?.jaulas?.find(
    j => j.machoId === animal.id || j.hembraIds?.includes(animal.id)
  )
  if (enJaulaProd) return 'Producción'
  switch (animal.destino) {
    case 'fundacion':       return 'Fundación'
    case 'produccion':      return 'Producción'
    case 'no_seleccionado': return 'Stock'
    default:                return '—'
  }
}

function getColoniaKey(animal) {
  if (!animal) return null
  if (animal.generacion || animal.origen === 'Fundación') return 'fundacion'
  return animal.destino ?? null
}

function getJaulaActual(animal, datos) {
  if (!animal) return null
  const id = animal.id
  const jaulaProd = datos.produccion?.jaulas?.find(
    j => j.machoId === id || j.hembraIds?.includes(id)
  )
  if (jaulaProd) return { codigo: jaulaProd.codigo, colonia: 'Producción' }
  const pareja = datos.parejas?.find(p => p.machoId === id || p.hembraId === id)
  if (pareja) return { codigo: pareja.id, colonia: 'Fundación' }
  return null
}

// Construye niveles de ancestros para árbol genealógico
function computeNiveles(animalId, datos, maxNivel = 8) {
  const niveles = []
  let nivel = [animalId]

  for (let n = 0; n < maxNivel; n++) {
    const siguiente = nivel.flatMap(id => {
      if (!id) return [null, null]
      const a = buscarAnimal(datos, id)
      return [a?.padreId ?? null, a?.madreId ?? null]
    })
    if (!siguiente.some(id => id && buscarAnimal(datos, id))) break
    niveles.push(siguiente)
    nivel = siguiente
  }
  return niveles
}

// Construye historial cronológico del animal
function buildHistorial(animal, datos) {
  if (!animal) return []
  const id = animal.id
  const evs = []

  const camada = getCamadaDeAnimal(animal, datos)
  const esDeFundacion = !!datos.camadas?.find(c => c.id === animal.camadaId)

  if (camada) {
    evs.push({ id: `sys-nac-${id}`, fecha: camada.fechaNacimiento, tipo: 'Nacimiento', color: '#00e676',
      descripcion: `Nacimiento en camada ${camada.codigo || camada.id}`, usuario: 'Sistema' })

    const fd = camada.fechaDestete ?? camada.destete?.fecha
    if (fd) evs.push({ id: `sys-dest-${id}`, fecha: fd, tipo: 'Destete', color: '#ffb300',
      descripcion: `Destete de camada ${camada.codigo || camada.id}`, usuario: 'Sistema' })

    if (camada.seleccion?.fecha) {
      const dest = { fundacion: 'Fundación', produccion: 'Producción', no_seleccionado: 'Stock' }[animal.destino] ?? animal.destino
      evs.push({ id: `sys-sel-${id}`, fecha: camada.seleccion.fecha, tipo: 'Selección', color: '#40c4ff',
        descripcion: `Seleccionado para ${dest ?? 'colonia'}. Motivo: ${camada.seleccion.motivo || '—'}`, usuario: 'Sistema' })
    }
  } else if (!animal.camadaId && (animal.generacion || animal.origen)) {
    evs.push({ id: `sys-ing-${id}`, fecha: null, tipo: 'Ingreso a Fundación', color: '#00e676',
      descripcion: `Animal de Fundación. Origen: ${animal.origen ?? '—'}.${animal.generacion ? ` Generación: ${animal.generacion}.` : ''}`, usuario: 'Sistema' })
  }

  const jaulaProd = datos.produccion?.jaulas?.find(
    j => j.machoId === id || j.hembraIds?.includes(id)
  )
  if (jaulaProd) {
    evs.push({ id: `sys-prod-${id}`, fecha: jaulaProd.fechaFormacion, tipo: 'Incorporación a Producción', color: '#00e676',
      descripcion: `Incorporado a jaula reproductiva ${jaulaProd.codigo}`, usuario: 'Sistema' })
  }

  const manuales = (datos.historialEventos || []).filter(e => e.animalId === id)
  manuales.forEach(e => {
    if (e.tipo === 'transferencia_colonia') {
      evs.push({
        ...e,
        color: '#8a9bb0',
        tipoLabel: 'Transferencia de colonia',
      })
    } else {
      evs.push({
        ...e,
        color: TIPOS_EVENTO[e.tipo]?.color ?? '#8a9bb0',
        tipoLabel: TIPOS_EVENTO[e.tipo]?.label ?? e.tipo,
      })
    }
  })

  return evs
    .filter(e => e.fecha || e.id?.startsWith('sys-ing'))
    .sort((a, b) => (b.fecha ?? '0000').localeCompare(a.fecha ?? '0000'))
}

// Construye lista de movimientos
function buildMovimientos(animal, datos) {
  if (!animal) return []
  const id = animal.id
  const movs = []

  const camada = getCamadaDeAnimal(animal, datos)
  const coloniaNac = datos.produccion?.camadas?.find(c => c.id === animal.camadaId) ? 'Producción' : 'Fundación'

  if (camada) {
    movs.push({ fecha: camada.fechaNacimiento, tipo: 'Nacimiento', colonia: coloniaNac, jaula: camada.codigo || camada.id })
    const fd = camada.fechaDestete ?? camada.destete?.fecha
    if (fd) movs.push({ fecha: fd, tipo: 'Destete', colonia: coloniaNac, jaula: 'Post-destete' })
  }

  if (animal.destino === 'fundacion') {
    const pareja = datos.parejas?.find(p => p.machoId === id || p.hembraId === id)
    if (pareja) movs.push({ fecha: pareja.fechaApareamiento, tipo: 'Ingreso a pareja de Fundación', colonia: 'Fundación', jaula: pareja.id })
  }

  const jaulaProd = datos.produccion?.jaulas?.find(j => j.machoId === id || j.hembraIds?.includes(id))
  if (jaulaProd) movs.push({ fecha: jaulaProd.fechaFormacion, tipo: 'Incorporación a Producción', colonia: 'Producción', jaula: jaulaProd.codigo })

  const transferencias = (datos.historialEventos || []).filter(e => e.animalId === id && e.tipo === 'transferencia_colonia')
  transferencias.forEach(t => {
    movs.push({ fecha: t.fecha, tipo: `Transferencia: ${t.coloniaOrigen} → ${t.coloniaDestino}`, colonia: t.coloniaDestino, jaula: '—' })
  })

  return movs.sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''))
}

// ── Utilidades de display ────────────────────────────────────────────────────
function calcEdad(f) {
  if (!f) return '—'
  const hoy = new Date(); const nac = new Date(f + 'T00:00:00')
  const m = (hoy.getFullYear() - nac.getFullYear()) * 12 + hoy.getMonth() - nac.getMonth()
  if (m < 1) return `${Math.floor((hoy - nac) / 86400000)} días`
  if (m < 12) return `${m} meses`
  const a = Math.floor(m / 12)
  return `${a} año${a > 1 ? 's' : ''}${m % 12 > 0 ? ` ${m % 12} m.` : ''}`
}
function fmt(d) {
  if (!d) return '—'
  const p = d.split('T')[0].split('-')
  return `${p[2]}/${p[1]}/${p[0]}`
}

// ── Componentes base ─────────────────────────────────────────────────────────
function Badge({ children, color }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, border: `1px solid ${color}50`, color }}>
      {children}
    </span>
  )
}

function Fila({ label, value }) {
  const { tema } = useTheme()
  return (
    <div>
      <div style={{ color: tema.textMuted, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: tema.textPrimary }}>{value ?? '—'}</div>
    </div>
  )
}

function TabBtn({ label, active, onClick, accent }) {
  const { tema } = useTheme()
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
      style={{
        background: active ? `${accent}18` : 'transparent',
        border: `1px solid ${active ? accent + '50' : 'transparent'}`,
        color: active ? accent : tema.textMuted, cursor: 'pointer',
      }}>
      {label}
    </button>
  )
}

// ── Tarjeta de animal para genealogía ────────────────────────────────────────
function AnimalCard({ animalId, rol, datos, onNavegar }) {
  const { tema } = useTheme()
  const cfg = useICIVET()

  if (!animalId) {
    return (
      <div className="rounded-xl p-3 text-center" style={{ border: `1px dashed ${tema.bgCardBorde}` }}>
        <div className="text-xs" style={{ color: tema.textMuted }}>{rol ?? '—'}<br />No registrado</div>
      </div>
    )
  }

  const animal = buscarAnimal(datos, animalId)
  if (!animal) {
    return (
      <div className="rounded-xl p-3" style={{ border: `1px dashed ${tema.bgCardBorde}` }}>
        <div className="font-mono text-xs font-bold" style={{ color: tema.textMuted }}>{animalId}</div>
        <div className="text-xs mt-0.5" style={{ color: tema.textMuted, opacity: 0.5 }}>No disponible</div>
      </div>
    )
  }

  const sexColor = animal.sexo === 'macho' ? '#40c4ff' : '#ce93d8'
  const clickable = !!onNavegar

  return (
    <button
      onClick={() => onNavegar?.(animalId)}
      className="w-full rounded-xl p-3 text-left transition-all"
      style={{
        background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`,
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      {rol && <div style={{ color: tema.textMuted, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{rol}</div>}
      <div className="font-mono font-bold text-xs" style={{ color: clickable ? '#40c4ff' : tema.textPrimary }}>{getNombreAnimal(animal.id, datos)}</div>
      <div className="text-xs mt-0.5" style={{ color: sexColor }}>
        {animal.sexo === 'macho' ? '♂' : '♀'} {animal.sexo}
      </div>
      {animal.generacion && <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>{animal.generacion}</div>}
      {animal.fechaNacimiento && <div className="text-xs mt-0.5" style={{ color: tema.textMuted }}>Nac. {fmt(animal.fechaNacimiento)}</div>}
      {clickable && <div style={{ color: '#40c4ff', fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>→ Ver ficha</div>}
    </button>
  )
}

// ── Tab: Datos generales ─────────────────────────────────────────────────────
function TabDatos({ animal, datos, cfg }) {
  const { tema } = useTheme()
  const camada = getCamadaDeAnimal(animal, datos)
  const colonia = getColoniaActual(animal, datos)
  const jaulaInfo = getJaulaActual(animal, datos)

  const DESTINO_CFG = {
    fundacion:       { label: 'Fundación',     color: '#00e676' },
    produccion:      { label: 'Producción',    color: '#40c4ff' },
    no_seleccionado: { label: 'Stock',         color: '#ce93d8' },
  }
  const estadoDisplay = animal.destino ? DESTINO_CFG[animal.destino] : null

  const cepa = camada?.cepa ?? cfg.nombre

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Fila label="Identificador" value={
          <span className="font-mono font-bold text-base" style={{ color: cfg.color }}>{getNombreAnimal(animal.id, datos)}</span>
        } />
        <Fila label="Estado / Destino" value={
          estadoDisplay
            ? <Badge color={estadoDisplay.color}>{estadoDisplay.label}</Badge>
            : animal.generacion
              ? <Badge color={cfg.color}>{animal.generacion}</Badge>
              : '—'
        } />
        <Fila label="Sexo" value={animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'} />
        <Fila label="Cepa" value={cepa} />
        <Fila label="Fecha de nacimiento" value={fmt(animal.fechaNacimiento)} />
        <Fila label="Edad" value={calcEdad(animal.fechaNacimiento)} />
        <Fila label="Colonia actual" value={colonia} />
        <Fila label="Jaula actual" value={jaulaInfo ? `${jaulaInfo.codigo} (${jaulaInfo.colonia})` : '—'} />
        {animal.pesoDestete != null && <Fila label="Peso al destete" value={`${animal.pesoDestete} g`} />}
        {animal.generacion && <Fila label="Generación" value={animal.generacion} />}
        {animal.origen && <Fila label="Origen" value={animal.origen} />}
      </div>

      {camada && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: `${cfg.color}06`, border: `1px solid ${cfg.color}20` }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.color }}>Camada de origen</div>
          <div className="grid grid-cols-2 gap-3">
            <Fila label="Código" value={<span className="font-mono font-bold" style={{ color: cfg.color }}>{camada.codigo || camada.id}</span>} />
            <Fila label="Fecha nacimiento" value={fmt(camada.fechaNacimiento)} />
            <Fila label="Padre" value={<span className="font-mono font-semibold" style={{ color: '#40c4ff' }}>♂ {getNombreAnimal(camada.padreId ?? camada.machoId, datos) ?? '—'}</span>} />
            <Fila label="Madre(s)" value={
              <span className="font-mono font-semibold" style={{ color: '#ce93d8' }}>
                ♀ {camada.madreId
                  ? getNombreAnimal(camada.madreId, datos)
                  : camada.hembraIds?.map(h => getNombreAnimal(h, datos)).join(', ') ?? '—'}
              </span>
            } />
          </div>
        </div>
      )}

      {(animal.padreId || animal.madreId) && (
        <div className="rounded-xl p-4 space-y-2" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>Filiación directa</div>
          <div className="grid grid-cols-2 gap-2">
            {animal.padreId
              ? <div className="text-sm font-mono font-semibold" style={{ color: '#40c4ff' }}>♂ Padre: {getNombreAnimal(animal.padreId, datos)}</div>
              : <div className="text-sm" style={{ color: tema.textMuted }}>Padre no registrado</div>}
            {animal.madreId
              ? <div className="text-sm font-mono font-semibold" style={{ color: '#ce93d8' }}>♀ Madre: {getNombreAnimal(animal.madreId, datos)}</div>
              : <div className="text-sm" style={{ color: tema.textMuted }}>Madre no registrada</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab: Genealogía ──────────────────────────────────────────────────────────
const NIVEL_LABELS = ['Padres', 'Abuelos', 'Bisabuelos', 'Tatarabuelos', 'Trisabuelos', 'Cuatrisabuelos']

function TabGenealogiaICIVET({ animal, datos, cfg, onNavegar }) {
  const { tema } = useTheme()
  const niveles = computeNiveles(animal.id, datos)
  const descendientes = (datos.animales ?? []).filter(
    a => a.padreId === animal.id || a.madreId === animal.id
  )

  return (
    <div className="space-y-5">
      {niveles.length === 0 && descendientes.length === 0 ? (
        <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>
          Sin genealogía registrada en el sistema para este animal.
        </div>
      ) : (
        <>
          {/* Árbol ascendente: de ancestros más lejanos a padres */}
          {[...niveles].reverse().map((ancestorIds, i) => {
            const nivelNum = niveles.length - i
            const label = NIVEL_LABELS[nivelNum - 1] ?? `Generación +${nivelNum}`
            const cols = Math.min(ancestorIds.length, 4)
            return (
              <div key={nivelNum}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>
                  {label} <span style={{ opacity: 0.5 }}>— Generación {nivelNum}</span>
                </div>
                <div className="gap-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {ancestorIds.map((id, j) => (
                    <AnimalCard key={j} animalId={id} datos={datos} onNavegar={id ? onNavegar : null} />
                  ))}
                </div>
                <div className="text-center text-base mt-2" style={{ color: tema.textMuted }}>↓</div>
              </div>
            )
          })}

          {/* Animal actual */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: cfg.color }}>Animal actual</div>
            <div className="rounded-xl p-4" style={{ background: `${cfg.color}08`, border: `1.5px solid ${cfg.color}40` }}>
              <div className="font-mono font-bold text-base" style={{ color: cfg.color }}>{getNombreAnimal(animal.id, datos)}</div>
              <div className="text-sm mt-0.5" style={{ color: animal.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>
                {animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'}
                {animal.fechaNacimiento ? ` · Nac. ${fmt(animal.fechaNacimiento)}` : ''}
                {animal.generacion ? ` · ${animal.generacion}` : ''}
              </div>
            </div>
          </div>

          {/* Descendientes */}
          {descendientes.length > 0 && (
            <div>
              <div className="text-center text-base mb-2" style={{ color: tema.textMuted }}>↓</div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tema.textMuted }}>
                Descendientes ({descendientes.length})
              </div>
              <div className="space-y-1.5">
                {descendientes.map(d => (
                  <button key={d.id} onClick={() => onNavegar(d.id)}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all"
                    style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, cursor: 'pointer' }}>
                    <span style={{ color: d.sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>{d.sexo === 'macho' ? '♂' : '♀'}</span>
                    <span className="font-mono font-bold text-sm" style={{ color: tema.textPrimary }}>{getNombreAnimal(d.id, datos)}</span>
                    <span className="text-xs" style={{ color: tema.textMuted }}>
                      Nac. {fmt(d.fechaNacimiento)}
                      {d.destino ? ` · ${({ fundacion: 'Fundación', produccion: 'Producción', no_seleccionado: 'Stock' }[d.destino] ?? d.destino)}` : ''}
                    </span>
                    <span className="ml-auto text-xs font-semibold" style={{ color: '#40c4ff' }}>→ Ver ficha</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Tab: Historial ───────────────────────────────────────────────────────────
function TabHistorial({ animal, datos }) {
  const { tema } = useTheme()
  const eventos = buildHistorial(animal, datos)

  if (eventos.length === 0) {
    return <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin eventos registrados.</div>
  }

  return (
    <div className="space-y-0">
      {eventos.map((ev, i) => (
        <div key={ev.id ?? i} className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ev.color }} />
            {i < eventos.length - 1 && <div className="w-px flex-1 my-1" style={{ background: tema.bgCardBorde }} />}
          </div>
          <div className="flex-1 min-w-0 pb-4">
            <div className="rounded-xl p-3" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}40`, color: ev.color }}>
                  {ev.tipoLabel ?? ev.tipo}
                </span>
                {ev.fecha && <span className="font-mono text-xs" style={{ color: tema.textMuted }}>{fmt(ev.fecha)}</span>}
                {ev.usuario && <span className="text-xs" style={{ color: tema.textMuted }}>— {ev.usuario}</span>}
              </div>
              <div className="text-sm" style={{ color: tema.textPrimary }}>{ev.descripcion}</div>
              {ev.observaciones && <div className="text-xs mt-1" style={{ color: tema.textMuted }}>{ev.observaciones}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Movimientos ─────────────────────────────────────────────────────────
function TabMovimientos({ animal, datos, cfg }) {
  const { tema } = useTheme()
  const movs = buildMovimientos(animal, datos)

  if (movs.length === 0) {
    return <div className="text-sm text-center py-8" style={{ color: tema.textMuted }}>Sin movimientos registrados.</div>
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
              {['Fecha', 'Evento', 'Colonia', 'Jaula / Camada'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: tema.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movs.map((mov, i) => (
              <tr key={i} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap" style={{ color: tema.textMuted }}>{fmt(mov.fecha)}</td>
                <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: tema.textSecondary }}>{mov.tipo}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                    {mov.colonia}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: tema.textPrimary }}>{mov.jaula}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted }}>
        ℹ️ Movimientos derivados automáticamente de los registros del sistema. Agregá eventos manuales desde la pestaña <strong style={{ color: tema.textSecondary }}>+ Evento</strong>.
      </div>
    </div>
  )
}

// ── Tab: Registrar Evento ────────────────────────────────────────────────────
function TabRegistrarEvento({ animal, especieId, cfg, datos, onEventoRegistrado }) {
  const { registrarEventoAnimal } = useICIVET()
  const { tema } = useTheme()
  const [tipo,         setTipo]         = useState('observacion')
  const [descripcion,  setDescripcion]  = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [usuario,      setUsuario]      = useState('')
  const [fecha,        setFecha]        = useState(new Date().toISOString().split('T')[0])
  const [guardado,     setGuardado]     = useState(false)

  function handleGuardar() {
    if (!descripcion.trim()) return
    registrarEventoAnimal(especieId, {
      id: `EV-${Date.now()}`,
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
    background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`,
    color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px',
    fontSize: '13px', outline: 'none', width: '100%',
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: `${cfg.color}06`, border: `1px solid ${cfg.color}20`, color: tema.textMuted }}>
        Registrando evento para <span className="font-mono font-bold" style={{ color: cfg.color }}>{getNombreAnimal(animal.id, datos)}</span>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>Tipo de evento</label>
        <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inp, cursor: 'pointer', background: 'rgba(8,13,26,0.95)' }}>
          {Object.entries(TIPOS_EVENTO).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>Responsable</label>
          <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder="Nombre del responsable" style={inp} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>Descripción *</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
          placeholder="Describir el evento en detalle..."
          style={{ ...inp, resize: 'vertical' }} />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: tema.textMuted }}>Observaciones adicionales</label>
        <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2}
          placeholder="Opcional"
          style={{ ...inp, resize: 'vertical' }} />
      </div>

      <button onClick={handleGuardar} disabled={!descripcion.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-bold"
        style={{
          background: descripcion.trim() ? `${cfg.color}18` : `${cfg.color}08`,
          border: `1.5px solid ${descripcion.trim() ? cfg.color + '50' : cfg.color + '20'}`,
          color: descripcion.trim() ? cfg.color : '#4a5f7a',
          cursor: descripcion.trim() ? 'pointer' : 'not-allowed',
        }}>
        {guardado ? '✓ Evento registrado' : 'Registrar evento'}
      </button>
    </div>
  )
}

// ── Modal: Transferir animal ─────────────────────────────────────────────────
function ModalTransferirAnimal({ animal, especieId, cfg, datos, onClose, onTransferido }) {
  const { transferirAnimal } = useICIVET()
  const { tema } = useTheme()
  const [destino,      setDestino]      = useState('')
  const [fecha,        setFecha]        = useState(new Date().toISOString().split('T')[0])
  const [responsable,  setResponsable]  = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [confirmado,   setConfirmado]   = useState(false)

  const coloniaKey = getColoniaKey(animal)
  const coloniaActual = getColoniaActual(animal, {})
  const destinosValidos = DESTINOS_VALIDOS[coloniaKey] ?? []
  const destinoSel = destinosValidos.find(d => d.key === destino)
  const valido = !!destino && !!destinoSel

  function confirmar() {
    if (!valido) return
    transferirAnimal(
      especieId,
      animal.id,
      coloniaActual,
      destinoSel.label,
      destinoSel.key,
      fecha,
      responsable.trim() || 'Sistema',
      observaciones.trim(),
    )
    setConfirmado(true)
    setTimeout(() => { onTransferido?.(); onClose() }, 1200)
  }

  const inp = {
    background: 'rgba(8,13,26,0.8)', border: `1px solid ${tema.bgCardBorde}`,
    color: tema.textPrimary, borderRadius: '10px', padding: '8px 12px',
    fontSize: '13px', outline: 'none', width: '100%',
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#080d1a', border: `1.5px solid #8a9bb040`, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(138,155,176,0.2)', background: 'rgba(138,155,176,0.04)' }}>
          <div className="font-bold text-base" style={{ color: '#c9d4e0' }}>Transferir animal</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: '#4a5f7a' }}>{getNombreAnimal(animal.id, datos)}</div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Origen */}
          <div className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(138,155,176,0.15)' }}>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a5f7a' }}>Colonia actual</div>
            <div className="ml-auto">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(138,155,176,0.12)', border: '1px solid rgba(138,155,176,0.3)', color: '#8a9bb0' }}>
                {coloniaActual}
              </span>
            </div>
          </div>

          {destinosValidos.length === 0 ? (
            <div className="text-sm text-center py-4" style={{ color: '#8a9bb0' }}>
              Este animal no puede ser transferido desde su colonia actual.
            </div>
          ) : (
            <>
              {/* Destino */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#4a5f7a' }}>Colonia de destino</label>
                <div className="space-y-2">
                  {destinosValidos.map(d => (
                    <button key={d.key} onClick={() => setDestino(d.key)}
                      className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all"
                      style={{
                        background: destino === d.key ? `${d.color}12` : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${destino === d.key ? d.color + '50' : 'rgba(138,155,176,0.15)'}`,
                        cursor: 'pointer',
                      }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: destino === d.key ? d.color : '#4a5f7a' }} />
                      <span className="text-sm font-semibold" style={{ color: destino === d.key ? d.color : tema.textSecondary }}>
                        {d.label}
                      </span>
                      {destino === d.key && <span className="ml-auto text-xs" style={{ color: d.color }}>✓ Seleccionado</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Fecha de transferencia</label>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
              </div>

              {/* Responsable */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Responsable</label>
                <input type="text" value={responsable} onChange={e => setResponsable(e.target.value)}
                  placeholder="Nombre del responsable" style={inp} />
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>Observaciones</label>
                <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                  rows={2} placeholder="Opcional" style={{ ...inp, resize: 'vertical' }} />
              </div>

              {/* Aviso */}
              {valido && (
                <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(138,155,176,0.06)', border: '1px solid rgba(138,155,176,0.2)', color: '#8a9bb0' }}>
                  El animal <span className="font-mono font-bold" style={{ color: cfg.color }}>{getNombreAnimal(animal.id, datos)}</span> se moverá de{' '}
                  <strong>{coloniaActual}</strong> a <strong>{destinoSel?.label}</strong>. Se conservará toda su información, genealogía e historial.
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={confirmar} disabled={!valido || confirmado}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: confirmado ? 'rgba(0,230,118,0.18)' : valido ? 'rgba(138,155,176,0.15)' : 'rgba(138,155,176,0.05)',
                    border: `1.5px solid ${confirmado ? 'rgba(0,230,118,0.5)' : valido ? 'rgba(138,155,176,0.4)' : 'rgba(138,155,176,0.15)'}`,
                    color: confirmado ? '#00e676' : valido ? '#c9d4e0' : '#4a5f7a',
                    cursor: valido && !confirmado ? 'pointer' : 'not-allowed',
                  }}>
                  {confirmado ? '✓ Transferido' : 'Confirmar transferencia'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────
export default function FichaAnimalICIVET({ animalId, especieId, onClose }) {
  const { tema } = useTheme()
  const { getDatosEspecie } = useICIVET()
  const cfg = ESPECIES_CONFIG[especieId]

  const [navStack, setNavStack] = useState([animalId])
  const [tabActivo, setTabActivo] = useState('datos')
  const [modalTransferir, setModalTransferir] = useState(false)

  const fichaId = navStack[navStack.length - 1]
  const datos   = getDatosEspecie(especieId)
  const animal  = buscarAnimal(datos, fichaId)

  function navegarA(id) {
    if (id && id !== fichaId) {
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

  if (!animal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,8,16,0.92)' }} onClick={onClose}>
        <div className="rounded-2xl p-8 text-center" style={{ background: '#080d1a', border: `1.5px solid ${cfg?.color ?? '#fff'}40` }}
          onClick={e => e.stopPropagation()}>
          <div style={{ color: tema.textMuted }}>
            Animal <span className="font-mono" style={{ color: cfg?.color }}>{fichaId}</span> no encontrado.
          </div>
          <button onClick={onClose} style={{ color: cfg?.color, background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px', fontSize: '13px' }}>
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  const historial = buildHistorial(animal, datos)

  const TABS = [
    { id: 'datos',       label: 'Datos generales' },
    { id: 'genealogia',  label: 'Genealogía' },
    { id: 'historial',   label: `Historial (${historial.length})` },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'evento',      label: '+ Evento' },
  ]

  const sexColor = animal.sexo === 'macho' ? '#40c4ff' : '#ce93d8'

  const coloniaKey = getColoniaKey(animal)
  // Solo animales con campo `destino` pueden transferirse (excluye reproductores de Fundación)
  const puedeTransferir = !!animal.destino && !!coloniaKey && (DESTINOS_VALIDOS[coloniaKey]?.length ?? 0) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      {modalTransferir && (
        <ModalTransferirAnimal
          animal={animal}
          especieId={especieId}
          cfg={cfg}
          datos={datos}
          onClose={() => setModalTransferir(false)}
          onTransferido={() => setTabActivo('movimientos')}
        />
      )}
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#080d1a', border: `1.5px solid ${cfg.color}40`, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Breadcrumb / navegación */}
        {navStack.length > 1 && (
          <div className="px-4 pt-2.5 pb-2 flex items-center gap-2 shrink-0 flex-wrap"
            style={{ borderBottom: `1px solid ${cfg.color}15`, background: `${cfg.color}03` }}>
            <button onClick={volver}
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}35`, color: cfg.color, cursor: 'pointer' }}>
              ← Volver
            </button>
            <div className="text-xs flex items-center gap-1 overflow-x-auto">
              {navStack.map((id, i) => (
                <span key={`${id}-${i}`}>
                  {i > 0 && <span style={{ color: tema.textMuted }}> / </span>}
                  <span className="font-mono"
                    style={{ color: i === navStack.length - 1 ? cfg.color : tema.textMuted, fontWeight: i === navStack.length - 1 ? 700 : 400 }}>
                    {getNombreAnimal(id, datos)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3 shrink-0"
          style={{ borderBottom: `1px solid ${cfg.color}20`, background: `${cfg.color}04` }}>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-bold text-lg" style={{ color: cfg.color }}>{getNombreAnimal(animal.id, datos)}</div>
            <div className="text-xs mt-0.5 flex flex-wrap gap-1" style={{ color: tema.textMuted }}>
              <span style={{ color: sexColor }}>{animal.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'}</span>
              {animal.fechaNacimiento && <>
                <span>·</span>
                <span>Nac. {fmt(animal.fechaNacimiento)}</span>
                <span>·</span>
                <span>{calcEdad(animal.fechaNacimiento)}</span>
              </>}
              {animal.generacion && <><span>·</span><span>{animal.generacion}</span></>}
              <span>·</span>
              <span>{cfg.nombre}</span>
            </div>
          </div>
          {puedeTransferir && (
            <button onClick={e => { e.stopPropagation(); setModalTransferir(true) }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
              style={{ background: 'rgba(138,155,176,0.12)', border: '1px solid rgba(138,155,176,0.35)', color: '#8a9bb0', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ↔ Transferir
            </button>
          )}
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: 'rgba(255,107,128,0.12)', border: '1px solid rgba(255,107,128,0.3)', color: '#ff6b80', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0 flex-wrap" style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
          {TABS.map(t => (
            <TabBtn key={t.id} label={t.label} active={tabActivo === t.id} onClick={() => setTabActivo(t.id)} accent={cfg.color} />
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tabActivo === 'datos'       && <TabDatos animal={animal} datos={datos} cfg={cfg} />}
          {tabActivo === 'genealogia'  && <TabGenealogiaICIVET animal={animal} datos={datos} cfg={cfg} onNavegar={navegarA} />}
          {tabActivo === 'historial'   && <TabHistorial animal={animal} datos={datos} />}
          {tabActivo === 'movimientos' && <TabMovimientos animal={animal} datos={datos} cfg={cfg} />}
          {tabActivo === 'evento'      && <TabRegistrarEvento animal={animal} especieId={especieId} cfg={cfg} datos={datos} onEventoRegistrado={() => setTabActivo('historial')} />}
        </div>
      </div>
    </div>
  )
}
