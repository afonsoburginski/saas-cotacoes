// Reusable client-side PDF generation utility
// Captures an HTMLElement's HTML in an isolated iframe and saves as A4 PDF
// Requires html2canvas and jsPDF (already installed in the project)

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

type GeneratePdfOptions = {
  fileName?: string
  width?: number // px, default 794 (A4 @ ~96 DPI)
  height?: number // px, default 1123 (A4 @ ~96 DPI)
  scale?: number // canvas scale, default 2
  backgroundColor?: string // default #ffffff
}

export async function generatePdfFromElement(sourceElement: HTMLElement, options?: GeneratePdfOptions) {
  const {
    fileName = `document_${new Date().toISOString().slice(0, 10)}.pdf`,
    width = 794,
    height = 1123,
    scale = 2,
    backgroundColor = '#ffffff',
  } = options || {}

  // Create isolated iframe to avoid inheriting app styles (oklch, etc.)
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.left = '-99999px'
  iframe.style.width = `${width}px`
  iframe.style.height = `${height}px`
  document.body.appendChild(iframe)

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) throw new Error('Não foi possível criar iframe')

    iframeDoc.open()
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: ${backgroundColor}; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>${sourceElement.innerHTML}</body>
      </html>
    `)
    iframeDoc.close()

    // Allow layout to render
    await new Promise((r) => setTimeout(r, 200))

    const target = iframeDoc.body.firstElementChild as HTMLElement
    const canvas = await html2canvas(target, {
      scale,
      useCORS: true,
      backgroundColor,
      logging: false,
      width,
      height,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.98)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
    pdf.save(fileName)
  } finally {
    document.body.removeChild(iframe)
  }
}


