import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ICIVETProvider } from './context/ICIVETContext'
import SelectorEspecie from './pages/SelectorEspecie'
import EspecieLayout from './pages/EspecieLayout'

const CSS_MODO_CLARO = `
  html.modo-claro body { background: #F4F4EF !important; color: #0d1e30 !important; }
  html.modo-claro #root { background: #F4F4EF !important; }
`

function BotonBrillo() {
  const { modoBrillo, toggleBrillo } = useTheme()
  return (
    <button
      onClick={toggleBrillo}
      title={modoBrillo ? 'Cambiar a modo oscuro' : 'Cambiar a modo luminoso'}
      style={{
        position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '8px 13px', borderRadius: '20px',
        border: modoBrillo ? '1.5px solid rgba(30,100,200,0.45)' : '1.5px solid rgba(0,230,118,0.3)',
        background: modoBrillo ? 'rgba(230,240,255,0.97)' : 'rgba(8,13,26,0.97)',
        backdropFilter: 'blur(12px)', cursor: 'pointer',
        fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
        color: modoBrillo ? '#1a3a6a' : '#00e676',
        boxShadow: modoBrillo ? '0 2px 16px rgba(30,100,200,0.2)' : '0 0 16px rgba(0,230,118,0.12)',
        transition: 'all 0.25s ease',
      }}
    >
      <span style={{ fontSize: '15px', lineHeight: 1 }}>{modoBrillo ? '🌙' : '☀️'}</span>
      <span>{modoBrillo ? 'Oscuro' : 'Claro'}</span>
    </button>
  )
}

function BannerMaqueta() {
  return (
    <div style={{
      background: '#7c3aed', color: '#f3e8ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', padding: '5px 16px', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.06em', flexShrink: 0,
    }}>
      <span>⚗️</span>
      <span>MAQUETA ICIVET — Datos de demostración. Sistema en validación.</span>
    </div>
  )
}

function AppRoot() {
  const { modoBrillo } = useTheme()

  return (
    <>
      {modoBrillo && <style dangerouslySetInnerHTML={{ __html: CSS_MODO_CLARO }} />}
      <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
        <BannerMaqueta />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<SelectorEspecie />} />
            <Route path="/especie/:especieId/*" element={<EspecieLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <BotonBrillo />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ICIVETProvider>
        <BrowserRouter>
          <AppRoot />
        </BrowserRouter>
      </ICIVETProvider>
    </ThemeProvider>
  )
}
