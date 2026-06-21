import { ESTADOS_ANIMAL, TIPOS_EVENTO } from '../../context/ConejoContext'

function fmt(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

function calcEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '—'
  const hoy = new Date()
  const nac = new Date(fechaNacimiento + 'T00:00:00')
  const meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + hoy.getMonth() - nac.getMonth()
  if (meses < 1) { const dias = Math.floor((hoy - nac) / 86400000); return `${dias} días` }
  if (meses < 12) return `${meses} meses`
  const a = Math.floor(meses / 12); const mr = meses % 12
  return `${a} año${a > 1 ? 's' : ''}${mr > 0 ? ` ${mr} m.` : ''}`
}

export function generarFichaPDF(animal, todos, eventos, servicios, auditoria, decisiones, ingresos) {
  const eventosPropios  = eventos.filter(e => e.animalId === animal.id).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const serviciosMacho  = servicios.filter(s => s.machoId === animal.id)
  const serviciosHembra = servicios.filter(s => s.hembraId === animal.id)
  const serviciosTotal  = animal.sexo === 'macho' ? serviciosMacho : serviciosHembra
  const decisionesAnimal = decisiones.filter(d => d.animalId === animal.id)
  const ingresoAnimal   = ingresos.find(i => i.animalesIds.includes(animal.id))
  const auditoriaAnimal = auditoria.filter(a => a.entidadId === animal.id).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const padre = animal.padreId ? todos.find(a => a.id === animal.padreId) : null
  const madre = animal.madreId ? todos.find(a => a.id === animal.madreId) : null
  const descendencia = todos.filter(a => a.padreId === animal.id || a.madreId === animal.id)
  const estado = ESTADOS_ANIMAL[animal.estado]

  const partos = serviciosHembra.filter(s => s.fechaPartoReal)
  const totalNacidos = partos.reduce((s, sv) => s + (sv.nacidos?.vivos ?? 0), 0)
  const totalDestetados = partos.filter(s => s.destete).reduce((s, sv) => s + (sv.destete?.destetados ?? 0), 0)
  const promCamada = partos.length > 0 ? (totalNacidos / partos.length).toFixed(1) : '—'

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ficha ${animal.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; padding: 20px; }
    h1 { font-size: 18px; font-weight: 800; color: #b8860b; margin-bottom: 2px; }
    h2 { font-size: 13px; font-weight: 700; color: #555; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1.5px solid #e0e0e0; text-transform: uppercase; letter-spacing: .05em; }
    h3 { font-size: 11px; font-weight: 700; margin-bottom: 6px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #b8860b; }
    .header-left .sub { font-size: 10px; color: #777; margin-top: 2px; }
    .header-right { text-align: right; font-size: 10px; color: #777; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; border: 1px solid; }
    .section { margin-bottom: 16px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 16px; }
    .field { margin-bottom: 5px; }
    .field-label { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: #999; font-weight: 700; }
    .field-value { font-size: 11px; color: #1a1a1a; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th { background: #f5f5f0; font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #777; font-weight: 700; padding: 5px 8px; text-align: left; border-bottom: 1px solid #ddd; }
    td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; font-size: 10px; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0; }
    .kpi-box { background: #f9f9f6; border: 1px solid #e5e5e0; border-radius: 6px; padding: 8px; text-align: center; }
    .kpi-val { font-size: 18px; font-weight: 800; color: #b8860b; }
    .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-top: 2px; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e0e0e0; font-size: 9px; color: #999; display: flex; justify-content: space-between; }
    .obs { font-size: 10px; color: #444; font-style: italic; background: #f9f9f6; border-left: 3px solid #b8860b; padding: 6px 10px; border-radius: 0 4px 4px 0; margin-top: 4px; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>🐇 FICHA INDIVIDUAL — ${animal.id}</h1>
    <div class="sub">ICIVET — Sistema de gestión de colonias · EasyVet</div>
    <div class="sub" style="margin-top:4px">
      <span class="badge" style="background:${estado.bg};border-color:${estado.borde};color:${estado.color}">
        ${estado.label.toUpperCase()}
      </span>
    </div>
  </div>
  <div class="header-right">
    <div style="font-weight:700;font-size:12px">${animal.cepa}</div>
    <div><em>Oryctolagus cuniculus</em></div>
    <div style="margin-top:6px">Generado: ${fmt(new Date().toISOString())}</div>
  </div>
</div>

<div class="section">
  <h2>Datos Generales</h2>
  <div class="grid3">
    <div class="field"><div class="field-label">Identificador</div><div class="field-value" style="font-weight:800">${animal.id}</div></div>
    <div class="field"><div class="field-label">Sexo</div><div class="field-value">${animal.sexo === 'macho' ? 'Macho (♂)' : 'Hembra (♀)'}</div></div>
    <div class="field"><div class="field-label">Fecha de Nacimiento</div><div class="field-value">${fmt(animal.fechaNacimiento)}</div></div>
    <div class="field"><div class="field-label">Edad</div><div class="field-value">${calcEdad(animal.fechaNacimiento)}</div></div>
    <div class="field"><div class="field-label">Cepa / Línea Genética</div><div class="field-value">${animal.cepa}</div></div>
    <div class="field"><div class="field-label">Origen</div><div class="field-value">${animal.origen}</div></div>
    <div class="field"><div class="field-label">Estado Sanitario</div><div class="field-value">${animal.estadoSanitario}</div></div>
    ${ingresoAnimal ? `<div class="field"><div class="field-label">Fecha de Ingreso</div><div class="field-value">${fmt(ingresoAnimal.fechaIngreso)}</div></div>` : ''}
    ${ingresoAnimal ? `<div class="field"><div class="field-label">Lote de Compra</div><div class="field-value">${ingresoAnimal.loteCompra}</div></div>` : ''}
  </div>
  ${animal.observaciones ? `<div class="obs">${animal.observaciones}</div>` : ''}
</div>

<div class="section">
  <h2>Genealogía</h2>
  <div class="grid3">
    <div class="field"><div class="field-label">Padre</div><div class="field-value">${padre ? padre.id : '—'}</div></div>
    <div class="field"><div class="field-label">Madre</div><div class="field-value">${madre ? madre.id : '—'}</div></div>
    <div class="field"><div class="field-label">Descendencia registrada</div><div class="field-value">${descendencia.length > 0 ? descendencia.map(d => d.id).join(', ') : '—'}</div></div>
  </div>
</div>

${serviciosTotal.length > 0 ? `
<div class="section">
  <h2>Información Productiva</h2>
  ${animal.sexo === 'hembra' ? `
  <div class="kpi-row">
    <div class="kpi-box"><div class="kpi-val">${serviciosHembra.length}</div><div class="kpi-label">Servicios</div></div>
    <div class="kpi-box"><div class="kpi-val">${partos.length}</div><div class="kpi-label">Partos</div></div>
    <div class="kpi-box"><div class="kpi-val">${totalNacidos}</div><div class="kpi-label">Nacidos Vivos</div></div>
    <div class="kpi-box"><div class="kpi-val">${totalDestetados}</div><div class="kpi-label">Destetados</div></div>
  </div>
  <div class="grid2" style="margin-bottom:8px">
    <div class="field"><div class="field-label">Promedio de camada</div><div class="field-value">${promCamada}</div></div>
    <div class="field"><div class="field-label">Tasa de destete</div><div class="field-value">${totalNacidos > 0 ? ((totalDestetados / totalNacidos) * 100).toFixed(1) + '%' : '—'}</div></div>
  </div>` : `
  <div class="kpi-row">
    <div class="kpi-box"><div class="kpi-val">${serviciosMacho.length}</div><div class="kpi-label">Servicios</div></div>
    <div class="kpi-box"><div class="kpi-val">${serviciosMacho.filter(s => s.confirmacionPrenez?.resultado === 'positivo').length}</div><div class="kpi-label">Preñeces conf.</div></div>
    <div class="kpi-box"><div class="kpi-val">${serviciosMacho.filter(s => s.fechaPartoReal).length}</div><div class="kpi-label">Partos</div></div>
    <div class="kpi-box"><div class="kpi-val">${serviciosMacho.reduce((s, sv) => s + (sv.nacidos?.vivos ?? 0), 0)}</div><div class="kpi-label">Cría total</div></div>
  </div>`}
  <table>
    <thead><tr>
      <th>ID Servicio</th><th>${animal.sexo === 'macho' ? 'Hembra' : 'Macho'}</th>
      <th>Fecha Servicio</th><th>Preñez</th><th>Fecha Parto</th><th>Nacidos</th><th>Destetados</th>
    </tr></thead>
    <tbody>
      ${serviciosTotal.map(s => `<tr>
        <td>${s.id}</td>
        <td>${animal.sexo === 'macho' ? s.hembraId : s.machoId}</td>
        <td>${fmt(s.fechaServicio)}</td>
        <td>${s.confirmacionPrenez ? s.confirmacionPrenez.resultado : 'Pendiente'}</td>
        <td>${fmt(s.fechaPartoReal)}</td>
        <td>${s.nacidos ? s.nacidos.vivos : '—'}</td>
        <td>${s.destete ? s.destete.destetados : '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

<div class="section">
  <h2>Historia Sanitaria</h2>
  ${eventosPropios.length === 0 ? '<p style="color:#999;font-style:italic">Sin eventos registrados.</p>' : `
  <table>
    <thead><tr><th>Fecha</th><th>Tipo</th><th>Resultado</th><th>Profesional</th><th>Observaciones</th></tr></thead>
    <tbody>
      ${eventosPropios.map(ev => `<tr>
        <td style="white-space:nowrap">${fmt(ev.fecha)}</td>
        <td><strong>${TIPOS_EVENTO[ev.tipo]?.label ?? ev.tipo}</strong></td>
        <td>${ev.resultado}</td>
        <td>${ev.profesionalResponsable}</td>
        <td>${ev.observaciones || '—'}</td>
      </tr>`).join('')}
    </tbody>
  </table>`}
</div>

${decisionesAnimal.length > 0 ? `
<div class="section">
  <h2>Decisiones de Cuarentena</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Decisión</th><th>Responsable</th><th>Motivo</th></tr></thead>
    <tbody>
      ${decisionesAnimal.map(d => `<tr>
        <td>${fmt(d.fecha)}</td>
        <td><strong>${d.decision.toUpperCase()}</strong></td>
        <td>${d.responsable}</td>
        <td>${d.motivo}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

<div class="section">
  <h2>Movimientos y Auditoría</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Acción</th><th>Campo</th><th>Valor anterior</th><th>Valor nuevo</th><th>Usuario</th></tr></thead>
    <tbody>
      ${auditoriaAnimal.map(a => `<tr>
        <td style="white-space:nowrap">${a.fecha.replace('T', ' ').slice(0, 16)}</td>
        <td>${a.accion}</td>
        <td>${a.campo ?? '—'}</td>
        <td>${a.valorAnterior ?? '—'}</td>
        <td>${a.valorNuevo ?? '—'}</td>
        <td>${a.usuario}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>

<div class="footer">
  <span>ICIVET — Ficha individual generada automáticamente · EasyVet por ITeRatE</span>
  <span>Documento generado el ${new Date().toLocaleString('es-AR')} · No válido como certificado sanitario oficial</span>
</div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=750')
  if (!win) { alert('Activá las ventanas emergentes para generar el PDF.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 600)
}
