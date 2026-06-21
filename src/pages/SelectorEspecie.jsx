import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { ESPECIES_CONFIG } from '../context/ICIVETContext'
import logoSloganDark  from '../assets/iterate+logo+slogan.png'
import logoSloganLight from '../assets/iterate+logo+sloganfondoclaro.png'

const ESPECIES_ORDEN = ['wistar', 'balbc', 'c57', 'conejos']

export default function SelectorEspecie() {
  const navigate = useNavigate()
  const { tema, modoBrillo } = useTheme()
  const [logoW, setLogoW] = useState(300)
  const [abierto, setAbierto] = useState(null)

  useEffect(() => {
    const update = () => setLogoW(window.innerWidth < 480 ? 180 : window.innerWidth < 768 ? 240 : 300)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function toggle(id) { setAbierto(abierto === id ? null : id) }

  function ingresar(id) {
    if (id === 'conejos') {
      navigate('/especie/conejos')
    } else {
      navigate(`/especie/${id}/fundacion`)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 gap-6"
      style={{ background: tema.bgMain, backgroundImage: tema.bgMainGrad, backgroundSize: '40px 40px' }}
    >
      {/* Logo + título */}
      <div className="flex flex-col items-center gap-4">
        <div style={{
          mixBlendMode: modoBrillo ? 'multiply' : 'screen',
          filter: modoBrillo ? 'none' : 'brightness(1.1) saturate(1.1)',
        }}>
          <img
            src={modoBrillo ? logoSloganLight : logoSloganDark}
            alt="ITeRatE"
            style={{ width: `${logoW}px`, height: 'auto', display: 'block' }}
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold mb-1" style={{ color: tema.textPrimary }}>Sistema ICIVET</h1>
          <p className="text-sm" style={{ color: tema.textMuted }}>Seleccioná la especie para comenzar</p>
        </div>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-2.5">
        {ESPECIES_ORDEN.map((id) => {
          const cfg = ESPECIES_CONFIG[id]
          const esConejos = id === 'conejos'
          const expandido = abierto === id

          return (
            <div
              key={id}
              className="w-full rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: expandido
                  ? `${cfg.colorDim}`
                  : tema.bgCard,
                border: `1.5px solid ${expandido ? cfg.color + '60' : cfg.colorBorde}`,
              }}
            >
              <button
                className="w-full text-left px-5 py-4 flex items-center gap-4"
                onClick={() => toggle(id)}
              >
                <span className="text-3xl">{cfg.icono}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: tema.textPrimary }}>{cfg.nombre}</div>
                  <div className="text-xs font-mono italic" style={{ color: tema.textMuted }}>{cfg.nombreCientifico}</div>
                </div>
                {esConejos && (
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,179,0,0.12)', border: '1px solid rgba(255,179,0,0.3)', color: '#ffb300' }}
                  >
                    pendiente
                  </span>
                )}
                <span style={{
                  fontSize: '18px',
                  transition: 'transform 0.2s',
                  transform: expandido ? 'rotate(90deg)' : 'rotate(0deg)',
                  color: tema.textMuted,
                }}>›</span>
              </button>

              <div style={{
                maxHeight: expandido ? '400px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.25s ease',
              }}>
                <div
                  className="px-5 pb-5 pt-3"
                  style={{ borderTop: `1px solid ${cfg.colorBorde}` }}
                >
                  {esConejos ? (
                    <div
                      className="rounded-xl px-4 py-4 text-sm leading-relaxed"
                      style={{ background: 'rgba(255,179,0,0.06)', border: '1px solid rgba(255,179,0,0.2)', color: '#ffb300' }}
                    >
                      <div className="font-semibold mb-1">🔬 Pendiente de modelado</div>
                      <div style={{ color: tema.textMuted, fontSize: '12px' }}>
                        Se implementará una vez relevado el procedimiento específico para conejos.
                      </div>
                      <button
                        onClick={() => ingresar('conejos')}
                        className="mt-3 w-full py-2 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.3)', color: '#ffb300', cursor: 'pointer' }}
                      >
                        Ver sección →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {['Fundación', 'Producción', 'Stock'].map((s, i) => (
                          <span
                            key={s}
                            className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{
                              background: i === 0 ? `${cfg.colorDim}` : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${i === 0 ? cfg.color + '50' : 'rgba(255,255,255,0.08)'}`,
                              color: i === 0 ? cfg.color : tema.textMuted,
                            }}
                          >
                            {i === 0 ? '✓ ' : ''}{s}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => ingresar(id)}
                        className="w-full py-2.5 rounded-xl text-sm font-bold"
                        style={{
                          background: cfg.colorDim,
                          border: `1.5px solid ${cfg.color + '60'}`,
                          color: cfg.color,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = cfg.color + '20'}
                        onMouseLeave={e => e.currentTarget.style.background = cfg.colorDim}
                      >
                        Ingresar a {cfg.nombre} →
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <p className="text-xs font-mono text-center mt-2" style={{ color: tema.textMuted }}>
        Maqueta ICIVET — Etapa 1: Validación de Fundación
      </p>
    </div>
  )
}
