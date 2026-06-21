import { createContext, useContext, useReducer } from 'react'

export const GESTACION_DIAS_CONEJO = 31
export const DESTETE_DIAS_CONEJO   = 28

export const ESTADOS_ANIMAL = {
  cuarentena:   { label: 'Cuarentena',   color: '#ffb300', bg: 'rgba(255,179,0,0.12)',   borde: 'rgba(255,179,0,0.35)' },
  reproductor:  { label: 'Reproductor',  color: '#00e676', bg: 'rgba(0,230,118,0.12)',   borde: 'rgba(0,230,118,0.35)' },
  reemplazo:    { label: 'Reemplazo',    color: '#40c4ff', bg: 'rgba(64,196,255,0.12)',  borde: 'rgba(64,196,255,0.35)' },
  stock:        { label: 'Stock',        color: '#ce93d8', bg: 'rgba(206,147,216,0.12)', borde: 'rgba(206,147,216,0.35)' },
  experimental: { label: 'Experimental', color: '#ff9800', bg: 'rgba(255,152,0,0.12)',   borde: 'rgba(255,152,0,0.35)' },
  baja:         { label: 'Baja',         color: '#ff6b80', bg: 'rgba(255,107,128,0.12)', borde: 'rgba(255,107,128,0.35)' },
  fallecido:    { label: 'Fallecido',    color: '#546e7a', bg: 'rgba(84,110,122,0.12)',  borde: 'rgba(84,110,122,0.35)' },
}

export const TIPOS_EVENTO = {
  pcr:                 { label: 'PCR',                     color: '#40c4ff' },
  qpcr:                { label: 'qPCR',                    color: '#40c4ff' },
  serologia:           { label: 'Serología',               color: '#ce93d8' },
  coproparasitologico: { label: 'Coproparasitológico',     color: '#00e676' },
  hemograma:           { label: 'Hemograma',               color: '#ff9800' },
  necropsia:           { label: 'Necropsia',               color: '#ff6b80' },
  cultivo:             { label: 'Cultivo Microbiológico',  color: '#ffb300' },
  evaluacion_clinica:  { label: 'Evaluación Clínica',      color: '#8a9bb0' },
  tratamiento:         { label: 'Tratamiento',             color: '#00e676' },
  vacunacion:          { label: 'Vacunación',              color: '#00e676' },
  desparasitacion:     { label: 'Desparasitación',         color: '#00e676' },
  otro:                { label: 'Otro',                    color: '#8a9bb0' },
}

// ── Demo data ────────────────────────────────────────────────────────────────
const DATOS_INICIALES = {
  animales: [
    { id: 'C-NZ-M-001', sexo: 'macho',  fechaNacimiento: '2025-12-10', origen: 'Bioterio CONICET — Buenos Aires', cepa: 'Nueva Zelanda Blanca', estado: 'reproductor',  padreId: null,         madreId: null,         estadoSanitario: 'ok',        observaciones: 'Reproductor selecto. Excelente performance reproductiva.' },
    { id: 'C-NZ-M-002', sexo: 'macho',  fechaNacimiento: '2025-12-10', origen: 'Bioterio CONICET — Buenos Aires', cepa: 'Nueva Zelanda Blanca', estado: 'reproductor',  padreId: null,         madreId: null,         estadoSanitario: 'ok',        observaciones: '' },
    { id: 'C-NZ-M-003', sexo: 'macho',  fechaNacimiento: '2026-02-20', origen: 'Bioterio CONICET — Buenos Aires', cepa: 'Nueva Zelanda Blanca', estado: 'reemplazo',   padreId: null,         madreId: null,         estadoSanitario: 'ok',        observaciones: 'En evaluación para incorporar a reproducción.' },
    { id: 'C-NZ-M-004', sexo: 'macho',  fechaNacimiento: '2026-04-10', origen: 'Establecimiento El Pampero SA',   cepa: 'Nueva Zelanda Blanca', estado: 'cuarentena',  padreId: null,         madreId: null,         estadoSanitario: 'pendiente', observaciones: 'Lote LOT-2026-06-001. Aguardando resultados PCR.' },
    { id: 'C-NZ-M-005', sexo: 'macho',  fechaNacimiento: '2026-03-07', origen: 'Colonia propia',                  cepa: 'Nueva Zelanda Blanca', estado: 'stock',       padreId: 'C-NZ-M-001', madreId: 'C-NZ-H-001', estadoSanitario: 'ok',        observaciones: 'Nacido CAM-SRV-001.' },
    { id: 'C-NZ-H-001', sexo: 'hembra', fechaNacimiento: '2025-12-10', origen: 'Bioterio CONICET — Buenos Aires', cepa: 'Nueva Zelanda Blanca', estado: 'reproductor',  padreId: null,         madreId: null,         estadoSanitario: 'ok',        observaciones: '' },
    { id: 'C-NZ-H-002', sexo: 'hembra', fechaNacimiento: '2025-12-10', origen: 'Bioterio CONICET — Buenos Aires', cepa: 'Nueva Zelanda Blanca', estado: 'reproductor',  padreId: null,         madreId: null,         estadoSanitario: 'ok',        observaciones: '' },
    { id: 'C-NZ-H-003', sexo: 'hembra', fechaNacimiento: '2026-02-20', origen: 'Bioterio CONICET — Buenos Aires', cepa: 'Nueva Zelanda Blanca', estado: 'reemplazo',   padreId: null,         madreId: null,         estadoSanitario: 'ok',        observaciones: 'En evaluación para reproducción.' },
    { id: 'C-NZ-H-004', sexo: 'hembra', fechaNacimiento: '2026-04-10', origen: 'Establecimiento El Pampero SA',   cepa: 'Nueva Zelanda Blanca', estado: 'cuarentena',  padreId: null,         madreId: null,         estadoSanitario: 'pendiente', observaciones: 'Lote LOT-2026-06-001. Aguardando resultados serológicos.' },
    { id: 'C-NZ-H-005', sexo: 'hembra', fechaNacimiento: '2026-03-07', origen: 'Colonia propia',                  cepa: 'Nueva Zelanda Blanca', estado: 'stock',       padreId: 'C-NZ-M-001', madreId: 'C-NZ-H-001', estadoSanitario: 'ok',        observaciones: 'Nacida CAM-SRV-001.' },
  ],

  ingresos: [
    {
      id: 'ING-001',
      animalesIds: ['C-NZ-M-001', 'C-NZ-M-002', 'C-NZ-M-003', 'C-NZ-H-001', 'C-NZ-H-002', 'C-NZ-H-003'],
      fechaIngreso: '2026-01-08', procedencia: 'Bioterio CONICET — Buenos Aires',
      loteCompra: 'LOT-2026-01-001', documentacion: 'Certificado sanitario SENASA N° 0041-2026',
      responsableRecepcion: 'Dr. González', observaciones: 'Lote completo. Todos los animales en buenas condiciones al arribo.',
    },
    {
      id: 'ING-002',
      animalesIds: ['C-NZ-M-004', 'C-NZ-H-004'],
      fechaIngreso: '2026-06-10', procedencia: 'Establecimiento El Pampero SA',
      loteCompra: 'LOT-2026-06-001', documentacion: 'Remito 00042-00000198. Certificado sanitario pendiente de emisión.',
      responsableRecepcion: 'Lic. Rodríguez', observaciones: 'Lote de reposición. Animales ingresados directamente a cuarentena.',
    },
  ],

  eventosSanitarios: [
    { id: 'EV-001', animalId: 'C-NZ-M-001', fecha: '2026-01-10', tipo: 'evaluacion_clinica', resultado: 'Normal. Sin signos clínicos de enfermedad. Peso: 2,8 kg.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: 'Evaluación post-ingreso.' },
    { id: 'EV-002', animalId: 'C-NZ-M-001', fecha: '2026-01-12', tipo: 'serologia',           resultado: 'Negativo para RHD, RHD-V2, Mixomatosis y Pasteurellosis.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: 'Lab: INTA Castelar. Muestra ID: LAB-2026-01-011.' },
    { id: 'EV-003', animalId: 'C-NZ-M-001', fecha: '2026-01-14', tipo: 'coproparasitologico', resultado: 'Negativo para endoparásitos y ectoparásitos.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-004', animalId: 'C-NZ-M-001', fecha: '2026-01-25', tipo: 'vacunacion',           resultado: 'Administrada vacuna combinada RHD+Mixomatosis. Lote: VAC-2026-003. Sin reacciones adversas.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-005', animalId: 'C-NZ-H-001', fecha: '2026-01-10', tipo: 'evaluacion_clinica', resultado: 'Normal. Peso: 2,6 kg. Sin signos clínicos.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: 'Evaluación post-ingreso.' },
    { id: 'EV-006', animalId: 'C-NZ-H-001', fecha: '2026-01-12', tipo: 'serologia',           resultado: 'Negativo para RHD, RHD-V2, Mixomatosis y Pasteurellosis.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-007', animalId: 'C-NZ-H-001', fecha: '2026-01-25', tipo: 'vacunacion',           resultado: 'Administrada vacuna combinada RHD+Mixomatosis. Lote: VAC-2026-003.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-008', animalId: 'C-NZ-M-002', fecha: '2026-01-10', tipo: 'evaluacion_clinica', resultado: 'Normal. Peso: 2,9 kg.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-009', animalId: 'C-NZ-M-002', fecha: '2026-01-12', tipo: 'serologia',           resultado: 'Negativo para RHD, Mixomatosis, Pasteurellosis.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-010', animalId: 'C-NZ-H-002', fecha: '2026-01-10', tipo: 'evaluacion_clinica', resultado: 'Normal. Peso: 2,7 kg.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-011', animalId: 'C-NZ-H-002', fecha: '2026-01-12', tipo: 'serologia',           resultado: 'Negativo para RHD, Mixomatosis, Pasteurellosis.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-012', animalId: 'C-NZ-H-002', fecha: '2026-01-25', tipo: 'vacunacion',           resultado: 'Administrada vacuna combinada RHD+Mixomatosis. Lote: VAC-2026-003.', profesionalResponsable: 'Dr. González', archivos: [], observaciones: '' },
    { id: 'EV-013', animalId: 'C-NZ-M-004', fecha: '2026-06-11', tipo: 'evaluacion_clinica', resultado: 'Aparente buen estado general. Peso: 2,1 kg.', profesionalResponsable: 'Lic. Rodríguez', archivos: [], observaciones: 'Evaluación inicial de ingreso.' },
    { id: 'EV-014', animalId: 'C-NZ-M-004', fecha: '2026-06-11', tipo: 'pcr',                 resultado: 'PENDIENTE — Muestra enviada. Resultado estimado: 2026-06-25. ID muestra: LAB-2026-06-041.', profesionalResponsable: 'Lic. Rodríguez', archivos: [], observaciones: 'PCR para RHD2 y RHDV.' },
    { id: 'EV-015', animalId: 'C-NZ-H-004', fecha: '2026-06-11', tipo: 'evaluacion_clinica', resultado: 'Sin signos clínicos evidentes. Peso: 2,0 kg.', profesionalResponsable: 'Lic. Rodríguez', archivos: [], observaciones: '' },
    { id: 'EV-016', animalId: 'C-NZ-H-004', fecha: '2026-06-11', tipo: 'serologia',           resultado: 'PENDIENTE — Muestra enviada. Laboratorio: INTA Castelar. Resultado estimado: 2026-06-28.', profesionalResponsable: 'Lic. Rodríguez', archivos: [], observaciones: 'Panel: RHD, RHD-V2, Mixomatosis, Pasteurellosis.' },
    { id: 'EV-017', animalId: 'C-NZ-M-001', fecha: '2026-04-01', tipo: 'evaluacion_clinica', resultado: 'Normal. Peso: 3,1 kg. Condición corporal excelente.', profesionalResponsable: 'Dra. López', archivos: [], observaciones: 'Control anual.' },
    { id: 'EV-018', animalId: 'C-NZ-H-002', fecha: '2026-06-15', tipo: 'evaluacion_clinica', resultado: 'Palpación positiva confirmada. Gestación en curso, día 26 aprox.', profesionalResponsable: 'Dra. López', archivos: [], observaciones: 'Control pre-parto. Parto inminente.' },
  ],

  decisiones: [
    { id: 'DEC-001', animalId: 'C-NZ-M-001', fecha: '2026-01-28', decision: 'aprobado', responsable: 'Dr. González', motivo: 'Todos los controles sanitarios negativos. Animal apto para colonia reproductiva.' },
    { id: 'DEC-002', animalId: 'C-NZ-M-002', fecha: '2026-01-28', decision: 'aprobado', responsable: 'Dr. González', motivo: 'Controles sanitarios negativos.' },
    { id: 'DEC-003', animalId: 'C-NZ-M-003', fecha: '2026-01-28', decision: 'aprobado', responsable: 'Dr. González', motivo: 'Controles ok. Incorporado como reemplazo.' },
    { id: 'DEC-004', animalId: 'C-NZ-H-001', fecha: '2026-01-28', decision: 'aprobado', responsable: 'Dr. González', motivo: 'Controles sanitarios negativos. Apta para reproducción.' },
    { id: 'DEC-005', animalId: 'C-NZ-H-002', fecha: '2026-01-28', decision: 'aprobado', responsable: 'Dr. González', motivo: 'Controles ok.' },
    { id: 'DEC-006', animalId: 'C-NZ-H-003', fecha: '2026-01-28', decision: 'aprobado', responsable: 'Dr. González', motivo: 'Controles ok. Incorporada como reemplazo.' },
  ],

  servicios: [
    {
      id: 'SRV-001', machoId: 'C-NZ-M-001', hembraId: 'C-NZ-H-001',
      deteccionCelo: '2026-02-05', fechaServicio: '2026-02-05',
      confirmacionPrenez: { fecha: '2026-02-20', resultado: 'positivo', metodo: 'Palpación abdominal' },
      fechaPartoProbable: '2026-03-08', fechaPartoReal: '2026-03-07',
      nacidos: { total: 8, vivos: 8, muertos: 0 },
      destete: { fecha: '2026-04-04', destetados: 7, machos: 3, hembras: 4 },
      observaciones: 'Parto normal. Todos los gazapos sanos. Un fallecido semana 2 por aplastamiento.',
    },
    {
      id: 'SRV-002', machoId: 'C-NZ-M-002', hembraId: 'C-NZ-H-002',
      deteccionCelo: '2026-02-10', fechaServicio: '2026-02-10',
      confirmacionPrenez: { fecha: '2026-02-25', resultado: 'positivo', metodo: 'Palpación abdominal' },
      fechaPartoProbable: '2026-03-13', fechaPartoReal: '2026-03-14',
      nacidos: { total: 9, vivos: 9, muertos: 0 },
      destete: { fecha: '2026-04-11', destetados: 8, machos: 4, hembras: 4 },
      observaciones: 'Sin novedades. Camada uniforme.',
    },
    {
      id: 'SRV-003', machoId: 'C-NZ-M-001', hembraId: 'C-NZ-H-001',
      deteccionCelo: '2026-04-15', fechaServicio: '2026-04-15',
      confirmacionPrenez: { fecha: '2026-04-30', resultado: 'positivo', metodo: 'Palpación abdominal' },
      fechaPartoProbable: '2026-05-16', fechaPartoReal: '2026-05-17',
      nacidos: { total: 7, vivos: 7, muertos: 0 },
      destete: { fecha: '2026-06-14', destetados: 6, machos: 3, hembras: 3 },
      observaciones: 'Un gazapo perdido en la primera semana por debilidad congénita.',
    },
    {
      id: 'SRV-004', machoId: 'C-NZ-M-002', hembraId: 'C-NZ-H-002',
      deteccionCelo: '2026-05-20', fechaServicio: '2026-05-20',
      confirmacionPrenez: { fecha: '2026-06-04', resultado: 'positivo', metodo: 'Palpación abdominal' },
      fechaPartoProbable: '2026-06-20', fechaPartoReal: null,
      nacidos: null, destete: null,
      observaciones: 'Parto inminente. Control diario.',
    },
    {
      id: 'SRV-005', machoId: 'C-NZ-M-001', hembraId: 'C-NZ-H-002',
      deteccionCelo: '2026-06-10', fechaServicio: '2026-06-10',
      confirmacionPrenez: null,
      fechaPartoProbable: '2026-07-11', fechaPartoReal: null,
      nacidos: null, destete: null,
      observaciones: 'Confirmación de preñez pendiente. Programar palpación el 2026-06-25.',
    },
  ],

  auditoria: [
    { id: 'AUD-001', entidadTipo: 'animal', entidadId: 'C-NZ-M-001', fecha: '2026-01-08T09:15:00', usuario: 'Dr. González',   accion: 'crear',         campo: 'estado', valorAnterior: null,           valorNuevo: 'cuarentena'  },
    { id: 'AUD-002', entidadTipo: 'animal', entidadId: 'C-NZ-M-001', fecha: '2026-01-28T14:30:00', usuario: 'Dr. González',   accion: 'cambio_estado', campo: 'estado', valorAnterior: 'cuarentena',   valorNuevo: 'reproductor' },
    { id: 'AUD-003', entidadTipo: 'animal', entidadId: 'C-NZ-H-001', fecha: '2026-01-08T09:15:00', usuario: 'Dr. González',   accion: 'crear',         campo: 'estado', valorAnterior: null,           valorNuevo: 'cuarentena'  },
    { id: 'AUD-004', entidadTipo: 'animal', entidadId: 'C-NZ-H-001', fecha: '2026-01-28T14:30:00', usuario: 'Dr. González',   accion: 'cambio_estado', campo: 'estado', valorAnterior: 'cuarentena',   valorNuevo: 'reproductor' },
    { id: 'AUD-005', entidadTipo: 'animal', entidadId: 'C-NZ-M-002', fecha: '2026-01-08T09:15:00', usuario: 'Dr. González',   accion: 'crear',         campo: 'estado', valorAnterior: null,           valorNuevo: 'cuarentena'  },
    { id: 'AUD-006', entidadTipo: 'animal', entidadId: 'C-NZ-M-002', fecha: '2026-01-28T14:30:00', usuario: 'Dr. González',   accion: 'cambio_estado', campo: 'estado', valorAnterior: 'cuarentena',   valorNuevo: 'reproductor' },
    { id: 'AUD-007', entidadTipo: 'animal', entidadId: 'C-NZ-H-002', fecha: '2026-01-08T09:15:00', usuario: 'Dr. González',   accion: 'crear',         campo: 'estado', valorAnterior: null,           valorNuevo: 'cuarentena'  },
    { id: 'AUD-008', entidadTipo: 'animal', entidadId: 'C-NZ-H-002', fecha: '2026-01-28T14:30:00', usuario: 'Dr. González',   accion: 'cambio_estado', campo: 'estado', valorAnterior: 'cuarentena',   valorNuevo: 'reproductor' },
    { id: 'AUD-009', entidadTipo: 'servicio', entidadId: 'SRV-001',  fecha: '2026-02-05T10:00:00', usuario: 'Dra. López',     accion: 'crear',         campo: null,     valorAnterior: null,           valorNuevo: 'Servicio registrado' },
    { id: 'AUD-010', entidadTipo: 'servicio', entidadId: 'SRV-002',  fecha: '2026-02-10T11:00:00', usuario: 'Dra. López',     accion: 'crear',         campo: null,     valorAnterior: null,           valorNuevo: 'Servicio registrado' },
    { id: 'AUD-011', entidadTipo: 'animal', entidadId: 'C-NZ-M-004', fecha: '2026-06-10T16:00:00', usuario: 'Lic. Rodríguez', accion: 'crear',         campo: 'estado', valorAnterior: null,           valorNuevo: 'cuarentena'  },
    { id: 'AUD-012', entidadTipo: 'animal', entidadId: 'C-NZ-H-004', fecha: '2026-06-10T16:00:00', usuario: 'Lic. Rodríguez', accion: 'crear',         campo: 'estado', valorAnterior: null,           valorNuevo: 'cuarentena'  },
  ],
}

// ── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  const ts = new Date().toISOString()
  switch (action.type) {

    case 'REGISTRAR_INGRESO': {
      const { ingreso, animales } = action
      const audEntries = animales.map((a, i) => ({
        id: `AUD-${Date.now()}-${i}`, entidadTipo: 'animal', entidadId: a.id,
        fecha: ts, usuario: ingreso.responsableRecepcion,
        accion: 'crear', campo: 'estado', valorAnterior: null, valorNuevo: 'cuarentena',
      }))
      return {
        ...state,
        animales:  [...state.animales,  ...animales],
        ingresos:  [...state.ingresos,  ingreso],
        auditoria: [...state.auditoria, ...audEntries],
      }
    }

    case 'REGISTRAR_EVENTO_SANITARIO': {
      const { evento } = action
      return {
        ...state,
        eventosSanitarios: [...state.eventosSanitarios, evento],
        auditoria: [...state.auditoria, {
          id: `AUD-${Date.now()}`, entidadTipo: 'evento_sanitario', entidadId: evento.id,
          fecha: ts, usuario: evento.profesionalResponsable,
          accion: 'crear', campo: 'tipo', valorAnterior: null, valorNuevo: evento.tipo,
        }],
      }
    }

    case 'TOMAR_DECISION_CUARENTENA': {
      const { animalId, decision, responsable, motivo } = action
      const estadoPrev = state.animales.find(a => a.id === animalId)?.estado ?? 'cuarentena'
      const nuevoEstado = decision === 'aprobado' ? 'reproductor' : decision === 'rechazado' ? 'baja' : 'cuarentena'
      return {
        ...state,
        animales:  state.animales.map(a => a.id === animalId ? { ...a, estado: nuevoEstado } : a),
        decisiones: [...state.decisiones, {
          id: `DEC-${Date.now()}`, animalId, fecha: ts.split('T')[0], decision, responsable, motivo,
        }],
        auditoria: [...state.auditoria, {
          id: `AUD-${Date.now()}`, entidadTipo: 'animal', entidadId: animalId,
          fecha: ts, usuario: responsable,
          accion: 'cambio_estado', campo: 'estado', valorAnterior: estadoPrev, valorNuevo: nuevoEstado,
        }],
      }
    }

    case 'REGISTRAR_SERVICIO': {
      const { servicio } = action
      return {
        ...state,
        servicios: [...state.servicios, servicio],
        auditoria: [...state.auditoria, {
          id: `AUD-${Date.now()}`, entidadTipo: 'servicio', entidadId: servicio.id,
          fecha: ts, usuario: 'Sistema',
          accion: 'crear', campo: null, valorAnterior: null, valorNuevo: 'Servicio registrado',
        }],
      }
    }

    case 'ACTUALIZAR_SERVICIO': {
      const { servicioId, cambios, usuario } = action
      return {
        ...state,
        servicios: state.servicios.map(s => s.id === servicioId ? { ...s, ...cambios } : s),
        auditoria: [...state.auditoria, {
          id: `AUD-${Date.now()}`, entidadTipo: 'servicio', entidadId: servicioId,
          fecha: ts, usuario: usuario ?? 'Sistema',
          accion: 'modificar', campo: Object.keys(cambios).join(', '),
          valorAnterior: null, valorNuevo: JSON.stringify(cambios),
        }],
      }
    }

    case 'CAMBIAR_ESTADO_ANIMAL': {
      const { animalId, nuevoEstado, usuario } = action
      const estadoPrev = state.animales.find(a => a.id === animalId)?.estado
      return {
        ...state,
        animales: state.animales.map(a => a.id === animalId ? { ...a, estado: nuevoEstado } : a),
        auditoria: [...state.auditoria, {
          id: `AUD-${Date.now()}`, entidadTipo: 'animal', entidadId: animalId,
          fecha: ts, usuario: usuario ?? 'Sistema',
          accion: 'cambio_estado', campo: 'estado',
          valorAnterior: estadoPrev ?? null, valorNuevo: nuevoEstado,
        }],
      }
    }

    default: return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
const ConejoContext = createContext()

export function ConejoProvider({ children }) {
  const [datos, dispatch] = useReducer(reducer, DATOS_INICIALES)

  function registrarIngreso(ingreso, animales)                              { dispatch({ type: 'REGISTRAR_INGRESO',            ingreso, animales }) }
  function registrarEventoSanitario(evento)                                 { dispatch({ type: 'REGISTRAR_EVENTO_SANITARIO',   evento }) }
  function tomarDecisionCuarentena(animalId, decision, responsable, motivo){ dispatch({ type: 'TOMAR_DECISION_CUARENTENA',    animalId, decision, responsable, motivo }) }
  function registrarServicio(servicio)                                      { dispatch({ type: 'REGISTRAR_SERVICIO',           servicio }) }
  function actualizarServicio(servicioId, cambios, usuario)                 { dispatch({ type: 'ACTUALIZAR_SERVICIO',          servicioId, cambios, usuario }) }
  function cambiarEstadoAnimal(animalId, nuevoEstado, usuario)              { dispatch({ type: 'CAMBIAR_ESTADO_ANIMAL',        animalId, nuevoEstado, usuario }) }

  return (
    <ConejoContext.Provider value={{
      datos,
      registrarIngreso, registrarEventoSanitario,
      tomarDecisionCuarentena, registrarServicio,
      actualizarServicio, cambiarEstadoAnimal,
    }}>
      {children}
    </ConejoContext.Provider>
  )
}

export function useConejo() { return useContext(ConejoContext) }
