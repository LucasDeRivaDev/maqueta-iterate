import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { ESPECIES_CONFIG } from '../context/ICIVETContext'
import { ConejoProvider, useConejo } from '../context/ConejoContext'
import ColoniaTab      from './conejo/ColoniaTab'
import CuarentenaTab   from './conejo/CuarentenaTab'
import ReproduccionTab from './conejo/ReproduccionTab'
import IndicadoresTab  from './conejo/IndicadoresTab'
import RegistroActividades from './RegistroActividades'
import logoNavDark     from '../assets/logoiterate.png'
import logoNavLight    from '../assets/logoiteratefondoclaro.png'

const ACCENT = '#ffb300'
const cfg    = ESPECIES_CONFIG.conejos

const TABS = [
  { id: 'colonia',       label: 'Colonia',       sub: 'Fichas individuales' },
  { id: 'cuarentena',    label: 'Cuarentena',    sub: 'Control sanitario'   },
  { id: 'reproduccion',  label: 'Reproducción',  sub: 'Servicios y partos'  },
  { id: 'indicadores',   label: 'Indicadores',   sub: 'Métricas'            },
  { id: 'actividades',   label: 'Actividades',   sub: 'Registro de colonia' },
]

// ── Actividades del bioterio de conejos ──────────────────────────────────────
function ActividadesConejoTab() {
  const { datos, registrarActividadGeneral } = useConejo()

  const actividadesAuto = useMemo(() => {
    const evs = []
    // Ingresos de lotes
    datos.ingresos?.forEach(ing => {
      evs.push({
        id: `auto-cone-ing-${ing.id}`,
        fecha: ing.fechaIngreso, hora: '--', usuario: ing.responsableRecepcion,
        descripcion: `Ingreso de lote ${ing.loteCompra} — ${ing.animalesIds.length} animales desde ${ing.procedencia}.${ing.observaciones ? ' ' + ing.observaciones : ''}`,
        tipo: 'automatico', tag: 'ingreso',
      })
    })
    // Partos y destetes
    datos.servicios?.forEach(s => {
      if (s.fechaPartoReal) evs.push({
        id: `auto-cone-parto-${s.id}`,
        fecha: s.fechaPartoReal, hora: '--', usuario: 'Sistema',
        descripcion: `Parto registrado (servicio ${s.id}) — ${s.nacidos?.vivos ?? '?'} gazapos vivos. ♂ ${s.machoId} × ♀ ${s.hembraId}.`,
        tipo: 'automatico', tag: 'nacimiento',
      })
      if (s.destete) evs.push({
        id: `auto-cone-dest-${s.id}`,
        fecha: s.destete.fecha, hora: '--', usuario: 'Sistema',
        descripcion: `Destete (servicio ${s.id}) — ${s.destete.destetados} gazapos (♂ ${s.destete.machos} · ♀ ${s.destete.hembras}).`,
        tipo: 'automatico', tag: 'destete',
      })
    })
    // Cambios de estado (auditoría de animales)
    datos.auditoria?.filter(a => a.accion === 'cambio_estado').forEach(a => {
      evs.push({
        id: `auto-cone-aud-${a.id}`,
        fecha: a.fecha.split('T')[0], hora: a.fecha.split('T')[1]?.slice(0,5) ?? '--',
        usuario: a.usuario,
        descripcion: `Cambio de estado de ${a.entidadId}: ${a.valorAnterior ?? '—'} → ${a.valorNuevo}.`,
        tipo: 'automatico', tag: 'transferencia',
      })
    })
    return evs
  }, [datos.ingresos, datos.servicios, datos.auditoria])

  return (
    <RegistroActividades
      actividadesManuales={datos.actividadesGenerales ?? []}
      actividadesAuto={actividadesAuto}
      accentColor="#ffb300"
      coloniaLabel="Bioterio de Conejos"
      onRegistrar={registrarActividadGeneral}
    />
  )
}

function ConejoPageInner() {
  const navigate = useNavigate()
  const { tema, modoBrillo } = useTheme()
  const [tabActivo, setTabActivo] = useState('colonia')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: tema.bgMain }}>
      {/* Topbar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: tema.bgTopbar, borderBottom: `1px solid ${ACCENT}20` }}>
        <button onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600,
            background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`,
            color: ACCENT,
          }}>
          ← Inicio
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: cfg.colorDim, border: `1px solid ${cfg.colorBorde}` }}>
          <span>{cfg.icono}</span>
          <span className="font-bold text-sm" style={{ color: cfg.color }}>{cfg.nombre}</span>
          <span className="text-xs font-mono hidden sm:inline" style={{ color: tema.textMuted }}>
            {cfg.nombreCientifico}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 ml-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676' }}>
            Módulo Completo
          </span>
        </div>
        <div className="ml-auto hidden md:block" style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <img src={modoBrillo ? logoNavLight : logoNavDark} alt="ITeRatE"
            style={{ height: '36px', width: 'auto', mixBlendMode: modoBrillo ? 'multiply' : 'screen' }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-4 pt-4 pb-0 shrink-0"
        style={{ borderBottom: `1px solid ${tema.bgCardBorde}`, background: tema.bgMain }}>
        {TABS.map(tab => {
          const activo = tabActivo === tab.id
          return (
            <button key={tab.id} onClick={() => setTabActivo(tab.id)}
              className="px-5 py-2.5 text-sm font-semibold relative"
              style={{
                background: 'transparent', border: 'none',
                borderBottom: activo ? `2px solid ${ACCENT}` : '2px solid transparent',
                color: activo ? ACCENT : tema.textMuted,
                cursor: 'pointer', marginBottom: '-1px', transition: 'color 0.15s',
              }}>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto">
        {tabActivo === 'colonia'      && <ColoniaTab />}
        {tabActivo === 'cuarentena'   && <CuarentenaTab />}
        {tabActivo === 'reproduccion' && <ReproduccionTab />}
        {tabActivo === 'indicadores'  && <IndicadoresTab />}
        {tabActivo === 'actividades'  && <ActividadesConejoTab />}
      </div>
    </div>
  )
}

export default function ConejoPage() {
  return (
    <ConejoProvider>
      <ConejoPageInner />
    </ConejoProvider>
  )
}
