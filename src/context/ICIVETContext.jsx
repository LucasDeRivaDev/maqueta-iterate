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

// ── Datos de demostración ────────────────────────────────────────────────────
const DATOS_INICIALES = {
  wistar: {
    parejas: [
      { id: 'P-W-001', machoId: 'M-W-001', hembraId: 'H-W-001', fechaApareamiento: '2026-05-12', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-002', machoId: 'M-W-002', hembraId: 'H-W-002', fechaApareamiento: '2026-05-08', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-003', machoId: 'M-W-003', hembraId: 'H-W-003', fechaApareamiento: '2026-04-20', estado: 'activo', cepa: 'Wistar' },
      { id: 'P-W-004', machoId: 'M-W-001', hembraId: 'H-W-004', fechaApareamiento: '2026-03-10', estado: 'inactivo', cepa: 'Wistar' },
      { id: 'P-W-005', machoId: 'M-W-004', hembraId: 'H-W-005', fechaApareamiento: '2026-06-05', estado: 'activo', cepa: 'Wistar' },
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
      {
        id: 'CAM-W-001',
        codigo: 'CAM-W-001',
        padreId: 'M-W-001',
        madreId: 'H-W-004',
        pareja: 'P-W-004',
        fechaNacimiento: '2026-04-05',
        cantidadNacida: 11,
        destetada: true,
        fechaDestete: '2026-04-26',
        cantidadDestetada: 9,
        machos: 5,
        hembras: 4,
        observaciones: 'Camada saludable. Todos los animales con buen desarrollo.',
        cepa: 'Wistar',
      },
      {
        id: 'CAM-W-002',
        codigo: 'CAM-W-002',
        padreId: 'M-W-002',
        madreId: 'H-W-002',
        pareja: 'P-W-002',
        fechaNacimiento: '2026-05-01',
        cantidadNacida: 9,
        destetada: true,
        fechaDestete: '2026-05-22',
        cantidadDestetada: 8,
        machos: 4,
        hembras: 4,
        observaciones: 'Sin observaciones.',
        cepa: 'Wistar',
      },
      {
        id: 'CAM-W-003',
        codigo: 'CAM-W-003',
        padreId: 'M-W-003',
        madreId: 'H-W-003',
        pareja: 'P-W-003',
        fechaNacimiento: '2026-05-24',
        cantidadNacida: 12,
        destetada: false,
        fechaDestete: null,
        cantidadDestetada: null,
        machos: null,
        hembras: null,
        observaciones: 'En lactancia. Destete previsto para 2026-06-14.',
        cepa: 'Wistar',
      },
    ],
    animales: [
      // De CAM-W-001 (M-W-001 × H-W-004)
      { id: 'A-W-001-01', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'fundacion',      pesoDestete: 42 },
      { id: 'A-W-001-02', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'fundacion',      pesoDestete: 45 },
      { id: 'A-W-001-03', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'no_seleccionado', pesoDestete: 38 },
      { id: 'A-W-001-04', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',     pesoDestete: 40 },
      { id: 'A-W-001-05', sexo: 'macho',  camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',     pesoDestete: 41 },
      { id: 'A-W-001-06', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'fundacion',      pesoDestete: 36 },
      { id: 'A-W-001-07', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',     pesoDestete: 34 },
      { id: 'A-W-001-08', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'no_seleccionado', pesoDestete: 30 },
      { id: 'A-W-001-09', sexo: 'hembra', camadaId: 'CAM-W-001', padreId: 'M-W-001', madreId: 'H-W-004', fechaNacimiento: '2026-04-05', destino: 'produccion',     pesoDestete: 33 },
      // De CAM-W-002 (M-W-002 × H-W-002)
      { id: 'A-W-002-01', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'fundacion',      pesoDestete: 44 },
      { id: 'A-W-002-02', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',     pesoDestete: 40 },
      { id: 'A-W-002-03', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'no_seleccionado', pesoDestete: 37 },
      { id: 'A-W-002-04', sexo: 'macho',  camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',     pesoDestete: 42 },
      { id: 'A-W-002-05', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'fundacion',      pesoDestete: 35 },
      { id: 'A-W-002-06', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',     pesoDestete: 32 },
      { id: 'A-W-002-07', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'no_seleccionado', pesoDestete: 29 },
      { id: 'A-W-002-08', sexo: 'hembra', camadaId: 'CAM-W-002', padreId: 'M-W-002', madreId: 'H-W-002', fechaNacimiento: '2026-05-01', destino: 'produccion',     pesoDestete: 31 },
    ],
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
      {
        id: 'CAM-B-001',
        codigo: 'CAM-B-001',
        padreId: 'M-B-001',
        madreId: 'H-B-001',
        pareja: 'P-B-001',
        fechaNacimiento: '2026-05-05',
        cantidadNacida: 8,
        destetada: true,
        fechaDestete: '2026-05-26',
        cantidadDestetada: 7,
        machos: 3,
        hembras: 4,
        observaciones: 'Desarrollo normal.',
        cepa: 'BALB/c',
      },
      {
        id: 'CAM-B-002',
        codigo: 'CAM-B-002',
        padreId: 'M-B-002',
        madreId: 'H-B-002',
        pareja: 'P-B-002',
        fechaNacimiento: '2026-05-18',
        cantidadNacida: 7,
        destetada: false,
        fechaDestete: null,
        cantidadDestetada: null,
        machos: null,
        hembras: null,
        observaciones: 'En lactancia.',
        cepa: 'BALB/c',
      },
    ],
    animales: [
      // De CAM-B-001
      { id: 'A-B-001-01', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'fundacion',      pesoDestete: 18 },
      { id: 'A-B-001-02', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'produccion',     pesoDestete: 17 },
      { id: 'A-B-001-03', sexo: 'macho',  camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'no_seleccionado', pesoDestete: 15 },
      { id: 'A-B-001-04', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'fundacion',      pesoDestete: 16 },
      { id: 'A-B-001-05', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'produccion',     pesoDestete: 15 },
      { id: 'A-B-001-06', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'produccion',     pesoDestete: 14 },
      { id: 'A-B-001-07', sexo: 'hembra', camadaId: 'CAM-B-001', padreId: 'M-B-001', madreId: 'H-B-001', fechaNacimiento: '2026-05-05', destino: 'no_seleccionado', pesoDestete: 13 },
    ],
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
      {
        id: 'CAM-C-001',
        codigo: 'CAM-C-001',
        padreId: 'M-C-001',
        madreId: 'H-C-001',
        pareja: 'P-C-001',
        fechaNacimiento: '2026-05-10',
        cantidadNacida: 6,
        destetada: true,
        fechaDestete: '2026-05-31',
        cantidadDestetada: 6,
        machos: 3,
        hembras: 3,
        observaciones: 'Camada uniforme, buen desarrollo.',
        cepa: 'C57BL/6',
      },
    ],
    animales: [
      { id: 'A-C-001-01', sexo: 'macho',  camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'fundacion',  pesoDestete: 14 },
      { id: 'A-C-001-02', sexo: 'macho',  camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 13 },
      { id: 'A-C-001-03', sexo: 'macho',  camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 12 },
      { id: 'A-C-001-04', sexo: 'hembra', camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'fundacion',  pesoDestete: 12 },
      { id: 'A-C-001-05', sexo: 'hembra', camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 11 },
      { id: 'A-C-001-06', sexo: 'hembra', camadaId: 'CAM-C-001', padreId: 'M-C-001', madreId: 'H-C-001', fechaNacimiento: '2026-05-10', destino: 'produccion', pesoDestete: 11 },
    ],
  },
}

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_DESTINO_ANIMAL': {
      const { especieId, animalId, destino } = action
      return {
        ...state,
        [especieId]: {
          ...state[especieId],
          animales: state[especieId].animales.map((a) =>
            a.id === animalId ? { ...a, destino } : a
          ),
        },
      }
    }
    case 'REGISTRAR_DESTETE': {
      const { especieId, camadaId, cantidadDestetada, machos, hembras, fechaDestete } = action
      const camada = state[especieId].camadas.find(c => c.id === camadaId)
      if (!camada) return state

      const nuevosAnimales = []
      for (let i = 0; i < machos; i++) {
        nuevosAnimales.push({
          id: `${camadaId}-M${i + 1}`,
          sexo: 'macho',
          camadaId,
          padreId: camada.padreId,
          madreId: camada.madreId,
          fechaNacimiento: camada.fechaNacimiento,
          destino: null,
          pesoDestete: null,
        })
      }
      for (let i = 0; i < hembras; i++) {
        nuevosAnimales.push({
          id: `${camadaId}-H${i + 1}`,
          sexo: 'hembra',
          camadaId,
          padreId: camada.padreId,
          madreId: camada.madreId,
          fechaNacimiento: camada.fechaNacimiento,
          destino: null,
          pesoDestete: null,
        })
      }

      return {
        ...state,
        [especieId]: {
          ...state[especieId],
          camadas: state[especieId].camadas.map((c) =>
            c.id === camadaId
              ? { ...c, destetada: true, cantidadDestetada, machos, hembras, fechaDestete }
              : c
          ),
          animales: [...state[especieId].animales, ...nuevosAnimales],
        },
      }
    }
    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
const ICIVETContext = createContext()

export function ICIVETProvider({ children }) {
  const [datos, dispatch] = useReducer(reducer, DATOS_INICIALES)

  function setDestinoAnimal(especieId, animalId, destino) {
    dispatch({ type: 'SET_DESTINO_ANIMAL', especieId, animalId, destino })
  }

  function registrarDestete(especieId, camadaId, cantidadDestetada, machos, hembras, fechaDestete) {
    dispatch({ type: 'REGISTRAR_DESTETE', especieId, camadaId, cantidadDestetada, machos, hembras, fechaDestete })
  }

  function getDatosEspecie(especieId) {
    return datos[especieId] ?? null
  }

  return (
    <ICIVETContext.Provider value={{ datos, getDatosEspecie, setDestinoAnimal, registrarDestete }}>
      {children}
    </ICIVETContext.Provider>
  )
}

export function useICIVET() {
  return useContext(ICIVETContext)
}
