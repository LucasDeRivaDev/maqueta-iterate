import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useICIVET, ESPECIES_CONFIG } from '../context/ICIVETContext'
import FichaAnimalICIVET from './FichaAnimalICIVET'

const TABS_FUND = [
  { id: 'parejas', label: 'Parejas' },
  { id: 'camadas', label: 'Camadas' },
  { id: 'seleccion', label: 'Selección' },
  { id: 'genealogia', label: 'Genealogía' },
]

const DESTINO_CONFIG = {
  fundacion:      { label: 'Fundación',     color: '#00e676', bg: 'rgba(0,230,118,0.12)',  borde: 'rgba(0,230,118,0.4)'  },
  produccion:     { label: 'Producción',    color: '#40c4ff', bg: 'rgba(64,196,255,0.12)', borde: 'rgba(64,196,255,0.4)' },
  no_seleccionado: { label: 'No selec.',    color: '#8a9bb0', bg: 'rgba(138,155,176,0.1)', borde: 'rgba(138,155,176,0.3)' },
}

// ── Badge de destino ─────────────────────────────────────────────────────────
function BadgeDestino({ destino }) {
  if (!destino) return <span style={{ color: '#4a5f7a', fontSize: '12px' }}>—</span>
  const d = DESTINO_CONFIG[destino]
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: d.bg, border: `1px solid ${d.borde}`, color: d.color }}
    >
      {d.label}
    </span>
  )
}

// ── Badge de estado de pareja ─────────────────────────────────────────────────
function BadgeEstado({ estado }) {
  const esActivo = estado === 'activo'
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: esActivo ? 'rgba(0,230,118,0.1)' : 'rgba(138,155,176,0.08)',
        border: `1px solid ${esActivo ? 'rgba(0,230,118,0.35)' : 'rgba(138,155,176,0.25)'}`,
        color: esActivo ? '#00e676' : '#8a9bb0',
      }}
    >
      {esActivo ? '● Activo' : '○ Inactivo'}
    </span>
  )
}

// ── Modal de destete ─────────────────────────────────────────────────────────
function ModalDestete({ camada, onClose, onConfirmar, tema }) {
  const [cantidad, setCantidad]   = useState(camada.cantidadNacida)
  const [machos, setMachos]       = useState('')
  const [hembras, setHembras]     = useState('')
  const [fecha, setFecha]         = useState(new Date().toISOString().split('T')[0])

  function confirmar() {
    const m = parseInt(machos) || 0
    const h = parseInt(hembras) || 0
    if (m + h !== parseInt(cantidad)) return
    onConfirmar(parseInt(cantidad), m, h, fecha)
  }

  const m = parseInt(machos) || 0
  const h = parseInt(hembras) || 0
  const suma = m + h
  const totalOk = suma === parseInt(cantidad)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0d1528', border: '1.5px solid rgba(0,230,118,0.3)', boxShadow: '0 0 60px rgba(0,230,118,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(0,230,118,0.1)', background: 'rgba(0,230,118,0.03)' }}>
          <h3 className="text-base font-bold" style={{ color: '#c9d4e0' }}>Registrar destete</h3>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#4a5f7a' }}>{camada.codigo}</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>
              Cantidad destetada
            </label>
            <input
              type="number" value={cantidad} onChange={e => setCantidad(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,51,82,0.9)', color: '#c9d4e0' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>
                Machos ♂
              </label>
              <input
                type="number" value={machos} onChange={e => setMachos(e.target.value)} placeholder="0"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,51,82,0.9)', color: '#c9d4e0' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>
                Hembras ♀
              </label>
              <input
                type="number" value={hembras} onChange={e => setHembras(e.target.value)} placeholder="0"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,51,82,0.9)', color: '#c9d4e0' }}
              />
            </div>
          </div>
          {machos !== '' && hembras !== '' && (
            <div
              className="text-xs text-center rounded-lg py-2"
              style={{
                background: totalOk ? 'rgba(0,230,118,0.08)' : 'rgba(255,61,87,0.08)',
                border: `1px solid ${totalOk ? 'rgba(0,230,118,0.3)' : 'rgba(255,61,87,0.3)'}`,
                color: totalOk ? '#00e676' : '#ff6b80',
              }}
            >
              {totalOk ? `✓ ${m}M + ${h}H = ${suma} — correcto` : `${m}M + ${h}H = ${suma} ≠ ${cantidad} — revisar`}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-1.5" style={{ color: '#4a5f7a' }}>
              Fecha de destete
            </label>
            <input
              type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(8,13,26,0.8)', border: '1px solid rgba(30,51,82,0.9)', color: '#c9d4e0' }}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid rgba(30,51,82,0.9)', color: '#8a9bb0', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={confirmar} disabled={!totalOk}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: totalOk ? 'rgba(0,230,118,0.15)' : 'rgba(0,230,118,0.05)',
                border: `1.5px solid ${totalOk ? 'rgba(0,230,118,0.4)' : 'rgba(0,230,118,0.15)'}`,
                color: totalOk ? '#00e676' : '#4a5f7a',
                cursor: totalOk ? 'pointer' : 'not-allowed',
              }}>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Parejas ─────────────────────────────────────────────────────────────
function TabParejas({ datos, reproductores, tema, onFichaAnimal }) {
  function getNombre(id) {
    const r = reproductores.find(r => r.id === id)
    return r ? r.nombre : id
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Parejas reproductoras activas</h3>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', color: '#00e676' }}
        >
          {datos.filter(p => p.estado === 'activo').length} activas
        </span>
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${tema.bgCardBorde}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(8,13,26,0.6)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
              {['Macho', 'Hembra', 'Cepa', 'Fecha apareamiento', 'Estado'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                  style={{ color: tema.textMuted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((p, i) => (
              <tr
                key={p.id}
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(13,21,40,0.3)',
                  borderBottom: i < datos.length - 1 ? `1px solid ${tema.bgCardBorde}` : 'none',
                }}
              >
                <td className="px-4 py-3">
                  <button onClick={() => onFichaAnimal(p.machoId)} className="font-mono font-semibold text-sm"
                    style={{ color: tema.blue, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    ♂ {getNombre(p.machoId)}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onFichaAnimal(p.hembraId)} className="font-mono font-semibold text-sm"
                    style={{ color: tema.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    ♀ {getNombre(p.hembraId)}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono" style={{ color: tema.textSecondary }}>{p.cepa}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono" style={{ color: tema.textSecondary }}>{p.fechaApareamiento}</span>
                </td>
                <td className="px-4 py-3"><BadgeEstado estado={p.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-2">
        {datos.map((p) => (
          <div key={p.id} className="rounded-xl p-4"
            style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-sm" style={{ color: tema.blue }}>♂ {p.machoId}</span>
                <span style={{ color: tema.textMuted }}>×</span>
                <span className="font-mono font-semibold text-sm" style={{ color: tema.purple }}>♀ {p.hembraId}</span>
              </div>
              <BadgeEstado estado={p.estado} />
            </div>
            <div className="text-xs font-mono" style={{ color: tema.textMuted }}>
              {p.cepa} · {p.fechaApareamiento}
            </div>
          </div>
        ))}
      </div>

      {/* Reproductores activos */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: tema.textSecondary }}>
          Reproductores del núcleo de Fundación
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {reproductores.map((r) => (
            <button key={r.id} onClick={() => onFichaAnimal(r.id)}
              className="rounded-xl px-3 py-2.5 flex items-center gap-2 w-full text-left"
              style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}`, cursor: 'pointer' }}>
              <span style={{ color: r.sexo === 'macho' ? tema.blue : tema.purple, fontSize: '13px' }}>
                {r.sexo === 'macho' ? '♂' : '♀'}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-semibold truncate" style={{ color: tema.textPrimary }}>{r.nombre}</div>
                <div className="text-xs" style={{ color: tema.textMuted }}>{r.generacion}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Camadas ─────────────────────────────────────────────────────────────
function TabCamadas({ camadas, especieId, tema }) {
  const { registrarDestete } = useICIVET()
  const [modalCamada, setModalCamada] = useState(null)

  function confirmarDestete(cantidad, machos, hembras, fecha) {
    registrarDestete(especieId, modalCamada.id, cantidad, machos, hembras, fecha)
    setModalCamada(null)
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {modalCamada && (
        <ModalDestete
          camada={modalCamada}
          onClose={() => setModalCamada(null)}
          onConfirmar={confirmarDestete}
          tema={tema}
        />
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Camadas</h3>
        <div className="flex gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', color: '#00e676' }}>
            {camadas.filter(c => c.destetada).length} destetadas
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.25)', color: '#ffb300' }}>
            {camadas.filter(c => !c.destetada).length} en lactancia
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {camadas.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}
          >
            {/* Header de camada */}
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgba(8,13,26,0.4)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm" style={{ color: tema.accent }}>{c.codigo}</span>
                <span className="text-xs font-mono" style={{ color: tema.textMuted }}>{c.cepa}</span>
              </div>
              <div className="flex items-center gap-2">
                {c.destetada ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676' }}>
                    ✓ Destetada
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)', color: '#ffb300' }}>
                      En lactancia
                    </span>
                    <button
                      onClick={() => setModalCamada(c)}
                      className="text-xs font-bold px-3 py-1 rounded-lg"
                      style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.35)', color: '#00e676', cursor: 'pointer' }}
                    >
                      Registrar destete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Datos de camada */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Padre</div>
                  <div className="font-mono text-sm font-semibold" style={{ color: tema.blue }}>♂ {c.padreId}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Madre</div>
                  <div className="font-mono text-sm font-semibold" style={{ color: tema.purple }}>♀ {c.madreId}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Nacimiento</div>
                  <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>{c.fechaNacimiento}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Nacidos</div>
                  <div className="font-mono text-sm font-bold" style={{ color: tema.textPrimary }}>{c.cantidadNacida}</div>
                </div>
              </div>

              {c.destetada && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 pt-3"
                  style={{ borderTop: `1px solid ${tema.bgCardBorde}` }}>
                  <div>
                    <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Destete</div>
                    <div className="font-mono text-sm" style={{ color: tema.textSecondary }}>{c.fechaDestete}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Destetados</div>
                    <div className="font-mono text-sm font-bold" style={{ color: tema.accent }}>{c.cantidadDestetada}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Machos</div>
                    <div className="font-mono text-sm font-bold" style={{ color: tema.blue }}>♂ {c.machos}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: tema.textMuted }}>Hembras</div>
                    <div className="font-mono text-sm font-bold" style={{ color: tema.purple }}>♀ {c.hembras}</div>
                  </div>
                </div>
              )}

              {c.observaciones && (
                <div className="rounded-xl px-3 py-2 text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${tema.bgCardBorde}`, color: tema.textMuted }}>
                  📝 {c.observaciones}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Selección de reproductores ─────────────────────────────────────────
function TabSeleccion({ animales, camadas, especieId, tema, onFichaAnimal }) {
  const { setDestinoAnimal } = useICIVET()

  const animalesConCamada = animales.map((a) => ({
    ...a,
    camada: camadas.find((c) => c.id === a.camadaId),
  }))

  const porCamada = camadas.filter(c => c.destetada).reduce((acc, c) => {
    acc[c.id] = animalesConCamada.filter((a) => a.camadaId === c.id)
    return acc
  }, {})

  const totalAnimales = animales.length
  const fundacion  = animales.filter(a => a.destino === 'fundacion').length
  const produccion = animales.filter(a => a.destino === 'produccion').length
  const noSel      = animales.filter(a => a.destino === 'no_seleccionado').length
  const sinAsignar = animales.filter(a => !a.destino).length

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Selección de futuros reproductores</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: `${fundacion} Fundación`, color: '#00e676', bg: 'rgba(0,230,118,0.1)' },
            { label: `${produccion} Producción`, color: '#40c4ff', bg: 'rgba(64,196,255,0.1)' },
            { label: `${noSel} No selec.`, color: '#8a9bb0', bg: 'rgba(138,155,176,0.08)' },
            ...(sinAsignar > 0 ? [{ label: `${sinAsignar} sin asignar`, color: '#ffb300', bg: 'rgba(255,179,0,0.1)' }] : []),
          ].map(({ label, color, bg }) => (
            <span key={label} className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ background: bg, border: `1px solid ${color}50`, color }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ background: 'rgba(0,230,118,0.04)', border: '1px solid rgba(0,230,118,0.15)', color: tema.textMuted }}
      >
        ℹ️ La selección solo registra la decisión. No mueve automáticamente los animales entre sectores.
      </div>

      {Object.entries(porCamada).length === 0 ? (
        <div className="text-center py-8" style={{ color: tema.textMuted }}>
          No hay camadas destetadas con animales disponibles.
        </div>
      ) : (
        Object.entries(porCamada).map(([camadaId, animalesDeCamada]) => {
          const camada = camadas.find(c => c.id === camadaId)
          if (!camada || animalesDeCamada.length === 0) return null

          return (
            <div key={camadaId} className="rounded-2xl overflow-hidden"
              style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
              <div className="px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(8,13,26,0.4)', borderBottom: `1px solid ${tema.bgCardBorde}` }}>
                <span className="font-mono font-bold text-sm" style={{ color: tema.accent }}>{camadaId}</span>
                <span className="text-xs font-mono" style={{ color: tema.textMuted }}>
                  ♂ {camada.padreId} × ♀ {camada.madreId} · Nac. {camada.fechaNacimiento}
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: tema.bgCardBorde }}>
                {animalesDeCamada.map((animal) => (
                  <div key={animal.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-32">
                      <span style={{ color: animal.sexo === 'macho' ? tema.blue : tema.purple, fontSize: '14px' }}>
                        {animal.sexo === 'macho' ? '♂' : '♀'}
                      </span>
                      <button onClick={() => onFichaAnimal(animal.id)}
                        className="font-mono text-sm font-semibold"
                        style={{ color: tema.textPrimary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationColor: 'rgba(255,179,0,0.4)' }}>
                        {animal.id}
                      </button>
                    </div>
                    {animal.pesoDestete && (
                      <span className="text-xs font-mono" style={{ color: tema.textMuted }}>
                        {animal.pesoDestete}g
                      </span>
                    )}
                    <div className="ml-auto flex gap-2 flex-wrap">
                      {['fundacion', 'produccion', 'no_seleccionado'].map((dest) => {
                        const d = DESTINO_CONFIG[dest]
                        const activo = animal.destino === dest
                        return (
                          <button
                            key={dest}
                            onClick={() => setDestinoAnimal(especieId, animal.id, activo ? null : dest)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{
                              background: activo ? d.bg : 'transparent',
                              border: `1px solid ${activo ? d.borde : tema.bgCardBorde}`,
                              color: activo ? d.color : tema.textMuted,
                              cursor: 'pointer',
                            }}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Tab: Genealogía ─────────────────────────────────────────────────────────
function TabGenealogia({ animales, camadas, reproductores, tema, onFichaAnimal }) {
  const [vistaCamada, setVistaCamada] = useState(null)

  function getReproductor(id) {
    return reproductores.find(r => r.id === id)
  }

  const camadasConAnimales = camadas.filter(c => c.destetada).map(c => ({
    ...c,
    animalesDestino: animales.filter(a => a.camadaId === c.id),
  }))

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold" style={{ color: tema.textPrimary }}>Genealogía — Núcleo Fundación</h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(206,147,216,0.1)', border: '1px solid rgba(206,147,216,0.3)', color: '#ce93d8' }}>
          {animales.length} animales registrados
        </span>
      </div>

      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ background: 'rgba(206,147,216,0.05)', border: '1px solid rgba(206,147,216,0.15)', color: tema.textMuted }}
      >
        🧬 Trazabilidad completa: cada animal conserva padre, madre, camada de origen y destino asignado.
      </div>

      {/* Árbol por camadas */}
      <div className="space-y-3">
        {camadasConAnimales.map((camada) => {
          const padre = getReproductor(camada.padreId)
          const madre = getReproductor(camada.madreId)
          const expandida = vistaCamada === camada.id

          return (
            <div key={camada.id} className="rounded-2xl overflow-hidden"
              style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
              {/* Fila resumen de camada */}
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-4"
                onClick={() => setVistaCamada(expandida ? null : camada.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm" style={{ color: tema.accent }}>{camada.codigo}</span>
                    <span className="text-xs font-mono" style={{ color: tema.textMuted }}>
                      Nac. {camada.fechaNacimiento}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span style={{ color: tema.blue }}>
                      ♂ {padre ? `${padre.nombre} (${padre.generacion})` : camada.padreId}
                    </span>
                    <span style={{ color: tema.textMuted }}>×</span>
                    <span style={{ color: tema.purple }}>
                      ♀ {madre ? `${madre.nombre} (${madre.generacion})` : camada.madreId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-mono text-right" style={{ color: tema.textMuted }}>
                    <div style={{ color: tema.blue }}>♂ {camada.machos}</div>
                    <div style={{ color: tema.purple }}>♀ {camada.hembras}</div>
                  </div>
                  <span style={{ color: tema.textMuted, fontSize: '16px', transition: 'transform 0.2s', transform: expandida ? 'rotate(90deg)' : 'none' }}>›</span>
                </div>
              </button>

              {/* Animales de la camada */}
              {expandida && (
                <div style={{ borderTop: `1px solid ${tema.bgCardBorde}` }}>
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: tema.textMuted, background: 'rgba(8,13,26,0.3)' }}>
                    Trazabilidad individual
                  </div>
                  <div className="divide-y" style={{ borderColor: tema.bgCardBorde }}>
                    {camada.animalesDestino.map((a) => (
                      <div key={a.id} className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
                        <span style={{ color: a.sexo === 'macho' ? tema.blue : tema.purple }}>
                          {a.sexo === 'macho' ? '♂' : '♀'}
                        </span>
                        <button onClick={() => onFichaAnimal(a.id)}
                          className="font-mono text-xs font-semibold"
                          style={{ color: tema.textPrimary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textDecorationColor: 'rgba(255,179,0,0.4)' }}>
                          {a.id}
                        </button>
                        <div className="flex gap-1 text-xs font-mono" style={{ color: tema.textMuted }}>
                          <span>Padre: <span style={{ color: tema.blue }}>{a.padreId}</span></span>
                          <span>·</span>
                          <span>Madre: <span style={{ color: tema.purple }}>{a.madreId}</span></span>
                          <span>·</span>
                          <span>Nac. {a.fechaNacimiento}</span>
                        </div>
                        <div className="ml-auto">
                          <BadgeDestino destino={a.destino} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tabla de reproductores activos con generaciones */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: tema.textSecondary }}>
          Reproductores activos — Generaciones
        </h4>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(8,13,26,0.6)' }}>
                {['ID', 'Sexo', 'Generación', 'Origen'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: tema.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reproductores.map((r, i) => (
                <tr key={r.id} style={{ borderTop: i > 0 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
                  <td className="px-4 py-2">
                    <span className="font-mono text-sm font-semibold" style={{ color: tema.textPrimary }}>{r.nombre}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span style={{ color: r.sexo === 'macho' ? tema.blue : tema.purple, fontSize: '13px' }}>
                      {r.sexo === 'macho' ? '♂ Macho' : '♀ Hembra'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(206,147,216,0.1)', color: '#ce93d8' }}>
                      {r.generacion}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs font-mono" style={{ color: tema.accent }}>{r.origen}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Fundación principal ──────────────────────────────────────────────────────
export default function Fundacion({ especieId }) {
  const { getDatosEspecie } = useICIVET()
  const { tema } = useTheme()
  const cfg = ESPECIES_CONFIG[especieId]
  const datos = getDatosEspecie(especieId)
  const [tabActual, setTabActual] = useState('parejas')
  const [fichaAnimalId, setFichaAnimalId] = useState(null)

  if (!datos) {
    return (
      <div className="p-6 text-center" style={{ color: tema.textMuted }}>
        No hay datos para esta especie.
      </div>
    )
  }

  const { parejas, camadas, animales, reproductores } = datos

  return (
    <div className="min-h-full" style={{ background: tema.bgMain }}>
      {fichaAnimalId && (
        <FichaAnimalICIVET
          animalId={fichaAnimalId}
          especieId={especieId}
          onClose={() => setFichaAnimalId(null)}
        />
      )}
      {/* Header Fundación */}
      <div className="px-4 md:px-6 pt-5 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}` }}
          >
            🧬
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: tema.textPrimary }}>
              Colonia de Fundación
            </h2>
            <p className="text-xs font-mono" style={{ color: tema.textMuted }}>
              {cfg.nombre} · Núcleo genético permanente
            </p>
          </div>

          {/* Stats rápidas */}
          <div className="ml-auto flex gap-2 flex-wrap">
            {[
              { val: parejas.filter(p => p.estado === 'activo').length, label: 'parejas activas', color: cfg.color },
              { val: camadas.length, label: 'camadas', color: tema.purple },
              { val: animales.length, label: 'crías registradas', color: tema.blue },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center px-3 py-1.5 rounded-xl"
                style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
                <div className="font-mono font-bold text-base" style={{ color }}>{val}</div>
                <div className="text-xs" style={{ color: tema.textMuted, fontSize: '10px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-0" style={{ borderBottom: `1px solid ${tema.bgCardBorde}` }}>
          {TABS_FUND.map((tab) => {
            const activo = tabActual === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTabActual(tab.id)}
                className="px-4 py-2 text-sm font-semibold"
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: activo ? `2px solid ${cfg.color}` : '2px solid transparent',
                  color: activo ? cfg.color : tema.textMuted,
                  cursor: 'pointer', marginBottom: '-1px',
                  transition: 'color 0.15s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenido del tab activo */}
      {tabActual === 'parejas'    && <TabParejas datos={parejas} reproductores={reproductores} tema={tema} onFichaAnimal={setFichaAnimalId} />}
      {tabActual === 'camadas'    && <TabCamadas camadas={camadas} especieId={especieId} tema={tema} />}
      {tabActual === 'seleccion'  && <TabSeleccion animales={animales} camadas={camadas} especieId={especieId} tema={tema} onFichaAnimal={setFichaAnimalId} />}
      {tabActual === 'genealogia' && <TabGenealogia animales={animales} camadas={camadas} reproductores={reproductores} tema={tema} onFichaAnimal={setFichaAnimalId} />}
    </div>
  )
}
