import { getNombreAnimal } from '../context/ICIVETContext'

// Cada colonia (un sector de una especie) se organiza físicamente en 3 racks
// ventilados. Las jaulas ya existentes en la maqueta se reparten de forma
// equilibrada entre los racks.
export const NUM_RACKS = 3

export const SECTOR_LABEL = {
  fundacion:  'Colonia de Fundación',
  produccion: 'Colonia de Producción',
  stock:      'Colonia de Stock',
}

// ── Derivación de jaulas normalizadas por sector ──────────────────────────────
// Devuelve una lista uniforme de jaulas, independientemente de cómo esté
// modelado cada sector. Cada jaula expone los animales alojados con la
// información necesaria para abrir su ficha individual cuando corresponda.
function derivarJaulas(sector, datos) {
  if (!datos) return []

  if (sector === 'fundacion') {
    return (datos.parejas ?? []).map(p => {
      const camadaIds = (datos.camadas ?? [])
        .filter(c => c.pareja === p.id)
        .map(c => c.id)
      const crias = (datos.animales ?? []).filter(a => camadaIds.includes(a.camadaId))
      const animales = [
        { key: p.machoId,  nombre: getNombreAnimal(p.machoId, datos),  sexo: 'macho',  rol: 'Reproductor',  fichaId: p.machoId },
        { key: p.hembraId, nombre: getNombreAnimal(p.hembraId, datos), sexo: 'hembra', rol: 'Reproductora', fichaId: p.hembraId },
        ...crias.map(a => ({
          key: a.id, nombre: getNombreAnimal(a.id, datos), sexo: a.sexo, rol: 'Cría', fichaId: a.id,
        })),
      ]
      return {
        id: p.id, codigo: p.id, tipo: 'Jaula reproductiva',
        subtitulo: `${getNombreAnimal(p.machoId, datos)} × ${getNombreAnimal(p.hembraId, datos)}`,
        estado: p.estado === 'activo' ? 'activo' : 'inactivo',
        animales, totalAlojados: animales.length,
      }
    })
  }

  if (sector === 'produccion') {
    const camadas = datos.produccion?.camadas ?? []
    return (datos.produccion?.jaulas ?? []).map(j => {
      const camsJaula = camadas.filter(c => c.jaulaId === j.id)
      // Crías aún alojadas: las de camadas que todavía no se dispersaron a Stock.
      const criasVivas = camsJaula
        .filter(c => !c.seleccion)
        .reduce((acc, c) => acc + (c.cantidadNacida ?? 0), 0)
      const reproductores = [
        { key: j.machoId, nombre: getNombreAnimal(j.machoId, datos), sexo: 'macho', rol: 'Reproductor', fichaId: j.machoId },
        ...j.hembraIds.map(h => ({
          key: h, nombre: getNombreAnimal(h, datos), sexo: 'hembra', rol: 'Reproductora', fichaId: h,
        })),
      ]
      const camadasEntries = camsJaula.map(c => ({
        key: c.id,
        nombre: `${c.codigo} · ${c.cantidadNacida} crías`,
        sexo: 'cria',
        rol: c.seleccion ? 'Camada dispersada' : c.destete ? 'Camada destetada' : 'Camada en lactancia',
        fichaId: null,
      }))
      return {
        id: j.id, codigo: j.codigo, tipo: 'Jaula reproductiva',
        subtitulo: `♂ ${getNombreAnimal(j.machoId, datos)} · ${j.hembraIds.length} hembra${j.hembraIds.length !== 1 ? 's' : ''}`,
        estado: j.estado === 'activo' ? 'activo' : 'inactivo',
        animales: [...reproductores, ...camadasEntries],
        totalAlojados: reproductores.length + criasVivas,
      }
    })
  }

  if (sector === 'stock') {
    const eventos = datos.historialEventos ?? []
    return (datos.stock?.jaulas ?? []).map(j => {
      // Animales de stock con ficha individual: los que mencionan esta jaula
      // en su historial de eventos.
      const trackeados = (datos.animales ?? []).filter(a =>
        eventos.some(e => e.animalId === a.id && (e.descripcion ?? '').includes(j.id))
      )
      const animales = trackeados.map(a => ({
        key: a.id, nombre: getNombreAnimal(a.id, datos), sexo: a.sexo, rol: 'Ejemplar de stock', fichaId: a.id,
      }))
      const sinFicha = Math.max(0, j.cantidadActual - trackeados.length)
      if (sinFicha > 0) {
        const sexoLabel = j.sexo === 'macho' ? 'macho' : 'hembra'
        animales.push({
          key: `${j.id}-resto`,
          nombre: `${sinFicha} ${sexoLabel}${sinFicha !== 1 ? 's' : ''} sin ficha individual`,
          sexo: j.sexo, rol: 'Stock (conteo)', fichaId: null,
        })
      }
      return {
        id: j.id, codigo: j.codigo, tipo: 'Jaula de stock',
        subtitulo: `${j.sexo === 'macho' ? '♂ Machos' : '♀ Hembras'} · ${j.cantidadActual} alojado${j.cantidadActual !== 1 ? 's' : ''}`,
        estado: j.cantidadActual > 0 ? 'activo' : 'vacia',
        animales, totalAlojados: Math.max(j.cantidadActual, trackeados.length),
      }
    })
  }

  return []
}

// ── Distribución en racks ─────────────────────────────────────────────────────
export function derivarRacks(sector, datos) {
  const jaulas = derivarJaulas(sector, datos)
  const racks = Array.from({ length: NUM_RACKS }, (_, i) => ({
    id: `rack-${sector}-${i + 1}`,
    numero: i + 1,
    nombre: `Rack ${i + 1}`,
    jaulas: [],
  }))
  // Reparto equilibrado round-robin entre los 3 racks.
  jaulas.forEach((jaula, idx) => {
    racks[idx % NUM_RACKS].jaulas.push(jaula)
  })
  racks.forEach(r => {
    r.totalJaulas = r.jaulas.length
    r.totalAnimales = r.jaulas.reduce((acc, j) => acc + j.totalAlojados, 0)
  })
  return racks
}
