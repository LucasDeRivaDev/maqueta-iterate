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
    // ── Fundación ──────────────────────────────────────────────────────────
    parejas: [
      { id: 'P-W-001', machoId: 'M-W-001', hembraId: 'H-W-001', fechaApareamiento: '2026-05-12', estado: 'activo',   cepa: 'Wistar' },
      { id: 'P-W-002', machoId: 'M-W-002', hembraId: 'H-W-002', fechaApareamiento: '2026-05-08', estado: 'activo',   cepa: 'Wistar' },
      { id: 'P-W-003', machoId: 'M-W-003', hembraId: 'H-W-003', fechaApareamiento: '2026-04-20', estado: 'activo',   cepa: 'Wistar' },
      { id: 'P-W-004', machoId: 'M-W-001', hembraId: 'H-W-004', fechaApareamiento: '2026-03-10', estado: 'inactivo', cepa: 'Wistar' },
      { id: 'P-W-005', machoId: 'M-W-004', hembraId: 'H-W-005', fechaApareamiento: '2026-06-05', estado: 'activo',   cepa: 'Wistar' },
    ],
    reproductores: [
      { id: 'M-W-001', sexo: 'macho',  nombre: 'M-W-001', origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-002', sexo: 'macho',  nombre: 'M-W-002', origen: 'Fundación', generacion: 'G3' },
      { id: 'M-W-003', sexo: 'macho',  nombre: 'M-W-003', origen: 'Fundación', generacion: 'G4' },
      { id: 'M-W-004', sexo: 'macho',  nombre: 'M-W-004', origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-001', sexo: 'hembra', nombre: 'H-W-001', origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-002', sexo: 'hembra', nombre: 'H-W-002', origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-003', sexo: 'hembra', nombre: 'H-W-003', origen: 'Fundación', generacion: 'G4' },
      { id: 'H-W-004', sexo: 'hembra', nombre: 'H-W-004', origen: 'Fundación', generacion: 'G3' },
      { id: 'H-W-005', sexo: 'hembra', nombre: 'H-W-005', origen: 'Fundación', generacion: 'G4' },
    ],
    camadas: [
      { id: 'CAM-W-001', codigo: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', pareja: 'P-W-004', fechaNacimiento: '2026-04-05', cantidadNacida: 11, destetada: true,  fechaDestete: '2026-04-26', cantidadDestetada: 9,    machos: 5,    hembras: 4,    observaciones: 'Camada saludable. Todos los animales con buen desarrollo.', cepa: 'Wistar' },
      { id: 'CAM-W-002', codigo: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', pareja: 'P-W-002', fechaNacimiento: '2026-05-01', cantidadNacida: 9,  destetada: true,  fechaDestete: '2026-05-22', cantidadDestetada: 8,    machos: 4,    hembras: 4,    observaciones: 'Sin observaciones.',                                           cepa: 'Wistar' },
      { id: 'CAM-W-003', codigo: 'CAM-W-003', padreId: 'M-W-003', madreId: 'H-W-003', pareja: 'P-W-003', fechaNacimiento: '2026-05-24', cantidadNacida: 12, destetada: false, fechaDestete: null,         cantidadDestetada: null, machos: null, hembras: null, observaciones: 'En lactancia. Destete previsto para 2026-06-14.',              cepa: 'Wistar' },
    ],
    animales: [
      { id: 'A-W-001-01', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'fundacion',       pesoDestete: 42 },
      { id: 'A-W-001-02', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'fundacion',       pesoDestete: 45 },
      { id: 'A-W-001-03', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'no_seleccionado', pesoDestete: 38 },
      { id: 'A-W-001-04', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',      pesoDestete: 40 },
      { id: 'A-W-001-05', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',      pesoDestete: 41 },
      { id: 'A-W-001-06', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'fundacion',       pesoDestete: 36 },
      { id: 'A-W-001-07', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',      pesoDestete: 34 },
      { id: 'A-W-001-08', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'no_seleccionado', pesoDestete: 30 },
      { id: 'A-W-001-09', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',      pesoDestete: 33 },
      { id: 'A-W-002-01', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'fundacion',       pesoDestete: 44 },
      { id: 'A-W-002-02', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',      pesoDestete: 40 },
      { id: 'A-W-002-03', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'no_seleccionado', pesoDestete: 37 },
      { id: 'A-W-002-04', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',      pesoDestete: 42 },
      { id: 'A-W-002-05', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'fundacion',       pesoDestete: 35 },
      { id: 'A-W-002-06', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',      pesoDestete: 32 },
      { id: 'A-W-002-07', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'no_seleccionado', pesoDestete: 29 },
      { id: 'A-W-002-08', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',      pesoDestete: 31 },
    ],

    // ── Producción ─────────────────────────────────────────────────────────
    produccion: {
      jaulas: [
        {
          id: 'JAU-P-W-001', codigo: 'JAU-P-W-001', cepa: 'Wistar',
          machoId: 'A-W-001-04', hembraIds: ['A-W-001-07', 'A-W-001-09'],
          fechaFormacion: '2026-04-28', estado: 'activo', observaciones: '',
        },
        {
          id: 'JAU-P-W-002', codigo: 'JAU-P-W-002', cepa: 'Wistar',
          machoId: 'A-W-002-02', hembraIds: ['A-W-002-06', 'A-W-002-08'],
          fechaFormacion: '2026-05-30', estado: 'activo', observaciones: 'Formada con reproductores de la segunda camada.',
        },
      ],
      camadas: [
        {
          id: 'CAM-P-W-001', codigo: 'CAM-P-W-001',
          jaulaId: 'JAU-P-W-001', machoId: 'A-W-001-04', hembraIds: ['A-W-001-07', 'A-W-001-09'],
          fechaNacimiento: '2026-05-21', cantidadNacida: 9,
          observaciones: 'Camada sana, desarrollo normal.',
          destete: { fecha: '2026-06-11', machos: 4, hembras: 5, observaciones: 'Sin novedades.' },
          seleccion: { machosSeleccionados: 1, hembrasSeleccionadas: 2, motivo: 'Buen desarrollo corporal y uniformidad de tamaño.', fecha: '2026-06-11' },
          stock: { machos: 3, hembras: 3, fechaIngreso: '2026-06-11' },
        },
        {
          id: 'CAM-P-W-002', codigo: 'CAM-P-W-002',
          jaulaId: 'JAU-P-W-001', machoId: 'A-W-001-04', hembraIds: ['A-W-001-07', 'A-W-001-09'],
          fechaNacimiento: '2026-06-12', cantidadNacida: 10,
          observaciones: '',
          destete: null, seleccion: null, stock: null,
        },
        {
          id: 'CAM-P-W-003', codigo: 'CAM-P-W-003',
          jaulaId: 'JAU-P-W-002', machoId: 'A-W-002-02', hembraIds: ['A-W-002-06', 'A-W-002-08'],
          fechaNacimiento: '2026-06-20', cantidadNacida: 8,
          observaciones: 'Nacimiento sin complicaciones.',
          destete: null, seleccion: null, stock: null,
        },
      ],
    },

    // ── Stock ──────────────────────────────────────────────────────────────
    stock: {
      jaulas: [
        { id: 'JAU-S-W-001', codigo: 'JAU-S-W-001', cepa: 'Wistar', sexo: 'macho',  cantidadActual: 1, fechaIngreso: '2026-06-11', fechaNacimiento: '2026-05-21', origenId: 'CAM-P-W-001', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
        { id: 'JAU-S-W-002', codigo: 'JAU-S-W-002', cepa: 'Wistar', sexo: 'hembra', cantidadActual: 3, fechaIngreso: '2026-06-11', fechaNacimiento: '2026-05-21', origenId: 'CAM-P-W-001', origenTipo: 'produccion', observaciones: '', estado: 'activo' },
      ],
      movimientos: [
        { id: 'MOV-W-001', tipo: 'ingreso_produccion', fecha: '2026-06-11', cantidad: 3, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-001', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-001', observaciones: '' },
        { id: 'MOV-W-002', tipo: 'ingreso_produccion', fecha: '2026-06-11', cantidad: 3, sexo: 'hembra', cepa: 'Wistar', jaulaId: 'JAU-S-W-002', investigador: '', proyecto: '', motivo: 'Ingreso desde Producción — CAM-P-W-001', observaciones: '' },
        { id: 'MOV-W-003', tipo: 'entrega',            fecha: '2026-06-15', cantidad: 2, sexo: 'macho',  cepa: 'Wistar', jaulaId: 'JAU-S-W-001', investigador: 'Dra. García',    proyecto: 'Protocolo EXP-2026-04 — Metabolismo lipídico', motivo: '', observaciones: 'Entrega urgente para experimento en curso.' },
      ],
    },
    historialEventos: [],
  },

  balbc: {
    parejas: [
      { id: 'P-B-001', machoId: 'M-B-001', hembraId: 'H-B-001', fechaApareamiento: '2026-05-15', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-002', machoId: 'M-B-002', hembraId: 'H-B-002', fechaApareamiento: '2026-05-10', estado: 'activo', cepa: 'BALB/c' },
      { id: 'P-B-003', machoId: 'M-B-003', hembraId: 'H-B-003', fechaApareamiento: '2026-06-01', estado: 'activo', cepa: 'BALB/c' },
    ],
    reproductores: [
      { id: 'M-B-001', sexo: 'macho',  nombre: 'M-B-001', origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-002', sexo: 'macho',  nombre: 'M-B-002', origen: 'Fundación', generacion: 'G5' },
      { id: 'M-B-003', sexo: 'macho',  nombre: 'M-B-003', origen: 'Fundación', generacion: 'G6' },
      { id: 'H-B-001', sexo: 'hembra', nombre: 'H-B-001', origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-002', sexo: 'hembra', nombre: 'H-B-002', origen: 'Fundación', generacion: 'G5' },
      { id: 'H-B-003', sexo: 'hembra', nombre: 'H-B-003', origen: 'Fundación', generacion: 'G6' },
    ],
    camadas: [
      { id: 'CAM-B-001', codigo: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', pareja: 'P-B-001', fechaNacimiento: '2026-05-05', cantidadNacida: 8,  destetada: true,  fechaDestete: '2026-05-26', cantidadDestetada: 7,    machos: 3,    hembras: 4,    observaciones: 'Desarrollo normal.', cepa: 'BALB/c' },
      { id: 'CAM-B-002', codigo: 'CAM-B-002', padreId: 'M-B-002', madreId: 'H-B-002', pareja: 'P-B-002', fechaNacimiento: '2026-05-18', cantidadNacida: 7,  destetada: false, fechaDestete: null,         cantidadDestetada: null, machos: null, hembras: null, observaciones: 'En lactancia.', cepa: 'BALB/c' },
    ],
    animales: [
      { id: 'A-B-001-01', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'fundacion',       pesoDestete: 18 },
      { id: 'A-B-001-02', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'produccion',      pesoDestete: 17 },
      { id: 'A-B-001-03', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'no_seleccionado', pesoDestete: 15 },
      { id: 'A-B-001-04', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'fundacion',       pesoDestete: 16 },
      { id: 'A-B-001-05', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'produccion',      pesoDestete: 15 },
      { id: 'A-B-001-06', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'produccion',      pesoDestete: 14 },
      { id: 'A-B-001-07', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'no_seleccionado', pesoDestete: 13 },
    ],
    produccion: {
      jaulas: [
        {
          id: 'JAU-P-B-001', codigo: 'JAU-P-B-001', cepa: 'BALB/c',
          machoId: 'A-B-001-02', hembraIds: ['A-B-001-05', 'A-B-001-06'],
          fechaFormacion: '2026-06-01', estado: 'activo', observaciones: '',
        },
      ],
      camadas: [],
    },
    stock: { jaulas: [], movimientos: [] },
    historialEventos: [],
  },

  c57: {
    parejas: [
      { id: 'P-C-001', machoId: 'M-C-001', hembraId: 'H-C-001', fechaApareamiento: '2026-05-20', estado: 'activo', cepa: 'C57BL/6' },
      { id: 'P-C-002', machoId: 'M-C-002', hembraId: 'H-C-002', fechaApareamiento: '2026-06-03', estado: 'activo', cepa: 'C57BL/6' },
    ],
    reproductores: [
      { id: 'M-C-001', sexo: 'macho',  nombre: 'M-C-001', origen: 'Fundación', generacion: 'G7' },
      { id: 'M-C-002', sexo: 'macho',  nombre: 'M-C-002', origen: 'Fundación', generacion: 'G7' },
      { id: 'H-C-001', sexo: 'hembra', nombre: 'H-C-001', origen: 'Fundación', generacion: 'G7' },
      { id: 'H-C-002', sexo: 'hembra', nombre: 'H-C-002', origen: 'Fundación', generacion: 'G8' },
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
    stock: { jaulas: [], movimientos: [] },
    historialEventos: [],
  },
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

  function getDatosEspecie(especieId) { return datos[especieId] ?? null }

  return (
    <ICIVETContext.Provider value={{
      datos, getDatosEspecie,
      setDestinoAnimal, registrarDestete,
      crearJaula, editarEstadoJaula,
      registrarNacimientoProd, registrarDesteeProd, registrarSeleccionProd,
      crearJaulaStock, registrarMovimientoStock, registrarTransferenciaStock,
      registrarEventoAnimal,
    }}>
      {children}
    </ICIVETContext.Provider>
  )
}

export function useICIVET() { return useContext(ICIVETContext) }
