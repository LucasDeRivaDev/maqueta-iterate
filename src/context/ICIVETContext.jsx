import { createContext, useContext, useReducer } from 'react'

// ── Configuración de especies ────────────────────────────────────────────────
export const ESPECIES_CONFIG = {
  wistar: {
    id: 'wistar',
    nombre: 'Ratas Wistar',
    nombreCientifico: 'Rattus norvegicus',
    icono: '🐀',
    color: '#00e676',
    colorDim: 'rgba(0,230,118,0.08)',
    colorBorde: 'rgba(0,230,118,0.25)',
  },
  balbc: {
    id: 'balbc',
    nombre: 'Ratones BALB/c',
    nombreCientifico: 'Mus musculus (BALB/c)',
    icono: '🐭',
    color: '#40c4ff',
    colorDim: 'rgba(64,196,255,0.08)',
    colorBorde: 'rgba(64,196,255,0.25)',
  },
  c57: {
    id: 'c57',
    nombre: 'Ratones C57BL/6',
    nombreCientifico: 'Mus musculus (C57BL/6)',
    icono: '🐭',
    color: '#ce93d8',
    colorDim: 'rgba(206,147,216,0.08)',
    colorBorde: 'rgba(206,147,216,0.25)',
  },
  conejos: {
    id: 'conejos',
    nombre: 'Conejos Nueva Zelanda',
    nombreCientifico: 'Oryctolagus cuniculus',
    icono: '🐇',
    color: '#ffb300',
    colorDim: 'rgba(255,179,0,0.08)',
    colorBorde: 'rgba(255,179,0,0.25)',
  },
}

export const GESTACION_DIAS = { wistar: 23, balbc: 21, c57: 20 }
export const DESTETE_DIAS   = 21

export const TIPOS_MOVIMIENTO = {
  ingreso_produccion: { label: 'Ingreso desde Producción', color: '#00e676', signo: '+' },
  ingreso_manual:     { label: 'Ingreso manual',           color: '#40c4ff', signo: '+' },
  entrega:            { label: 'Entrega',                  color: '#ffb300', signo: '-' },
  venta:              { label: 'Venta',                    color: '#ffb300', signo: '-' },
  donacion:           { label: 'Donación',                 color: '#ce93d8', signo: '-' },
  transferencia:      { label: 'Transferencia',            color: '#8a9bb0', signo: '↔' },
  baja_muerte:        { label: 'Muerte',                   color: '#ff3d57', signo: '-' },
  baja_sacrificio:    { label: 'Sacrificio',               color: '#ff3d57', signo: '-' },
  baja_sanitaria:     { label: 'Baja sanitaria',           color: '#ff3d57', signo: '-' },
  correccion:         { label: 'Corrección de inventario', color: '#8a9bb0', signo: '±' },
}

// ── Datos de demostración ────────────────────────────────────────────────────
const DATOS_INICIALES = {
  wistar: {
    parejas: [
      { id: 'P-W-001', machoId: 'M-W-001', hembraId: 'H-W-001', fechaApareamiento: '2026-01-05', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-002', machoId: 'M-W-002', hembraId: 'H-W-002', fechaApareamiento: '2026-01-08', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-003', machoId: 'M-W-003', hembraId: 'H-W-003', fechaApareamiento: '2026-01-12', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-004', machoId: 'M-W-004', hembraId: 'H-W-004', fechaApareamiento: '2026-01-15', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-005', machoId: 'M-W-005', hembraId: 'H-W-005', fechaApareamiento: '2026-02-01', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-006', machoId: 'M-W-006', hembraId: 'H-W-006', fechaApareamiento: '2026-02-10', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-007', machoId: 'M-W-007', hembraId: 'H-W-007', fechaApareamiento: '2026-02-15', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-008', machoId: 'M-W-008', hembraId: 'H-W-008', fechaApareamiento: '2026-06-01', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-009', machoId: 'M-W-009', hembraId: 'H-W-009', fechaApareamiento: '2026-06-08', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-010', machoId: 'M-W-010', hembraId: 'H-W-010', fechaApareamiento: '2026-06-15', estado: 'activo', cepa: 'Wistar' },
    ],
    // 10 machos + 10 hembras de Fundación (G3/G4)
    reproductores: [
      { id: 'M-W-001', sexo: 'macho',  nombre: 'Macho 1',   origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-002', sexo: 'macho',  nombre: 'Macho 2',   origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-003', sexo: 'macho',  nombre: 'Macho 3',   origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-004', sexo: 'macho',  nombre: 'Macho 4',   origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-005', sexo: 'macho',  nombre: 'Macho 5',   origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-006', sexo: 'macho',  nombre: 'Macho 6',   origen: 'Fundación', generacion: 'G4' },
      { id: 'M-W-007', sexo: 'macho',  nombre: 'Macho 7',   origen: 'Fundación', generacion: 'G4' },
      { id: 'M-W-008', sexo: 'macho',  nombre: 'Macho 8',   origen: 'Fundación', generacion: 'G4' },
      { id: 'M-W-009', sexo: 'macho',  nombre: 'Macho 9',   origen: 'Fundación', generacion: 'G4' },
      { id: 'M-W-010', sexo: 'macho',  nombre: 'Macho 10',  origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-001', sexo: 'hembra', nombre: 'Hembra 1',  origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-002', sexo: 'hembra', nombre: 'Hembra 2',  origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-003', sexo: 'hembra', nombre: 'Hembra 3',  origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-004', sexo: 'hembra', nombre: 'Hembra 4',  origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-005', sexo: 'hembra', nombre: 'Hembra 5',  origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-006', sexo: 'hembra', nombre: 'Hembra 6',  origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-007', sexo: 'hembra', nombre: 'Hembra 7',  origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-008', sexo: 'hembra', nombre: 'Hembra 8',  origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-009', sexo: 'hembra', nombre: 'Hembra 9',  origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-010', sexo: 'hembra', nombre: 'Hembra 10', origen: 'Fundación', generacion: 'G4' },
    ],
    camadas: [
      { id: 'CAM-W-001', codigo: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', pareja: 'P-W-001', fechaNacimiento: '2026-01-28', cantidadNacida: 10, destetada: true, fechaDestete: '2026-02-18', cantidadDestetada: 8, machos: 4, hembras: 4, observaciones: 'Camada sana, buen desarrollo.', cepa: 'Wistar' },
      { id: 'CAM-W-002', codigo: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', pareja: 'P-W-002', fechaNacimiento: '2026-01-31', cantidadNacida: 11, destetada: true, fechaDestete: '2026-02-21', cantidadDestetada: 9, machos: 4, hembras: 5, observaciones: 'Camada numerosa, todos con buen peso al destete.', cepa: 'Wistar' },
      { id: 'CAM-W-003', codigo: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', pareja: 'P-W-003', fechaNacimiento: '2026-02-04', cantidadNacida: 9,  destetada: true, fechaDestete: '2026-02-25', cantidadDestetada: 7, machos: 3, hembras: 4, observaciones: 'Dos crías con bajo peso separadas al destete.', cepa: 'Wistar' },
      { id: 'CAM-W-004', codigo: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', pareja: 'P-W-004', fechaNacimiento: '2026-02-07', cantidadNacida: 10, destetada: true, fechaDestete: '2026-02-28', cantidadDestetada: 8, machos: 4, hembras: 4, observaciones: 'Sin novedades.', cepa: 'Wistar' },
      { id: 'CAM-W-005', codigo: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', pareja: 'P-W-005', fechaNacimiento: '2026-02-24', cantidadNacida: 9,  destetada: true, fechaDestete: '2026-03-17', cantidadDestetada: 7, machos: 3, hembras: 4, observaciones: 'Destete sin complicaciones.', cepa: 'Wistar' },
    ],
    animales: [
      { id: 'A-W-001-01', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'produccion',      pesoDestete: 44 },
      { id: 'A-W-001-02', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'produccion',      pesoDestete: 46 },
      { id: 'A-W-001-03', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'no_seleccionado', pesoDestete: 38 },
      { id: 'A-W-001-04', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'fundacion',       pesoDestete: 42 },
      { id: 'A-W-001-05', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'produccion',      pesoDestete: 40 },
      { id: 'A-W-001-06', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'produccion',      pesoDestete: 38 },
      { id: 'A-W-001-07', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'fundacion',       pesoDestete: 41 },
      { id: 'A-W-001-08', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-001', fechaNacimiento: '2026-01-28', destino: 'no_seleccionado', pesoDestete: 35 },
      { id: 'A-W-002-01', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 45 },
      { id: 'A-W-002-02', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 47 },
      { id: 'A-W-002-03', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'no_seleccionado', pesoDestete: 39 },
      { id: 'A-W-002-04', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'fundacion',       pesoDestete: 43 },
      { id: 'A-W-002-05', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 41 },
      { id: 'A-W-002-06', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 39 },
      { id: 'A-W-002-07', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'fundacion',       pesoDestete: 42 },
      { id: 'A-W-002-08', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'no_seleccionado', pesoDestete: 36 },
      { id: 'A-W-002-09', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-01-31', destino: 'fundacion',       pesoDestete: 37 },
      { id: 'A-W-003-01', sexo: 'macho',  camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'produccion',      pesoDestete: 43 },
      { id: 'A-W-003-02', sexo: 'macho',  camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'produccion',      pesoDestete: 45 },
      { id: 'A-W-003-03', sexo: 'macho',  camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'no_seleccionado', pesoDestete: 37 },
      { id: 'A-W-003-04', sexo: 'hembra', camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'produccion',      pesoDestete: 39 },
      { id: 'A-W-003-05', sexo: 'hembra', camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'produccion',      pesoDestete: 37 },
      { id: 'A-W-003-06', sexo: 'hembra', camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'fundacion',       pesoDestete: 40 },
      { id: 'A-W-003-07', sexo: 'hembra', camadaId: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', fechaNacimiento: '2026-02-04', destino: 'no_seleccionado', pesoDestete: 34 },
      { id: 'A-W-004-01', sexo: 'macho',  camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'produccion',      pesoDestete: 44 },
      { id: 'A-W-004-02', sexo: 'macho',  camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'produccion',      pesoDestete: 46 },
      { id: 'A-W-004-03', sexo: 'macho',  camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'no_seleccionado', pesoDestete: 38 },
      { id: 'A-W-004-04', sexo: 'macho',  camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'fundacion',       pesoDestete: 42 },
      { id: 'A-W-004-05', sexo: 'hembra', camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'produccion',      pesoDestete: 40 },
      { id: 'A-W-004-06', sexo: 'hembra', camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'produccion',      pesoDestete: 38 },
      { id: 'A-W-004-07', sexo: 'hembra', camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'fundacion',       pesoDestete: 41 },
      { id: 'A-W-004-08', sexo: 'hembra', camadaId: 'CAM-W-004', padreId: 'M-W-004', madreId: 'H-W-004', fechaNacimiento: '2026-02-07', destino: 'no_seleccionado', pesoDestete: 35 },
      { id: 'A-W-005-01', sexo: 'macho',  camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'produccion',      pesoDestete: 43 },
      { id: 'A-W-005-02', sexo: 'macho',  camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'produccion',      pesoDestete: 45 },
      { id: 'A-W-005-03', sexo: 'macho',  camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'no_seleccionado', pesoDestete: 37 },
      { id: 'A-W-005-04', sexo: 'hembra', camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'produccion',      pesoDestete: 38 },
      { id: 'A-W-005-05', sexo: 'hembra', camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'produccion',      pesoDestete: 37 },
      { id: 'A-W-005-06', sexo: 'hembra', camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'fundacion',       pesoDestete: 40 },
      { id: 'A-W-005-07', sexo: 'hembra', camadaId: 'CAM-W-005', padreId: 'M-W-005', madreId: 'H-W-005', fechaNacimiento: '2026-02-24', destino: 'no_seleccionado', pesoDestete: 34 },
      { id: 'A-P-W-001',  sexo: 'macho',  camadaId: 'CAM-P-W-001', padreId: 'A-W-001-01', madreId: 'A-W-001-05', fechaNacimiento: '2026-03-24', destino: 'no_seleccionado', pesoDestete: 48 },
      { id: 'A-P-W-002',  sexo: 'hembra', camadaId: 'CAM-P-W-001', padreId: 'A-W-001-01', madreId: 'A-W-001-05', fechaNacimiento: '2026-03-24', destino: 'no_seleccionado', pesoDestete: 42 },
    ],

    // ── Producción ─────────────────────────────────────────────────────────
    produccion: {
      jaulas: [
        {
          id: 'JAU-P-W-001', codigo: 'JAU-P-W-001', cepa: 'Wistar',
          machoId: 'A-W-001-01', hembraIds: ['A-W-001-05', 'A-W-001-06'],
          fechaFormacion: '2026-03-01', estado: 'activo', observaciones: '',
        },
        {
          id: 'JAU-P-W-002', codigo: 'JAU-P-W-002', cepa: 'Wistar',
          machoId: 'A-W-002-01', hembraIds: ['A-W-002-05', 'A-W-002-06'],
          fechaFormacion: '2026-03-05', estado: 'activo', observaciones: '',
        },
        {
          id: 'JAU-P-W-003', codigo: 'JAU-P-W-003', cepa: 'Wistar',
          machoId: 'A-W-003-01', hembraIds: ['A-W-003-04', 'A-W-003-05'],
          fechaFormacion: '2026-03-20', estado: 'activo', observaciones: '',
        },
        {
          id: 'JAU-P-W-004', codigo: 'JAU-P-W-004', cepa: 'Wistar',
          machoId: 'A-W-004-01', hembraIds: ['A-W-004-05', 'A-W-004-06'],
          fechaFormacion: '2026-04-01', estado: 'activo', observaciones: '',
        },
        {
          id: 'JAU-P-W-005', codigo: 'JAU-P-W-005', cepa: 'Wistar',
          machoId: 'A-W-005-01', hembraIds: ['A-W-005-04', 'A-W-005-05'],
          fechaFormacion: '2026-04-10', estado: 'activo', observaciones: '',
        },
      ],
      camadas: [
        {
          id: 'CAM-P-W-001', codigo: 'CAM-P-W-001',
          jaulaId: 'JAU-P-W-001', machoId: 'A-W-001-01', hembraIds: ['A-W-001-05', 'A-W-001-06'],
          fechaNacimiento: '2026-03-24', cantidadNacida: 10,
          observaciones: 'Camada sana, desarrollo normal.',
          destete: { fecha: '2026-04-14', machos: 5, hembras: 5, observaciones: 'Sin novedades.' },
          seleccion: { machosSeleccionados: 2, hembrasSeleccionadas: 1, motivo: 'Buen desarrollo corporal y uniformidad de tamaño.', fecha: '2026-04-14' },
          stock: { machos: 3, hembras: 2, fechaIngreso: '2026-04-14' },
        },
        {
          id: 'CAM-P-W-002', codigo: 'CAM-P-W-002',
          jaulaId: 'JAU-P-W-001', machoId: 'A-W-001-01', hembraIds: ['A-W-001-05', 'A-W-001-06'],
          fechaNacimiento: '2026-05-20', cantidadNacida: 9,
          observaciones: '',
          destete: null, seleccion: null, stock: null,
        },
        {
          id: 'CAM-P-W-003', codigo: 'CAM-P-W-003',
          jaulaId: 'JAU-P-W-002', machoId: 'A-W-002-01', hembraIds: ['A-W-002-05', 'A-W-002-06'],
          fechaNacimiento: '2026-03-28', cantidadNacida: 11,
          observaciones: 'Camada numerosa.',
          destete: { fecha: '2026-04-18', machos: 6, hembras: 5, observaciones: 'Todos con buen peso.' },
          seleccion: { machosSeleccionados: 2, hembrasSeleccionadas: 2, motivo: 'Peso y uniformidad adecuados.', fecha: '2026-04-18' },
          stock: { machos: 4, hembras: 3, fechaIngreso: '2026-04-18' },
        },
        {
          id: 'CAM-P-W-004', codigo: 'CAM-P-W-004',
          jaulaId: 'JAU-P-W-003', machoId: 'A-W-003-01', hembraIds: ['A-W-003-04', 'A-W-003-05'],
          fechaNacimiento: '2026-04-12', cantidadNacida: 9,
          observaciones: '',
          destete: { fecha: '2026-05-03', machos: 4, hembras: 5, observaciones: 'Sin novedades.' },
          seleccion: { machosSeleccionados: 2, hembrasSeleccionadas: 2, motivo: 'Criterio estándar de selección.', fecha: '2026-05-03' },
          stock: { machos: 2, hembras: 3, fechaIngreso: '2026-05-03' },
        },
        {
          id: 'CAM-P-W-005', codigo: 'CAM-P-W-005',
          jaulaId: 'JAU-P-W-004', machoId: 'A-W-004-01', hembraIds: ['A-W-004-05', 'A-W-004-06'],
          fechaNacimiento: '2026-06-01', cantidadNacida: 10,
          observaciones: '',
          destete: null, seleccion: null, stock: null,
        },
        {
          id: 'CAM-P-W-006', codigo: 'CAM-P-W-006',
          jaulaId: 'JAU-P-W-005', machoId: 'A-W-005-01', hembraIds: ['A-W-005-04', 'A-W-005-05'],
          fechaNacimiento: '2026-05-03', cantidadNacida: 9,
          observaciones: '',
          destete: { fecha: '2026-05-24', machos: 4, hembras: 5, observaciones: 'Desarrollo normal.' },
          seleccion: { machosSeleccionados: 1, hembrasSeleccionadas: 2, motivo: 'Criterio estándar de selección.', fecha: '2026-05-24' },
          stock: { machos: 3, hembras: 3, fechaIngreso: '2026-05-24' },
        },
      ],
    },

    // ── Stock ──────────────────────────────────────────────────────────────
    stock: {
      jaulas: [
        { id: 'JAU-S-W-001', codigo: 'JAU-S-W-001', cepa: 'Wistar', sexo: 'macho',  cantidadActual: 1, fechaIngreso: '2026-04-14', fechaNacimiento: '2026-03-24', origenId: 'CAM-P-W-001', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-002', codigo: 'JAU-S-W-002', cepa: 'Wistar', sexo: 'hembra', cantidadActual: 1, fechaIngreso: '2026-04-14', fechaNacimiento: '2026-03-24', origenId: 'CAM-P-W-001', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-003', codigo: 'JAU-S-W-003', cepa: 'Wistar', sexo: 'macho',  cantidadActual: 1, fechaIngreso: '2026-04-18', fechaNacimiento: '2026-03-28', origenId: 'CAM-P-W-003', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-004', codigo: 'JAU-S-W-004', cepa: 'Wistar', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-04-18', fechaNacimiento: '2026-03-28', origenId: 'CAM-P-W-003', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-005', codigo: 'JAU-S-W-005', cepa: 'Wistar', sexo: 'macho',  cantidadActual: 1, fechaIngreso: '2026-05-03', fechaNacimiento: '2026-04-12', origenId: 'CAM-P-W-004', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-006', codigo: 'JAU-S-W-006', cepa: 'Wistar', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-05-03', fechaNacimiento: '2026-04-12', origenId: 'CAM-P-W-004', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-007', codigo: 'JAU-S-W-007', cepa: 'Wistar', sexo: 'macho',  cantidadActual: 2, fechaIngreso: '2026-05-24', fechaNacimiento: '2026-05-03', origenId: 'CAM-P-W-006', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-008', codigo: 'JAU-S-W-008', cepa: 'Wistar', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-05-24', fechaNacimiento: '2026-05-03', origenId: 'CAM-P-W-006', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
      ],
      movimientos: [
        { id: 'MOV-W-001', tipo: 'ingreso_produccion', fecha: '2026-04-14', cantidad: 3, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-001', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-001', observaciones: '' },
        { id: 'MOV-W-002', tipo: 'ingreso_produccion', fecha: '2026-04-14', cantidad: 2, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-002', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-001', observaciones: '' },
        { id: 'MOV-W-003', tipo: 'entrega',            fecha: '2026-04-25', cantidad: 2, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-001', investigador: 'Dra. García',    proyecto: 'Protocolo EXP-2026-01 — Metabolismo lipídico', motivo: '', observaciones: '' },
        { id: 'MOV-W-004', tipo: 'ingreso_produccion', fecha: '2026-04-18', cantidad: 4, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-003', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-003', observaciones: '' },
        { id: 'MOV-W-005', tipo: 'ingreso_produccion', fecha: '2026-04-18', cantidad: 3, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-004', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-003', observaciones: '' },
        { id: 'MOV-W-006', tipo: 'entrega',            fecha: '2026-05-02', cantidad: 1, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-002', investigador: 'Dr. López',      proyecto: 'Protocolo EXP-2026-02 — Respuesta inmune', motivo: '', observaciones: '' },
        { id: 'MOV-W-007', tipo: 'entrega',            fecha: '2026-05-05', cantidad: 2, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-003', investigador: 'Investigador A', proyecto: 'Protocolo EXP-2026-03 — Evaluación neurológica', motivo: '', observaciones: '' },
        { id: 'MOV-W-008', tipo: 'baja_muerte',        fecha: '2026-05-10', cantidad: 1, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-003', investigador: '', proyecto: '', motivo: 'Baja por edad avanzada', observaciones: '' },
        { id: 'MOV-W-009', tipo: 'ingreso_produccion', fecha: '2026-05-03', cantidad: 2, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-005', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-004', observaciones: '' },
        { id: 'MOV-W-010', tipo: 'ingreso_produccion', fecha: '2026-05-03', cantidad: 3, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-006', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-004', observaciones: '' },
        { id: 'MOV-W-011', tipo: 'baja_sacrificio',    fecha: '2026-05-20', cantidad: 1, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-004', investigador: '', proyecto: '', motivo: 'Baja por sobrepoblación', observaciones: '' },
        { id: 'MOV-W-012', tipo: 'ingreso_produccion', fecha: '2026-05-24', cantidad: 3, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-007', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-006', observaciones: '' },
        { id: 'MOV-W-013', tipo: 'ingreso_produccion', fecha: '2026-05-24', cantidad: 3, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-008', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-006', observaciones: '' },
        { id: 'MOV-W-014', tipo: 'entrega',            fecha: '2026-06-05', cantidad: 1, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-007', investigador: 'Dra. García',    proyecto: 'Protocolo EXP-2026-04 — Oncología experimental', motivo: '', observaciones: '' },
        { id: 'MOV-W-015', tipo: 'entrega',            fecha: '2026-06-10', cantidad: 1, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-008', investigador: 'Investigador B', proyecto: 'Protocolo EXP-2026-05 — Toxicología', motivo: '', observaciones: '' },
        { id: 'MOV-W-016', tipo: 'entrega',            fecha: '2026-06-15', cantidad: 1, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-005', investigador: 'Dr. López',      proyecto: 'Protocolo EXP-2026-06 — Farmacología', motivo: '', observaciones: '' },
        { id: 'MOV-W-017', tipo: 'baja_sanitaria',     fecha: '2026-06-18', cantidad: 1, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-006', investigador: '', proyecto: '', motivo: 'Baja sanitaria — signos clínicos', observaciones: '' },
      ],
    },
    historialEventos: [
      { id: 'EVT-W-001', animalId: 'A-W-001-01', fecha: '2026-02-18', tipo: 'nacimiento',           descripcion: 'Nacimiento registrado — Camada CAM-W-001. Padre: M-W-001, Madre: H-W-001.', usuario: 'Sistema' },
      { id: 'EVT-W-002', animalId: 'A-W-001-01', fecha: '2026-04-14', tipo: 'transferencia_colonia', descripcion: 'Transferido de Fundación a Producción. Seleccionado como reproductor por buen desarrollo corporal.', usuario: 'Bioterista' },
      { id: 'EVT-W-003', animalId: 'A-P-W-001',  fecha: '2026-03-24', tipo: 'nacimiento',           descripcion: 'Nacimiento registrado — Camada CAM-P-W-001. Padre: A-W-001-01 (Producción), Madre: A-W-001-05 (Producción).', usuario: 'Sistema' },
      { id: 'EVT-W-004', animalId: 'A-P-W-001',  fecha: '2026-04-14', tipo: 'transferencia_colonia', descripcion: 'Transferido de Producción a Stock. Ingresado en jaula JAU-S-W-001.', usuario: 'Bioterista' },
      { id: 'EVT-W-005', animalId: 'A-P-W-002',  fecha: '2026-03-24', tipo: 'nacimiento',           descripcion: 'Nacimiento registrado — Camada CAM-P-W-001. Padre: A-W-001-01 (Producción), Madre: A-W-001-05 (Producción).', usuario: 'Sistema' },
      { id: 'EVT-W-006', animalId: 'A-P-W-002',  fecha: '2026-05-02', tipo: 'traslado',             descripcion: 'Cambio de jaula: movida de JAU-S-W-002 a JAU-S-W-004 por reorganización del stock.', usuario: 'Bioterista' },
      { id: 'EVT-W-007', animalId: 'A-W-002-01', fecha: '2026-03-10', tipo: 'observacion',          descripcion: 'Animal con excelente desarrollo muscular. Peso destacado para la edad. Candidato a reproductor.', usuario: 'Bioterista' },
      { id: 'EVT-W-008', animalId: 'A-W-001-05', fecha: '2026-04-14', tipo: 'transferencia_colonia', descripcion: 'Transferida de Fundación a Producción. Seleccionada como reproductora.', usuario: 'Bioterista' },
    ],
    actividadesColonia: {
      fundacion: [
        { id: 'ACT-WF-001', fecha: '2026-02-20', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama de jaulas de reproducción. Todas las jaulas revisadas y material de nido sustituido.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WF-002', fecha: '2026-03-05', hora: '10:30', usuario: 'Bioterista', descripcion: 'Revisión de M-W-003. Estado general óptimo, peso acorde a la edad. Sin signos clínicos.', tipo: 'manual', tag: 'manual', animalId: 'M-W-003' },
        { id: 'ACT-WF-003', fecha: '2026-03-18', hora: '14:00', usuario: 'Bioterista', descripcion: 'Reparación de puerta de jaula P-W-002. Bisagra deteriorada reemplazada sin incidentes.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WF-004', fecha: '2026-04-02', hora: '08:30', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de fundación. Tubo fluorescente reemplazado por LED de bajo consumo.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WF-005', fecha: '2026-04-14', hora: '11:00', usuario: 'Bioterista', descripcion: 'Transferencia de A-W-001-01 y A-W-001-05 hacia Colonia de Producción tras selección por destete.', tipo: 'manual', tag: 'manual' },
      ],
      produccion: [
        { id: 'ACT-WP-001', fecha: '2026-04-20', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en todas las jaulas de producción. Material sustituido y recintos desinfectados.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WP-002', fecha: '2026-05-02', hora: '11:00', usuario: 'Bioterista', descripcion: 'Revisión de A-W-001-01. Animal activo, en buen estado reproductivo. Sin signos de fatiga.', tipo: 'manual', tag: 'manual', animalId: 'A-W-001-01' },
        { id: 'ACT-WP-003', fecha: '2026-05-15', hora: '14:30', usuario: 'Bioterista', descripcion: 'Reparación de bebedero de JAU-P-W-003. Goteo continuo corregido. Válvula reemplazada.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WP-004', fecha: '2026-06-01', hora: '08:00', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de producción. Instalación de foco LED de 12 W.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WP-005', fecha: '2026-06-12', hora: '10:00', usuario: 'Bioterista', descripcion: 'Transferencia de crías seleccionadas de CAM-P-W-006 hacia Stock. 3 machos y 3 hembras ingresados.', tipo: 'manual', tag: 'manual' },
      ],
      stock: [
        { id: 'ACT-WS-001', fecha: '2026-05-05', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en jaulas de stock. Todos los recintos renovados. Sin novedades sanitarias.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WS-002', fecha: '2026-05-18', hora: '10:00', usuario: 'Bioterista', descripcion: 'Revisión de A-P-W-001. Estado general óptimo, sin signos de enfermedad. Peso dentro del rango.', tipo: 'manual', tag: 'manual', animalId: 'A-P-W-001' },
        { id: 'ACT-WS-003', fecha: '2026-06-02', hora: '14:00', usuario: 'Bioterista', descripcion: 'Reparación de tapa de JAU-S-W-004. Mecanismo de cierre ajustado. Pasador roto reemplazado.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WS-004', fecha: '2026-06-12', hora: '08:30', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de stock. Instalación completada sin inconvenientes.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-WS-005', fecha: '2026-06-18', hora: '11:00', usuario: 'Bioterista', descripcion: 'Transferencia de A-P-W-002 desde Stock hacia área de observación por seguimiento clínico.', tipo: 'manual', tag: 'manual', animalId: 'A-P-W-002' },
      ],
    },
  },

  balbc: {
    parejas: [
      { id: 'P-B-001', machoId: 'M-B-001', hembraId: 'H-B-001', fechaApareamiento: '2026-01-10', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-002', machoId: 'M-B-002', hembraId: 'H-B-002', fechaApareamiento: '2026-01-12', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-003', machoId: 'M-B-003', hembraId: 'H-B-003', fechaApareamiento: '2026-01-15', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-004', machoId: 'M-B-004', hembraId: 'H-B-004', fechaApareamiento: '2026-01-20', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-005', machoId: 'M-B-005', hembraId: 'H-B-005', fechaApareamiento: '2026-02-05', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-006', machoId: 'M-B-006', hembraId: 'H-B-006', fechaApareamiento: '2026-02-12', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-007', machoId: 'M-B-007', hembraId: 'H-B-007', fechaApareamiento: '2026-02-20', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-008', machoId: 'M-B-008', hembraId: 'H-B-008', fechaApareamiento: '2026-06-01', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-009', machoId: 'M-B-009', hembraId: 'H-B-009', fechaApareamiento: '2026-06-08', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-010', machoId: 'M-B-010', hembraId: 'H-B-010', fechaApareamiento: '2026-06-15', estado: 'activo', cepa: 'BALB/c' },
    ],
    reproductores: [
      { id: 'M-B-001', sexo: 'macho',  nombre: 'Macho 1',   origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-002', sexo: 'macho',  nombre: 'Macho 2',   origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-003', sexo: 'macho',  nombre: 'Macho 3',   origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-004', sexo: 'macho',  nombre: 'Macho 4',   origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-005', sexo: 'macho',  nombre: 'Macho 5',   origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-006', sexo: 'macho',  nombre: 'Macho 6',   origen: 'Fundación', generacion: 'G6' },
      { id: 'M-B-007', sexo: 'macho',  nombre: 'Macho 7',   origen: 'Fundación', generacion: 'G6' },
      { id: 'M-B-008', sexo: 'macho',  nombre: 'Macho 8',   origen: 'Fundación', generacion: 'G6' },
      { id: 'M-B-009', sexo: 'macho',  nombre: 'Macho 9',   origen: 'Fundación', generacion: 'G6' },
      { id: 'M-B-010', sexo: 'macho',  nombre: 'Macho 10',  origen: 'Fundación', generacion: 'G6' },
      { id: 'H-B-001', sexo: 'hembra', nombre: 'Hembra 1',  origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-002', sexo: 'hembra', nombre: 'Hembra 2',  origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-003', sexo: 'hembra', nombre: 'Hembra 3',  origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-004', sexo: 'hembra', nombre: 'Hembra 4',  origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-005', sexo: 'hembra', nombre: 'Hembra 5',  origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-006', sexo: 'hembra', nombre: 'Hembra 6',  origen: 'Fundación', generacion: 'G6' },
      { id: 'H-B-007', sexo: 'hembra', nombre: 'Hembra 7',  origen: 'Fundación', generacion: 'G6' },
      { id: 'H-B-008', sexo: 'hembra', nombre: 'Hembra 8',  origen: 'Fundación', generacion: 'G6' },
      { id: 'H-B-009', sexo: 'hembra', nombre: 'Hembra 9',  origen: 'Fundación', generacion: 'G6' },
      { id: 'H-B-010', sexo: 'hembra', nombre: 'Hembra 10', origen: 'Fundación', generacion: 'G6' },
    ],
    camadas: [
      { id: 'CAM-B-001', codigo: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', pareja: 'P-B-001', fechaNacimiento: '2026-01-31', cantidadNacida: 8, destetada: true, fechaDestete: '2026-02-21', cantidadDestetada: 7, machos: 4, hembras: 3, observaciones: 'Camada sana, buen desarrollo.', cepa: 'BALB/c' },
      { id: 'CAM-B-002', codigo: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', pareja: 'P-B-002', fechaNacimiento: '2026-02-03', cantidadNacida: 7, destetada: true, fechaDestete: '2026-02-24', cantidadDestetada: 6, machos: 3, hembras: 3, observaciones: 'Sin novedades.', cepa: 'BALB/c' },
      { id: 'CAM-B-003', codigo: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', pareja: 'P-B-003', fechaNacimiento: '2026-02-06', cantidadNacida: 8, destetada: true, fechaDestete: '2026-02-27', cantidadDestetada: 7, machos: 4, hembras: 3, observaciones: 'Todos con buen peso al destete.', cepa: 'BALB/c' },
      { id: 'CAM-B-004', codigo: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', pareja: 'P-B-004', fechaNacimiento: '2026-02-11', cantidadNacida: 7, destetada: true, fechaDestete: '2026-03-04', cantidadDestetada: 6, machos: 3, hembras: 3, observaciones: 'Sin novedades.', cepa: 'BALB/c' },
      { id: 'CAM-B-005', codigo: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', pareja: 'P-B-005', fechaNacimiento: '2026-02-26', cantidadNacida: 8, destetada: true, fechaDestete: '2026-03-19', cantidadDestetada: 7, machos: 4, hembras: 3, observaciones: 'Desarrollo normal.', cepa: 'BALB/c' },
    ],
    animales: [
      // CAM-B-001 (4m+3h): 2m→produccion, 1m→fundacion, 1m→no_seleccionado; 2h→produccion, 1h→fundacion
      { id: 'A-B-001-01', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 17 },
      { id: 'A-B-001-02', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 16 },
      { id: 'A-B-001-03', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'fundacion',       pesoDestete: 18 },
      { id: 'A-B-001-04', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'no_seleccionado', pesoDestete: 14 },
      { id: 'A-B-001-05', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 15 },
      { id: 'A-B-001-06', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'produccion',      pesoDestete: 14 },
      { id: 'A-B-001-07', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-01-31', destino: 'fundacion',       pesoDestete: 16 },
      // CAM-B-002 (3m+3h)
      { id: 'A-B-002-01', sexo: 'macho',  camadaId: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', fechaNacimiento: '2026-02-03', destino: 'produccion',      pesoDestete: 16 },
      { id: 'A-B-002-02', sexo: 'macho',  camadaId: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', fechaNacimiento: '2026-02-03', destino: 'produccion',      pesoDestete: 17 },
      { id: 'A-B-002-03', sexo: 'macho',  camadaId: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', fechaNacimiento: '2026-02-03', destino: 'no_seleccionado', pesoDestete: 13 },
      { id: 'A-B-002-04', sexo: 'hembra', camadaId: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', fechaNacimiento: '2026-02-03', destino: 'produccion',      pesoDestete: 14 },
      { id: 'A-B-002-05', sexo: 'hembra', camadaId: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', fechaNacimiento: '2026-02-03', destino: 'produccion',      pesoDestete: 15 },
      { id: 'A-B-002-06', sexo: 'hembra', camadaId: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', fechaNacimiento: '2026-02-03', destino: 'fundacion',       pesoDestete: 16 },
      // CAM-B-003 (4m+3h)
      { id: 'A-B-003-01', sexo: 'macho',  camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'produccion',      pesoDestete: 17 },
      { id: 'A-B-003-02', sexo: 'macho',  camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'produccion',      pesoDestete: 16 },
      { id: 'A-B-003-03', sexo: 'macho',  camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'fundacion',       pesoDestete: 18 },
      { id: 'A-B-003-04', sexo: 'macho',  camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'no_seleccionado', pesoDestete: 13 },
      { id: 'A-B-003-05', sexo: 'hembra', camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'produccion',      pesoDestete: 15 },
      { id: 'A-B-003-06', sexo: 'hembra', camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'produccion',      pesoDestete: 14 },
      { id: 'A-B-003-07', sexo: 'hembra', camadaId: 'CAM-B-003', padreId: 'M-B-003', madreId: 'H-B-003', fechaNacimiento: '2026-02-06', destino: 'fundacion',       pesoDestete: 16 },
      // CAM-B-004 (3m+3h)
      { id: 'A-B-004-01', sexo: 'macho',  camadaId: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', fechaNacimiento: '2026-02-11', destino: 'produccion',      pesoDestete: 16 },
      { id: 'A-B-004-02', sexo: 'macho',  camadaId: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', fechaNacimiento: '2026-02-11', destino: 'produccion',      pesoDestete: 17 },
      { id: 'A-B-004-03', sexo: 'macho',  camadaId: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', fechaNacimiento: '2026-02-11', destino: 'no_seleccionado', pesoDestete: 13 },
      { id: 'A-B-004-04', sexo: 'hembra', camadaId: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', fechaNacimiento: '2026-02-11', destino: 'produccion',      pesoDestete: 14 },
      { id: 'A-B-004-05', sexo: 'hembra', camadaId: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', fechaNacimiento: '2026-02-11', destino: 'produccion',      pesoDestete: 15 },
      { id: 'A-B-004-06', sexo: 'hembra', camadaId: 'CAM-B-004', padreId: 'M-B-004', madreId: 'H-B-004', fechaNacimiento: '2026-02-11', destino: 'fundacion',       pesoDestete: 15 },
      // CAM-B-005 (4m+3h)
      { id: 'A-B-005-01', sexo: 'macho',  camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'produccion',      pesoDestete: 17 },
      { id: 'A-B-005-02', sexo: 'macho',  camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'produccion',      pesoDestete: 16 },
      { id: 'A-B-005-03', sexo: 'macho',  camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'fundacion',       pesoDestete: 18 },
      { id: 'A-B-005-04', sexo: 'macho',  camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'no_seleccionado', pesoDestete: 13 },
      { id: 'A-B-005-05', sexo: 'hembra', camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'produccion',      pesoDestete: 15 },
      { id: 'A-B-005-06', sexo: 'hembra', camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'produccion',      pesoDestete: 14 },
      { id: 'A-B-005-07', sexo: 'hembra', camadaId: 'CAM-B-005', padreId: 'M-B-005', madreId: 'H-B-005', fechaNacimiento: '2026-02-26', destino: 'fundacion',       pesoDestete: 16 },
      // Animales individuales de Stock (hijos de Producción → abuelos en Fundación)
      { id: 'A-P-B-001', sexo: 'macho',  camadaId: 'CAM-P-B-001', padreId: 'A-B-001-01', madreId: 'A-B-001-05', fechaNacimiento: '2026-03-26', destino: 'no_seleccionado', pesoDestete: 18 },
      { id: 'A-P-B-002', sexo: 'hembra', camadaId: 'CAM-P-B-001', padreId: 'A-B-001-01', madreId: 'A-B-001-05', fechaNacimiento: '2026-03-26', destino: 'no_seleccionado', pesoDestete: 16 },
      { id: 'A-P-B-003', sexo: 'macho',  camadaId: 'CAM-P-B-003', padreId: 'A-B-001-02', madreId: 'A-B-002-04', fechaNacimiento: '2026-03-29', destino: 'no_seleccionado', pesoDestete: 17 },
      { id: 'A-P-B-004', sexo: 'hembra', camadaId: 'CAM-P-B-003', padreId: 'A-B-001-02', madreId: 'A-B-002-04', fechaNacimiento: '2026-03-29', destino: 'no_seleccionado', pesoDestete: 15 },
    ],
    produccion: {
      jaulas: [
        { id: 'JAU-P-B-001', codigo: 'JAU-P-B-001', cepa: 'BALB/c', machoId: 'A-B-001-01', hembraIds: ['A-B-001-05', 'A-B-001-06'], fechaFormacion: '2026-03-05', estado: 'activo', observaciones: '' },
        { id: 'JAU-P-B-002', codigo: 'JAU-P-B-002', cepa: 'BALB/c', machoId: 'A-B-001-02', hembraIds: ['A-B-002-04', 'A-B-002-05'], fechaFormacion: '2026-03-08', estado: 'activo', observaciones: '' },
        { id: 'JAU-P-B-003', codigo: 'JAU-P-B-003', cepa: 'BALB/c', machoId: 'A-B-002-01', hembraIds: ['A-B-003-05', 'A-B-003-06'], fechaFormacion: '2026-03-20', estado: 'activo', observaciones: '' },
        { id: 'JAU-P-B-004', codigo: 'JAU-P-B-004', cepa: 'BALB/c', machoId: 'A-B-002-02', hembraIds: ['A-B-004-04', 'A-B-004-05'], fechaFormacion: '2026-04-01', estado: 'activo', observaciones: '' },
        { id: 'JAU-P-B-005', codigo: 'JAU-P-B-005', cepa: 'BALB/c', machoId: 'A-B-003-01', hembraIds: ['A-B-005-05', 'A-B-005-06'], fechaFormacion: '2026-04-10', estado: 'activo', observaciones: '' },
      ],
      camadas: [
        {
          id: 'CAM-P-B-001', codigo: 'CAM-P-B-001',
          jaulaId: 'JAU-P-B-001', machoId: 'A-B-001-01', hembraIds: ['A-B-001-05', 'A-B-001-06'],
          fechaNacimiento: '2026-03-26', cantidadNacida: 8, observaciones: 'Camada sana.',
          destete: { fecha: '2026-04-16', machos: 4, hembras: 4, observaciones: 'Sin novedades.' },
          seleccion: { machosSeleccionados: 2, hembrasSeleccionadas: 2, motivo: 'Criterio de uniformidad corporal.', fecha: '2026-04-16' },
          stock: { machos: 4, hembras: 3, fechaIngreso: '2026-04-16' },
        },
        {
          id: 'CAM-P-B-002', codigo: 'CAM-P-B-002',
          jaulaId: 'JAU-P-B-001', machoId: 'A-B-001-01', hembraIds: ['A-B-001-05', 'A-B-001-06'],
          fechaNacimiento: '2026-05-17', cantidadNacida: 7, observaciones: '',
          destete: null, seleccion: null, stock: null,
        },
        {
          id: 'CAM-P-B-003', codigo: 'CAM-P-B-003',
          jaulaId: 'JAU-P-B-002', machoId: 'A-B-001-02', hembraIds: ['A-B-002-04', 'A-B-002-05'],
          fechaNacimiento: '2026-03-29', cantidadNacida: 8, observaciones: '',
          destete: { fecha: '2026-04-19', machos: 4, hembras: 4, observaciones: 'Todos con buen peso.' },
          seleccion: { machosSeleccionados: 2, hembrasSeleccionadas: 2, motivo: 'Criterio estándar.', fecha: '2026-04-19' },
          stock: { machos: 3, hembras: 3, fechaIngreso: '2026-04-19' },
        },
        {
          id: 'CAM-P-B-004', codigo: 'CAM-P-B-004',
          jaulaId: 'JAU-P-B-003', machoId: 'A-B-002-01', hembraIds: ['A-B-003-05', 'A-B-003-06'],
          fechaNacimiento: '2026-04-10', cantidadNacida: 7, observaciones: '',
          destete: { fecha: '2026-05-01', machos: 3, hembras: 4, observaciones: 'Sin novedades.' },
          seleccion: { machosSeleccionados: 1, hembrasSeleccionadas: 2, motivo: 'Criterio estándar.', fecha: '2026-05-01' },
          stock: { machos: 2, hembras: 3, fechaIngreso: '2026-05-01' },
        },
        {
          id: 'CAM-P-B-005', codigo: 'CAM-P-B-005',
          jaulaId: 'JAU-P-B-004', machoId: 'A-B-002-02', hembraIds: ['A-B-004-04', 'A-B-004-05'],
          fechaNacimiento: '2026-06-12', cantidadNacida: 8, observaciones: '',
          destete: null, seleccion: null, stock: null,
        },
        {
          id: 'CAM-P-B-006', codigo: 'CAM-P-B-006',
          jaulaId: 'JAU-P-B-005', machoId: 'A-B-003-01', hembraIds: ['A-B-005-05', 'A-B-005-06'],
          fechaNacimiento: '2026-05-01', cantidadNacida: 7, observaciones: '',
          destete: { fecha: '2026-05-22', machos: 3, hembras: 4, observaciones: 'Desarrollo normal.' },
          seleccion: { machosSeleccionados: 1, hembrasSeleccionadas: 2, motivo: 'Criterio estándar.', fecha: '2026-05-22' },
          stock: { machos: 3, hembras: 3, fechaIngreso: '2026-05-22' },
        },
      ],
    },
    stock: {
      jaulas: [
        { id: 'JAU-S-B-001', codigo: 'JAU-S-B-001', cepa: 'BALB/c', sexo: 'macho',  cantidadActual: 2, fechaIngreso: '2026-04-16', fechaNacimiento: '2026-03-26', origenId: 'CAM-P-B-001', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-002', codigo: 'JAU-S-B-002', cepa: 'BALB/c', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-04-16', fechaNacimiento: '2026-03-26', origenId: 'CAM-P-B-001', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-003', codigo: 'JAU-S-B-003', cepa: 'BALB/c', sexo: 'macho',  cantidadActual: 2, fechaIngreso: '2026-04-19', fechaNacimiento: '2026-03-29', origenId: 'CAM-P-B-003', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-004', codigo: 'JAU-S-B-004', cepa: 'BALB/c', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-04-19', fechaNacimiento: '2026-03-29', origenId: 'CAM-P-B-003', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-005', codigo: 'JAU-S-B-005', cepa: 'BALB/c', sexo: 'macho',  cantidadActual: 1, fechaIngreso: '2026-05-01', fechaNacimiento: '2026-04-10', origenId: 'CAM-P-B-004', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-006', codigo: 'JAU-S-B-006', cepa: 'BALB/c', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-05-01', fechaNacimiento: '2026-04-10', origenId: 'CAM-P-B-004', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-007', codigo: 'JAU-S-B-007', cepa: 'BALB/c', sexo: 'macho',  cantidadActual: 2, fechaIngreso: '2026-05-22', fechaNacimiento: '2026-05-01', origenId: 'CAM-P-B-006', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-B-008', codigo: 'JAU-S-B-008', cepa: 'BALB/c', sexo: 'hembra', cantidadActual: 2, fechaIngreso: '2026-05-22', fechaNacimiento: '2026-05-01', origenId: 'CAM-P-B-006', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
      ],
      movimientos: [
        { id: 'MOV-B-001', tipo: 'ingreso_produccion', fecha: '2026-04-16', cantidad: 4, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-001', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-001', observaciones: '' },
        { id: 'MOV-B-002', tipo: 'ingreso_produccion', fecha: '2026-04-16', cantidad: 3, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-002', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-001', observaciones: '' },
        { id: 'MOV-B-003', tipo: 'entrega',            fecha: '2026-04-28', cantidad: 2, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-001', investigador: 'Investigador C', proyecto: 'Protocolo EXP-2026-07 — Inflamación', motivo: '', observaciones: '' },
        { id: 'MOV-B-004', tipo: 'ingreso_produccion', fecha: '2026-04-19', cantidad: 3, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-003', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-003', observaciones: '' },
        { id: 'MOV-B-005', tipo: 'ingreso_produccion', fecha: '2026-04-19', cantidad: 3, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-004', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-003', observaciones: '' },
        { id: 'MOV-B-006', tipo: 'entrega',            fecha: '2026-05-03', cantidad: 1, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-002', investigador: 'Investigador D', proyecto: 'Protocolo EXP-2026-08 — Vacunas', motivo: '', observaciones: '' },
        { id: 'MOV-B-007', tipo: 'baja_muerte',        fecha: '2026-05-10', cantidad: 1, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-003', investigador: '', proyecto: '', motivo: 'Baja por edad avanzada', observaciones: '' },
        { id: 'MOV-B-008', tipo: 'ingreso_produccion', fecha: '2026-05-01', cantidad: 2, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-005', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-004', observaciones: '' },
        { id: 'MOV-B-009', tipo: 'ingreso_produccion', fecha: '2026-05-01', cantidad: 3, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-006', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-004', observaciones: '' },
        { id: 'MOV-B-010', tipo: 'entrega',            fecha: '2026-05-15', cantidad: 1, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-005', investigador: 'Investigador A', proyecto: 'Protocolo EXP-2026-09 — Inmunología', motivo: '', observaciones: '' },
        { id: 'MOV-B-011', tipo: 'baja_sacrificio',    fecha: '2026-05-20', cantidad: 1, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-004', investigador: '', proyecto: '', motivo: 'Baja por sobrepoblación', observaciones: '' },
        { id: 'MOV-B-012', tipo: 'ingreso_produccion', fecha: '2026-05-22', cantidad: 3, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-007', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-006', observaciones: '' },
        { id: 'MOV-B-013', tipo: 'ingreso_produccion', fecha: '2026-05-22', cantidad: 3, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-008', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-B-006', observaciones: '' },
        { id: 'MOV-B-014', tipo: 'entrega',            fecha: '2026-06-05', cantidad: 1, sexo: 'macho',  cepa: 'BALB/c', jaulaId: 'JAU-S-B-007', investigador: 'Dra. García',    proyecto: 'Protocolo EXP-2026-01 — Oncología', motivo: '', observaciones: '' },
        { id: 'MOV-B-015', tipo: 'entrega',            fecha: '2026-06-12', cantidad: 1, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-008', investigador: 'Dr. López',      proyecto: 'Protocolo EXP-2026-02 — Toxicología', motivo: '', observaciones: '' },
        { id: 'MOV-B-016', tipo: 'baja_sanitaria',     fecha: '2026-06-18', cantidad: 1, sexo: 'hembra', cepa: 'BALB/c', jaulaId: 'JAU-S-B-006', investigador: '', proyecto: '', motivo: 'Baja sanitaria — signos clínicos', observaciones: '' },
      ],
    },
    historialEventos: [
      { id: 'EVT-B-001', animalId: 'A-B-001-01', fecha: '2026-02-21', tipo: 'nacimiento',           descripcion: 'Nacimiento registrado — Camada CAM-B-001. Padre: M-B-001, Madre: H-B-001.', usuario: 'Sistema' },
      { id: 'EVT-B-002', animalId: 'A-B-001-01', fecha: '2026-03-05', tipo: 'transferencia_colonia', descripcion: 'Transferido de Fundación a Producción. Seleccionado como reproductor.', usuario: 'Bioterista' },
      { id: 'EVT-B-003', animalId: 'A-P-B-001',  fecha: '2026-03-26', tipo: 'nacimiento',           descripcion: 'Nacimiento registrado — Camada CAM-P-B-001. Padre: A-B-001-01 (Producción), Madre: A-B-001-05 (Producción).', usuario: 'Sistema' },
      { id: 'EVT-B-004', animalId: 'A-P-B-001',  fecha: '2026-04-16', tipo: 'transferencia_colonia', descripcion: 'Transferido de Producción a Stock. Ingresado en jaula JAU-S-B-001.', usuario: 'Bioterista' },
      { id: 'EVT-B-005', animalId: 'A-B-002-01', fecha: '2026-03-15', tipo: 'observacion',          descripcion: 'Animal con buen desarrollo. Candidato a reproductor de producción.', usuario: 'Bioterista' },
      { id: 'EVT-B-006', animalId: 'A-P-B-002',  fecha: '2026-05-10', tipo: 'traslado',             descripcion: 'Cambio de jaula: movida de JAU-S-B-002 a JAU-S-B-004 por reorganización del stock.', usuario: 'Bioterista' },
    ],
    actividadesColonia: {
      fundacion: [
        { id: 'ACT-BF-001', fecha: '2026-02-25', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama de jaulas de reproducción. Material sustituido sin novedades sanitarias.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BF-002', fecha: '2026-03-08', hora: '10:00', usuario: 'Bioterista', descripcion: 'Revisión de M-B-001. Animal en buen estado, activo y con peso dentro del rango esperado.', tipo: 'manual', tag: 'manual', animalId: 'M-B-001' },
        { id: 'ACT-BF-003', fecha: '2026-03-22', hora: '14:00', usuario: 'Bioterista', descripcion: 'Reparación de puerta de jaula P-B-003. Mecanismo de cierre ajustado y lubricado.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BF-004', fecha: '2026-04-05', hora: '08:30', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de fundación BALB/c. Tubo reemplazado por LED.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BF-005', fecha: '2026-04-16', hora: '11:00', usuario: 'Bioterista', descripcion: 'Transferencia de A-B-001-01 y A-B-001-05 hacia Colonia de Producción tras selección por destete.', tipo: 'manual', tag: 'manual' },
      ],
      produccion: [
        { id: 'ACT-BP-001', fecha: '2026-04-22', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en jaulas de producción. Todos los recintos renovados y desinfectados.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BP-002', fecha: '2026-05-06', hora: '11:00', usuario: 'Bioterista', descripcion: 'Revisión de A-B-001-01. Animal activo, estado reproductivo óptimo. Sin signos clínicos.', tipo: 'manual', tag: 'manual', animalId: 'A-B-001-01' },
        { id: 'ACT-BP-003', fecha: '2026-05-18', hora: '14:30', usuario: 'Bioterista', descripcion: 'Reparación de bebedero de JAU-P-B-002. Fuga de agua corregida. Válvula reemplazada.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BP-004', fecha: '2026-06-01', hora: '08:00', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de producción BALB/c. Instalación de LED completada.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BP-005', fecha: '2026-06-15', hora: '10:00', usuario: 'Bioterista', descripcion: 'Registro de actividad reproductiva en JAU-P-B-005. Comportamiento de cópula observado.', tipo: 'manual', tag: 'manual' },
      ],
      stock: [
        { id: 'ACT-BS-001', fecha: '2026-05-08', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en jaulas de stock BALB/c. Todos los recintos renovados sin incidentes.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BS-002', fecha: '2026-05-20', hora: '10:00', usuario: 'Bioterista', descripcion: 'Revisión de A-P-B-001. Estado óptimo, peso dentro del rango. Sin signos de patología.', tipo: 'manual', tag: 'manual', animalId: 'A-P-B-001' },
        { id: 'ACT-BS-003', fecha: '2026-06-02', hora: '14:00', usuario: 'Bioterista', descripcion: 'Reparación de jaula JAU-S-B-003. Pasador de tapa roto reemplazado. Sin fugas.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BS-004', fecha: '2026-06-12', hora: '08:30', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de stock BALB/c. Instalación completada sin inconvenientes.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-BS-005', fecha: '2026-06-20', hora: '11:00', usuario: 'Bioterista', descripcion: 'Transferencia de A-P-B-002 desde Stock hacia área de cuarentena para control sanitario.', tipo: 'manual', tag: 'manual', animalId: 'A-P-B-002' },
      ],
    },
  },

  c57: {
    parejas: [
      { id: 'P-C-001', machoId: 'M-C-001', hembraId: 'H-C-001', fechaApareamiento: '2026-05-20', estado: 'activo', cepa: 'C57BL/6' },
      { id: 'P-C-002', machoId: 'M-C-002', hembraId: 'H-C-002', fechaApareamiento: '2026-06-03', estado: 'activo', cepa: 'C57BL/6' },
    ],
    reproductores: [
      { id: 'M-C-001', sexo: 'macho',  nombre: 'Macho 1',   origen: 'Fundación', generacion: 'G7' },
      { id: 'M-C-002', sexo: 'macho',  nombre: 'Macho 2',   origen: 'Fundación', generacion: 'G7' },
      { id: 'H-C-001', sexo: 'hembra', nombre: 'Hembra 1',  origen: 'Fundación', generacion: 'G7' },
      { id: 'H-C-002', sexo: 'hembra', nombre: 'Hembra 2',  origen: 'Fundación', generacion: 'G8' },
    ],
    camadas: [
      { id: 'CAM-C-001', codigo: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', pareja: 'P-C-001', fechaNacimiento: '2026-05-10', cantidadNacida: 6, destetada: true, fechaDestete: '2026-05-31', cantidadDestetada: 6, machos: 3, hembras: 3, observaciones: 'Camada uniforme, buen desarrollo.', cepa: 'C57BL/6' },
    ],
    animales: [
      { id: 'A-C-001-01', sexo: 'macho',  camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'fundacion',  pesoDestete: 14 },
      { id: 'A-C-001-02', sexo: 'macho',  camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 13 },
      { id: 'A-C-001-03', sexo: 'macho',  camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 12 },
      { id: 'A-C-001-04', sexo: 'hembra', camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'fundacion',  pesoDestete: 12 },
      { id: 'A-C-001-05', sexo: 'hembra', camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 11 },
      { id: 'A-C-001-06', sexo: 'hembra', camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 11 },
    ],
    produccion: {
      jaulas: [
        {
          id: 'JAU-P-C-001', codigo: 'JAU-P-C-001', cepa: 'C57BL/6',
          machoId: 'A-C-001-02', hembraIds: ['A-C-001-05', 'A-C-001-06'],
          fechaFormacion: '2026-06-05', estado: 'activo', observaciones: '',
        },
      ],
      camadas: [],
    },
    stock: {
      jaulas: [
        { id: 'JAU-S-C-001', codigo: 'JAU-S-C-001', cepa: 'C57BL/6', sexo: 'macho',  cantidadActual: 1, fechaIngreso: '2026-06-16', fechaNacimiento: '2026-05-10', origenId: null, origenTipo: 'manual', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-C-002', codigo: 'JAU-S-C-002', cepa: 'C57BL/6', sexo: 'hembra', cantidadActual: 1, fechaIngreso: '2026-06-16', fechaNacimiento: '2026-05-10', origenId: null, origenTipo: 'manual', observaciones: '', estado: 'activo' },
      ],
      movimientos: [
        { id: 'MOV-C-001', tipo: 'ingreso_manual',  fecha: '2026-06-16', cantidad: 4, sexo: 'macho',  cepa: 'C57BL/6', jaulaId: 'JAU-S-C-001', investigador: '', proyecto: '', motivo: 'Ingreso manual de lote inicial', observaciones: '' },
        { id: 'MOV-C-002', tipo: 'ingreso_manual',  fecha: '2026-06-16', cantidad: 4, sexo: 'hembra', cepa: 'C57BL/6', jaulaId: 'JAU-S-C-002', investigador: '', proyecto: '', motivo: 'Ingreso manual de lote inicial', observaciones: '' },
        { id: 'MOV-C-003', tipo: 'baja_sacrificio', fecha: '2026-06-18', cantidad: 1, sexo: 'macho',  cepa: 'C57BL/6', jaulaId: 'JAU-S-C-001', investigador: '', proyecto: '', motivo: 'Baja por sobrepoblación — ajuste de densidad', observaciones: '' },
        { id: 'MOV-C-004', tipo: 'baja_muerte',     fecha: '2026-06-19', cantidad: 2, sexo: 'hembra', cepa: 'C57BL/6', jaulaId: 'JAU-S-C-002', investigador: '', proyecto: '', motivo: 'Baja por edad avanzada — animales fuera de rango de uso', observaciones: '' },
        { id: 'MOV-C-005', tipo: 'entrega',         fecha: '2026-06-20', cantidad: 2, sexo: 'macho',  cepa: 'C57BL/6', jaulaId: 'JAU-S-C-001', investigador: 'Investigador E', proyecto: 'Protocolo EXP-2026-09 — Oncología experimental', motivo: '', observaciones: '' },
        { id: 'MOV-C-006', tipo: 'entrega',         fecha: '2026-06-21', cantidad: 1, sexo: 'hembra', cepa: 'C57BL/6', jaulaId: 'JAU-S-C-002', investigador: 'Investigador A', proyecto: 'Protocolo EXP-2026-04 — Metabolismo lipídico', motivo: '', observaciones: '' },
      ],
    },
    historialEventos: [
      { id: 'EVT-C-001', animalId: 'A-C-001-01', fecha: '2026-05-31', tipo: 'nacimiento',           descripcion: 'Nacimiento registrado — Camada CAM-C-001. Padre: M-C-001, Madre: H-C-001.', usuario: 'Sistema' },
      { id: 'EVT-C-002', animalId: 'A-C-001-01', fecha: '2026-06-10', tipo: 'transferencia_colonia', descripcion: 'Transferido de Fundación a Producción. Seleccionado como reproductor.', usuario: 'Bioterista' },
    ],
    actividadesColonia: {
      fundacion: [
        { id: 'ACT-CF-001', fecha: '2026-06-01', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en jaulas de fundación C57BL/6. Sin novedades sanitarias.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CF-002', fecha: '2026-06-05', hora: '10:30', usuario: 'Bioterista', descripcion: 'Revisión de M-C-001. Estado óptimo, peso dentro del rango esperado para la cepa.', tipo: 'manual', tag: 'manual', animalId: 'M-C-001' },
        { id: 'ACT-CF-003', fecha: '2026-06-08', hora: '14:00', usuario: 'Bioterista', descripcion: 'Reparación de tapa de jaula P-C-001. Pasador roto reemplazado.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CF-004', fecha: '2026-06-12', hora: '08:30', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de fundación C57. LED instalado correctamente.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CF-005', fecha: '2026-06-15', hora: '11:00', usuario: 'Bioterista', descripcion: 'Transferencia de A-C-001-01 y A-C-001-04 hacia Colonia de Producción.', tipo: 'manual', tag: 'manual' },
      ],
      produccion: [
        { id: 'ACT-CP-001', fecha: '2026-06-10', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en jaulas de producción C57BL/6. Todos los recintos renovados.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CP-002', fecha: '2026-06-12', hora: '11:00', usuario: 'Bioterista', descripcion: 'Revisión de A-C-001-02. Animal activo, estado reproductivo óptimo.', tipo: 'manual', tag: 'manual', animalId: 'A-C-001-02' },
        { id: 'ACT-CP-003', fecha: '2026-06-14', hora: '14:30', usuario: 'Bioterista', descripcion: 'Reparación de bebedero de JAU-P-C-001. Goteo corregido. Válvula reemplazada.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CP-004', fecha: '2026-06-16', hora: '08:00', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de producción C57. Instalación de LED completada.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CP-005', fecha: '2026-06-19', hora: '10:00', usuario: 'Bioterista', descripcion: 'Registro de comportamiento reproductivo en JAU-P-C-001. Actividad de cópula observada.', tipo: 'manual', tag: 'manual' },
      ],
      stock: [
        { id: 'ACT-CS-001', fecha: '2026-06-18', hora: '09:00', usuario: 'Bioterista', descripcion: 'Cambio de cama en jaulas de stock C57BL/6. Recintos renovados sin incidentes.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CS-002', fecha: '2026-06-19', hora: '10:00', usuario: 'Bioterista', descripcion: 'Revisión general de stock C57BL/6. Animales en buen estado. Sin signos clínicos.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CS-003', fecha: '2026-06-20', hora: '14:00', usuario: 'Bioterista', descripcion: 'Reparación de jaula JAU-S-C-001. Pasador de tapa ajustado.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CS-004', fecha: '2026-06-21', hora: '08:30', usuario: 'Bioterista', descripcion: 'Cambio de luminaria en sala de stock C57. Instalación completada.', tipo: 'manual', tag: 'manual' },
        { id: 'ACT-CS-005', fecha: '2026-06-22', hora: '11:00', usuario: 'Bioterista', descripcion: 'Transferencia de animales entre jaulas de stock para optimizar densidad poblacional.', tipo: 'manual', tag: 'manual' },
      ],
    },
  },
}

// ── Nomenclatura operativa ───────────────────────────────────────────────────
function _abrevReproductor(nombre) {
  if (!nombre) return '?'
  const m = nombre.match(/^Macho\s+(\d+)$/)
  if (m) return `M${m[1]}`
  const h = nombre.match(/^Hembra\s+(\d+)$/)
  if (h) return `H${h[1]}`
  return nombre.replace(/[^A-Z0-9]/gi, '').slice(0, 5).toUpperCase() || '?'
}

function _coloniaPrefix(animal, datos) {
  const enJaulaProd = datos.produccion?.jaulas?.find(
    j => j.machoId === animal.id || j.hembraIds?.includes(animal.id)
  )
  if (enJaulaProd) return 'P'
  const trans = (datos.historialEventos ?? [])
    .filter(e => e.animalId === animal.id && e.tipo === 'transferencia_colonia' && e.coloniaDestino)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  if (trans.length > 0) {
    const d = trans[0].coloniaDestino
    if (d === 'Producción') return 'P'
    if (d === 'Stock') return 'S'
    return 'F'
  }
  switch (animal.destino) {
    case 'produccion':      return 'P'
    case 'no_seleccionado': return 'S'
    case 'fundacion':       return 'F'
    default: {
      const enProd = datos.produccion?.camadas?.find(c => c.id === animal.camadaId)
      return enProd ? 'P' : 'F'
    }
  }
}

function _abrevParent(id, datos) {
  if (!id) return '?'
  const r = datos.reproductores?.find(r => r.id === id)
  if (r) return _abrevReproductor(r.nombre)
  const a = datos.animales?.find(a => a.id === id)
  if (a) {
    const n = _nombreOperativo(a, datos)
    if (n) return n.split('-').slice(1).join('')
  }
  return id.slice(-4)
}

function _nombreOperativo(animal, datos) {
  if (!animal?.padreId || !animal?.madreId) return null
  const p = _abrevParent(animal.padreId, datos)
  const m = _abrevParent(animal.madreId, datos)
  const colonia = _coloniaPrefix(animal, datos)
  const hermanos = (datos.animales ?? [])
    .filter(a => a.camadaId === animal.camadaId && a.sexo === animal.sexo)
    .sort((a, b) => a.id.localeCompare(b.id))
  const n = hermanos.findIndex(a => a.id === animal.id) + 1
  if (n === 0) return null
  return `${colonia}-${p}${m}-${animal.sexo === 'macho' ? 'M' : 'H'}${n}`
}

export function getNombreAnimal(id, datos) {
  if (!id || !datos) return id ?? '—'
  const r = datos.reproductores?.find(r => r.id === id)
  if (r) return r.nombre
  const a = datos.animales?.find(a => a.id === id)
  if (a) return _nombreOperativo(a, datos) ?? id
  return id
}

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  const sp = action.especieId
  switch (action.type) {

    // Fundación
    case 'SET_DESTINO_ANIMAL':
      return { ...state, [sp]: { ...state[sp], animales: state[sp].animales.map(a => a.id === action.animalId ? { ...a, destino: action.destino } : a) } }

    case 'REGISTRAR_DESTETE': {
      const { camadaId, cantidadDestetada, machos, hembras, fechaDestete } = action
      const camada = state[sp].camadas.find(c => c.id === camadaId)
      if (!camada) return state
      const nuevos = [
        ...Array.from({ length: machos },  (_, i) => ({ id: `${camadaId}-M${i+1}`, sexo: 'macho',  camadaId, padreId: camada.padreId, madreId: camada.madreId, fechaNacimiento: camada.fechaNacimiento, destino: null, pesoDestete: null })),
        ...Array.from({ length: hembras }, (_, i) => ({ id: `${camadaId}-H${i+1}`, sexo: 'hembra', camadaId, padreId: camada.padreId, madreId: camada.madreId, fechaNacimiento: camada.fechaNacimiento, destino: null, pesoDestete: null })),
      ]
      return { ...state, [sp]: { ...state[sp],
        camadas:  state[sp].camadas.map(c => c.id === camadaId ? { ...c, destetada: true, cantidadDestetada, machos, hembras, fechaDestete } : c),
        animales: [...state[sp].animales, ...nuevos],
      }}
    }

    // Producción — jaulas
    case 'CREAR_JAULA':
      return { ...state, [sp]: { ...state[sp], produccion: { ...state[sp].produccion, jaulas: [...state[sp].produccion.jaulas, action.jaula] } } }

    case 'EDITAR_ESTADO_JAULA':
      return { ...state, [sp]: { ...state[sp], produccion: { ...state[sp].produccion,
        jaulas: state[sp].produccion.jaulas.map(j => j.id === action.jaulaId ? { ...j, estado: action.estado } : j)
      }}}

    // Producción — camadas
    case 'REGISTRAR_NACIMIENTO_PROD':
      return { ...state, [sp]: { ...state[sp], produccion: { ...state[sp].produccion,
        camadas: [...state[sp].produccion.camadas, action.camada]
      }}}

    case 'REGISTRAR_DESTETE_PROD':
      return { ...state, [sp]: { ...state[sp], produccion: { ...state[sp].produccion,
        camadas: state[sp].produccion.camadas.map(c => c.id === action.camadaId ? { ...c, destete: action.destete } : c)
      }}}

    case 'REGISTRAR_SELECCION_PROD': {
      const espData = state[sp]
      const camada  = espData.produccion.camadas.find(c => c.id === action.camadaId)
      const cepa    = espData.produccion.jaulas.find(j => j.id === camada?.jaulaId)?.cepa ?? sp
      const { stock } = action
      const ts = Date.now()
      const nuevasJaulas = []
      const nuevosMovs   = []
      if (stock.machos > 0) {
        const jId = `JAU-S-${sp.slice(0,1).toUpperCase()}-${ts}M`
        nuevasJaulas.push({ id: jId, codigo: jId, cepa, sexo: 'macho', cantidadActual: stock.machos, fechaIngreso: stock.fechaIngreso, fechaNacimiento: camada?.fechaNacimiento ?? stock.fechaIngreso, origenId: action.camadaId, origenTipo: 'produccion', observaciones: '', estado: 'activo' })
        nuevosMovs.push({ id: `MOV-${ts}M`, tipo: 'ingreso_produccion', fecha: stock.fechaIngreso, cantidad: stock.machos, sexo: 'macho', cepa, jaulaId: jId, investigador: '', proyecto: '', motivo: `Ingreso desde Producción — ${action.camadaId}`, observaciones: '' })
      }
      if (stock.hembras > 0) {
        const jId = `JAU-S-${sp.slice(0,1).toUpperCase()}-${ts}H`
        nuevasJaulas.push({ id: jId, codigo: jId, cepa, sexo: 'hembra', cantidadActual: stock.hembras, fechaIngreso: stock.fechaIngreso, fechaNacimiento: camada?.fechaNacimiento ?? stock.fechaIngreso, origenId: action.camadaId, origenTipo: 'produccion', observaciones: '', estado: 'activo' })
        nuevosMovs.push({ id: `MOV-${ts}H`, tipo: 'ingreso_produccion', fecha: stock.fechaIngreso, cantidad: stock.hembras, sexo: 'hembra', cepa, jaulaId: jId, investigador: '', proyecto: '', motivo: `Ingreso desde Producción — ${action.camadaId}`, observaciones: '' })
      }
      return { ...state, [sp]: {
        ...espData,
        produccion: { ...espData.produccion,
          camadas: espData.produccion.camadas.map(c => c.id === action.camadaId ? { ...c, seleccion: action.seleccion, stock: action.stock } : c)
        },
        stock: {
          ...espData.stock,
          jaulas:      [...espData.stock.jaulas,      ...nuevasJaulas],
          movimientos: [...espData.stock.movimientos, ...nuevosMovs],
        },
      }}
    }

    // Stock
    case 'CREAR_JAULA_STOCK': {
      const espData = state[sp]
      return { ...state, [sp]: { ...espData, stock: {
        ...espData.stock,
        jaulas:      [...espData.stock.jaulas, action.jaula],
        movimientos: [...espData.stock.movimientos, action.movimiento],
      }}}
    }

    case 'MOVIMIENTO_STOCK': {
      const espData = state[sp]
      const { movimiento, jaulaId, delta } = action
      return { ...state, [sp]: { ...espData, stock: {
        ...espData.stock,
        jaulas: espData.stock.jaulas.map(j => {
          if (j.id !== jaulaId) return j
          const nueva = Math.max(0, j.cantidadActual + delta)
          return { ...j, cantidadActual: nueva, estado: nueva <= 0 ? 'vacia' : 'activo' }
        }),
        movimientos: [...espData.stock.movimientos, movimiento],
      }}}
    }

    case 'TRANSFERENCIA_STOCK': {
      const espData = state[sp]
      const { movDesde, movHacia, desdeId, hastaId, cantidad } = action
      return { ...state, [sp]: { ...espData, stock: {
        ...espData.stock,
        jaulas: espData.stock.jaulas.map(j => {
          if (j.id === desdeId) { const n = Math.max(0, j.cantidadActual - cantidad); return { ...j, cantidadActual: n, estado: n <= 0 ? 'vacia' : 'activo' } }
          if (j.id === hastaId) return { ...j, cantidadActual: j.cantidadActual + cantidad }
          return j
        }),
        movimientos: [...espData.stock.movimientos, movDesde, movHacia],
      }}}
    }

    case 'REGISTRAR_EVENTO_ANIMAL': {
      const espData = state[action.especieId]
      return { ...state, [action.especieId]: {
        ...espData,
        historialEventos: [...(espData.historialEventos ?? []), action.evento],
      }}
    }

    case 'TRANSFERIR_ANIMAL': {
      const espData = state[sp]
      const { animalId, coloniaOrigen, coloniaDestino, nuevaColoniaKey, fecha, responsable, observaciones } = action
      return { ...state, [sp]: {
        ...espData,
        animales: espData.animales.map(a =>
          a.id === animalId ? { ...a, destino: nuevaColoniaKey } : a
        ),
        historialEventos: [...(espData.historialEventos ?? []), {
          id: `TRANS-${Date.now()}`,
          animalId,
          fecha,
          tipo: 'transferencia_colonia',
          coloniaOrigen,
          coloniaDestino,
          descripcion: `Transferido de ${coloniaOrigen} a ${coloniaDestino}.${observaciones ? ' ' + observaciones : ''}`,
          usuario: responsable || 'Sistema',
          observaciones,
        }],
      }}
    }

    case 'REGISTRAR_ACTIVIDAD_COLONIA': {
      const { especieId: eId, colonia, actividad } = action
      const espData = state[eId]
      return {
        ...state,
        [eId]: {
          ...espData,
          actividadesColonia: {
            ...(espData.actividadesColonia ?? {}),
            [colonia]: [...(espData.actividadesColonia?.[colonia] ?? []), actividad],
          },
        },
      }
    }

    default: return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
const ICIVETContext = createContext()

export function ICIVETProvider({ children }) {
  const [datos, dispatch] = useReducer(reducer, DATOS_INICIALES)

  // Fundación
  function setDestinoAnimal(especieId, animalId, destino)                    { dispatch({ type: 'SET_DESTINO_ANIMAL', especieId, animalId, destino }) }
  function registrarDestete(especieId, camadaId, cantidadDestetada, machos, hembras, fechaDestete) { dispatch({ type: 'REGISTRAR_DESTETE', especieId, camadaId, cantidadDestetada, machos, hembras, fechaDestete }) }

  // Producción
  function crearJaula(especieId, jaula)                                        { dispatch({ type: 'CREAR_JAULA', especieId, jaula }) }
  function editarEstadoJaula(especieId, jaulaId, estado)                       { dispatch({ type: 'EDITAR_ESTADO_JAULA', especieId, jaulaId, estado }) }
  function registrarNacimientoProd(especieId, camada)                          { dispatch({ type: 'REGISTRAR_NACIMIENTO_PROD', especieId, camada }) }
  function registrarDesteeProd(especieId, camadaId, destete)                   { dispatch({ type: 'REGISTRAR_DESTETE_PROD', especieId, camadaId, destete }) }
  function registrarSeleccionProd(especieId, camadaId, seleccion, stock)       { dispatch({ type: 'REGISTRAR_SELECCION_PROD', especieId, camadaId, seleccion, stock }) }

  // Stock
  function crearJaulaStock(especieId, jaula, movimiento)                                           { dispatch({ type: 'CREAR_JAULA_STOCK',    especieId, jaula, movimiento }) }
  function registrarMovimientoStock(especieId, movimiento, jaulaId, delta)                         { dispatch({ type: 'MOVIMIENTO_STOCK',      especieId, movimiento, jaulaId, delta }) }
  function registrarTransferenciaStock(especieId, movDesde, movHacia, desdeId, hastaId, cantidad)  { dispatch({ type: 'TRANSFERENCIA_STOCK',   especieId, movDesde, movHacia, desdeId, hastaId, cantidad }) }

  // Historial individual
  function registrarEventoAnimal(especieId, evento) { dispatch({ type: 'REGISTRAR_EVENTO_ANIMAL', especieId, evento }) }

  // Registro de actividades por colonia
  function registrarActividadColonia(especieId, colonia, actividad) { dispatch({ type: 'REGISTRAR_ACTIVIDAD_COLONIA', especieId, colonia, actividad }) }

  // Transferencia entre colonias
  function transferirAnimal(especieId, animalId, coloniaOrigen, coloniaDestino, nuevaColoniaKey, fecha, responsable, observaciones) {
    dispatch({ type: 'TRANSFERIR_ANIMAL', especieId, animalId, coloniaOrigen, coloniaDestino, nuevaColoniaKey, fecha, responsable, observaciones })
  }

  function getDatosEspecie(especieId) { return datos[especieId] ?? null }

  return (
    <ICIVETContext.Provider value={{
      datos, getDatosEspecie,
      setDestinoAnimal, registrarDestete,
      crearJaula, editarEstadoJaula,
      registrarNacimientoProd, registrarDesteeProd, registrarSeleccionProd,
      crearJaulaStock, registrarMovimientoStock, registrarTransferenciaStock,
      registrarEventoAnimal, registrarActividadColonia, transferirAnimal,
    }}>
      {children}
    </ICIVETContext.Provider>
  )
}

export function useICIVET() { return useContext(ICIVETContext) }
