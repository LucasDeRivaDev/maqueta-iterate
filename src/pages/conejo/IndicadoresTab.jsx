import { useTheme } from '../../context/ThemeContext'
import { useConejo } from '../../context/ConejoContext'

const ACCENT = '#ffb300'

function KPI({ valor, label, color, sub }) {
  const { tema } = useTheme()
  return (
    <div className="rounded-xl px-4 py-3 text-center" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
      <div className="font-mono font-bold text-2xl" style={{ color }}>{valor}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: tema.textMuted }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: tema.textMuted, opacity: 0.65 }}>{sub}</div>}
    </div>
  )
}

function Barra({ pct, color }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.5s' }} />
    </div>
  )
}

function TablaReproductores({ animales, servicios, sexo }) {
  const { tema } = useTheme()
  const propios = animales.filter(a => a.sexo === sexo && (a.estado === 'reproductor' || servicios.some(s => sexo === 'macho' ? s.machoId === a.id : s.hembraId === a.id)))

  function calcMacho(a) {
    const srvs = servicios.filter(s => s.machoId === a.id)
    const prenadas = srvs.filter(s => s.confirmacionPrenez?.resultado === 'positivo').length
    const partos   = srvs.filter(s => s.fechaPartoReal).length
    const nacidos  = srvs.reduce((t, s) => t + (s.nacidos?.vivos ?? 0), 0)
    const tasaPrenez = srvs.length > 0 ? ((prenadas / srvs.length) * 100).toFixed(0) : null
    return { srvs: srvs.length, prenadas, partos, nacidos, tasaPrenez }
  }

  function calcHembra(a) {
    const srvs   = servicios.filter(s => s.hembraId === a.id)
    const partos = srvs.filter(s => s.fechaPartoReal)
    const totalNac  = partos.reduce((t, s) => t + (s.nacidos?.vivos ?? 0), 0)
    const totalDest = partos.filter(s => s.destete).reduce((t, s) => t + (s.destete?.destetados ?? 0), 0)
    const promCam   = partos.length > 0 ? (totalNac / partos.length).toFixed(1) : null
    const tasaDest  = totalNac > 0 ? ((totalDest / totalNac) * 100).toFixed(0) : null
    return { srvs: srvs.length, partos: partos.length, totalNac, totalDest, promCam, tasaDest }
  }

  if (propios.length === 0) {
    return <div className="text-sm text-center py-6" style={{ color: tema.textMuted }}>Sin reproductores {sexo === 'macho' ? 'machos' : 'hembras'} registrados.</div>
  }

  const maxNacidos = Math.max(1, ...propios.map(a => sexo === 'macho' ? calcMacho(a).nacidos : calcHembra(a).totalNac))

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tema.bgCardBorde}` }}>
      {/* Header */}
      <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-widest"
        style={{ background: `${sexo === 'macho' ? '#40c4ff' : '#ce93d8'}08`, borderBottom: `1px solid ${sexo === 'macho' ? '#40c4ff' : '#ce93d8'}20`, color: sexo === 'macho' ? '#40c4ff' : '#ce93d8' }}>
        {sexo === 'macho' ? '♂ Machos Reproductores' : '♀ Hembras Reproductoras'}
      </div>
      {propios.map((a, i) => {
        const c = sexo === 'macho' ? calcMacho(a) : calcHembra(a)
        const productividad = sexo === 'macho' ? c.nacidos : c.totalNac
        const accentColor = sexo === 'macho' ? '#40c4ff' : '#ce93d8'
        return (
          <div key={a.id} className="px-5 py-4"
            style={{ borderBottom: i < propios.length - 1 ? `1px solid ${tema.bgCardBorde}` : 'none' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="font-mono font-bold text-sm" style={{ color: ACCENT }}>{a.id}</div>
              <div className="text-xs" style={{ color: tema.textMuted }}>{a.cepa}</div>
              <div className="ml-auto text-xs font-semibold" style={{ color: a.estado === 'reproductor' ? '#00e676' : tema.textMuted }}>
                {a.estado === 'reproductor' ? '● Activo' : a.estado}
              </div>
            </div>

            {sexo === 'macho' ? (
              <div className="grid grid-cols-4 gap-3 mb-2">
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: accentColor }}>{c.srvs}</div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Servicios</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: c.tasaPrenez ? '#00e676' : tema.textMuted }}>
                    {c.tasaPrenez ? c.tasaPrenez + '%' : '—'}
                  </div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Tasa preñez</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: tema.textPrimary }}>{c.partos}</div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Partos</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: '#00e676' }}>{c.nacidos}</div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Cría total</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 mb-2">
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: accentColor }}>{c.partos}</div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Partos</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: c.promCam ? '#00e676' : tema.textMuted }}>
                    {c.promCam ?? '—'}
                  </div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Prom. camada</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: c.tasaDest ? '#40c4ff' : tema.textMuted }}>
                    {c.tasaDest ? c.tasaDest + '%' : '—'}
                  </div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Tasa destete</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: '#00e676' }}>{c.totalNac}</div>
                  <div className="text-xs" style={{ color: tema.textMuted }}>Nacidos total</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="text-xs shrink-0" style={{ color: tema.textMuted }}>Productividad acumulada</div>
              <div className="flex-1">
                <Barra pct={(productividad / maxNacidos) * 100} color={accentColor} />
              </div>
              <div className="text-xs font-mono font-bold shrink-0" style={{ color: accentColor }}>{productividad}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function IndicadoresTab() {
  const { tema } = useTheme()
  const { datos } = useConejo()
  const { animales, servicios } = datos

  const reproductores = animales.filter(a => a.estado === 'reproductor')
  const partos = servicios.filter(s => s.fechaPartoReal)
  const completos = servicios.filter(s => s.destete)
  const totalNacidos    = partos.reduce((t, s) => t + (s.nacidos?.vivos ?? 0), 0)
  const totalDestetados = completos.reduce((t, s) => t + (s.destete?.destetados ?? 0), 0)
  const promCamada      = partos.length > 0 ? (totalNacidos / partos.length).toFixed(1) : '—'
  const tasaDestete     = totalNacidos > 0 ? ((totalDestetados / totalNacidos) * 100).toFixed(0) : '—'

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="font-bold text-lg mb-1" style={{ color: tema.textPrimary }}>Indicadores Reproductivos</div>
        <div className="text-sm" style={{ color: tema.textMuted }}>Métricas de performance de la colonia reproductiva de conejos</div>
      </div>

      {/* Resumen colonia */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI valor={reproductores.filter(a => a.sexo === 'macho').length}   label="Machos activos"   color="#40c4ff" />
        <KPI valor={reproductores.filter(a => a.sexo === 'hembra').length}  label="Hembras activas"  color="#ce93d8" />
        <KPI valor={promCamada}  label="Promedio de camada"    color="#00e676" sub={`${partos.length} partos`} />
        <KPI valor={`${tasaDestete}${tasaDestete !== '—' ? '%' : ''}`} label="Tasa de destete global" color={ACCENT} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tema.textMuted }}>
            Productividad por macho
          </div>
          <TablaReproductores animales={animales} servicios={servicios} sexo="macho" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tema.textMuted }}>
            Productividad por hembra
          </div>
          <TablaReproductores animales={animales} servicios={servicios} sexo="hembra" />
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: tema.bgCard, border: `1px solid ${tema.bgCardBorde}` }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tema.textMuted }}>Resumen acumulado de colonia</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
          {[
            { v: servicios.length,      l: 'Servicios',        c: ACCENT },
            { v: servicios.filter(s => s.confirmacionPrenez?.resultado === 'positivo').length, l: 'Preñeces', c: '#ce93d8' },
            { v: partos.length,         l: 'Partos',           c: '#00e676' },
            { v: totalNacidos,          l: 'Nacidos vivos',    c: '#40c4ff' },
            { v: totalDestetados,       l: 'Destetados',       c: '#00e676' },
            { v: animales.filter(a => a.padreId || a.madreId).length, l: 'Descendencia', c: '#8a9bb0' },
          ].map(({ v, l, c }) => (
            <div key={l}>
              <div className="font-mono font-bold text-xl" style={{ color: c }}>{v}</div>
              <div className="text-xs" style={{ color: tema.textMuted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
