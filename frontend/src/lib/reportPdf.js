/**
 * Generates a printable pre-flight medical report from the temporary frontend
 * sample data. Swap this module for a backend-provided PDF URL later.
 */

const sanitize = (value = '') =>
  String(value)
    .replace(/SpO₂/g, 'SpO2')
    .replace(/×/g, 'x')
    .replace(/[–—]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/µ/g, 'u')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/−/g, '-')
    .replace(/°/g, ' deg ')
    .replace(/\s+/g, ' ')
    .trim()

export async function downloadPreFlightReportPdf(astronaut) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 42
  const contentWidth = pageWidth - margin * 2
  const report = astronaut.preFlight

  const colors = {
    navy: [7, 16, 29],
    cyan: [34, 211, 238],
    blue: [14, 116, 144],
    ink: [31, 41, 55],
    muted: [100, 116, 139],
    line: [214, 223, 235],
    soft: [241, 247, 252],
    amber: [161, 98, 7],
    white: [255, 255, 255],
  }

  let y = 0

  const footerOnAllPages = () => {
    const pages = doc.internal.getNumberOfPages()
    for (let page = 1; page <= pages; page += 1) {
      doc.setPage(page)
      doc.setDrawColor(...colors.line)
      doc.setLineWidth(0.5)
      doc.line(margin, pageHeight - 42, pageWidth - margin, pageHeight - 42)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...colors.muted)
      doc.text(
        'SAMPLE DEMONSTRATION DATA - NOT AN ACTUAL MEDICAL RECORD',
        margin,
        pageHeight - 28,
      )
      doc.text(`AstroGuardian | ${astronaut.id} | Page ${page} of ${pages}`, pageWidth - margin, pageHeight - 28, {
        align: 'right',
      })
    }
  }

  const continuationHeader = () => {
    doc.setFillColor(...colors.navy)
    doc.rect(0, 0, pageWidth, 44, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...colors.white)
    doc.text('ASTROGUARDIAN  /  PRE-FLIGHT MEDICAL EXAMINATION', margin, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(148, 190, 215)
    doc.text(`${sanitize(astronaut.name)} | ${astronaut.id} | ${sanitize(report.reportId)}`, margin, 32)
    y = 62
  }

  const newPage = () => {
    doc.addPage()
    continuationHeader()
  }

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 66) newPage()
  }

  const sectionTitle = (title) => {
    ensureSpace(38)
    doc.setFillColor(...colors.soft)
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F')
    doc.setFillColor(...colors.cyan)
    doc.rect(margin, y, 3, 22, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...colors.blue)
    doc.text(title.toUpperCase(), margin + 11, y + 14.5)
    y += 31
  }

  const field = (label, value) => {
    const text = sanitize(value) || 'Not recorded'
    const labelWidth = 140
    const lines = doc.splitTextToSize(text, contentWidth - labelWidth - 10)
    ensureSpace(lines.length * 10.5 + 8)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(...colors.muted)
    doc.text(label.toUpperCase(), margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.4)
    doc.setTextColor(...colors.ink)
    doc.text(lines, margin + labelWidth, y)
    y += Math.max(lines.length, 1) * 10.5 + 5
  }

  const noteBox = (text) => {
    const lines = doc.splitTextToSize(sanitize(text), contentWidth - 22)
    const boxHeight = lines.length * 10.2 + 16
    ensureSpace(boxHeight + 8)
    doc.setDrawColor(...colors.line)
    doc.setFillColor(250, 252, 255)
    doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...colors.ink)
    doc.text(lines, margin + 11, y + 13)
    y += boxHeight + 10
  }

  /* ---------- Cover header ---------- */
  doc.setFillColor(...colors.navy)
  doc.rect(0, 0, pageWidth, 132, 'F')
  doc.setFillColor(...colors.cyan)
  doc.rect(0, 130, pageWidth, 2, 'F')
  doc.setDrawColor(31, 82, 104)
  doc.setLineWidth(0.7)
  doc.roundedRect(margin, 23, 128, 22, 4, 4, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...colors.cyan)
  doc.text('ASTROGUARDIAN MEDICAL', margin + 10, 37)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...colors.white)
  doc.text('PRE-FLIGHT MEDICAL EXAMINATION', margin, 75)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(156, 190, 214)
  doc.text('Crew certification record  /  Mars Exploration Mission', margin, 92)

  doc.setFillColor(120, 80, 10)
  doc.roundedRect(pageWidth - margin - 122, 25, 122, 24, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(255, 224, 138)
  doc.text('SAMPLE DEMONSTRATION DATA', pageWidth - margin - 61, 40, { align: 'center' })

  doc.setFontSize(7)
  doc.setTextColor(148, 190, 215)
  doc.text(`Report ${sanitize(report.reportId)}`, pageWidth - margin, 69, { align: 'right' })
  doc.text(`Examination date ${sanitize(report.examinationDate)}`, pageWidth - margin, 81, {
    align: 'right',
  })
  doc.text('Status: Final / cleared', pageWidth - margin, 93, { align: 'right' })
  y = 156

  /* ---------- Personal information ---------- */
  sectionTitle('Personal information')
  field('Astronaut name', astronaut.name)
  field('Astronaut ID', astronaut.id)
  field('Age', `${astronaut.age} years`)
  field('Mission', astronaut.mission)
  field('Examination date', report.examinationDate)
  field('Examination facility', report.facility)
  field('Examining physician', report.physician)
  field('Clearance', report.fitness)
  field('Valid through', report.validThrough)

  /* ---------- Baseline vitals ---------- */
  y += 4
  sectionTitle('Baseline physiological measurements')
  const vitals = [
    ['Heart rate', `${report.baseline.heartRate} BPM`],
    ['Blood oxygen', `${report.baseline.spo2}%`],
    ['Body temperature', `${report.baseline.temperature} C`],
    ['Respiration rate', `${report.baseline.respiration} br/min`],
  ]
  const cardWidth = (contentWidth - 18) / 4
  ensureSpace(58)
  vitals.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + 6)
    doc.setFillColor(...colors.soft)
    doc.setDrawColor(...colors.line)
    doc.roundedRect(x, y, cardWidth, 46, 3, 3, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...colors.muted)
    doc.text(label.toUpperCase(), x + 8, y + 15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...colors.navy)
    doc.text(sanitize(value), x + 8, y + 33)
  })
  y += 58
  field('Blood pressure', report.bloodPressure)

  /* ---------- Examination findings ---------- */
  sectionTitle('Medical examination')
  field('Medical fitness clearance', report.fitness)
  field('Baseline heart rate', `${report.baseline.heartRate} BPM`)
  field('ECG summary', report.ecg)
  field('Blood oxygen baseline', report.baseline.spo2 + '% / ' + report.bloodOxygen)
  field('Respiratory assessment', report.respiratory)
  field('Body temperature', report.temperature)
  field('Blood test summary', report.bloodTest)
  field('Vision examination', report.vision)
  field('Hearing examination', report.hearing)
  field('Bone density assessment', report.boneDensity)
  field('Previous medical conditions', report.conditions)
  field('Known allergies', report.allergies)
  field('Prescribed medications', report.medications)

  sectionTitle('Flight surgeon summary')
  noteBox(report.summary)

  ensureSpace(70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...colors.muted)
  doc.text('CERTIFICATION', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...colors.ink)
  doc.text(sanitize(report.physician), margin, y + 16)
  doc.text(`Signed electronically | ${sanitize(report.examinationDate)}`, margin, y + 28)
  doc.setDrawColor(...colors.line)
  doc.line(pageWidth - margin - 170, y + 20, pageWidth - margin, y + 20)
  doc.setFontSize(6.5)
  doc.setTextColor(...colors.muted)
  doc.text('Flight surgeon signature', pageWidth - margin, y + 32, { align: 'right' })
  y += 48

  footerOnAllPages()

  const fileName = `AstroGuardian_PreFlight_${astronaut.id}.pdf`
  doc.save(fileName)
  return fileName
}
