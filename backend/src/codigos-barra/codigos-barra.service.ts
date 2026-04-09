import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CodigosBarraService {
  /**
   * Generates a simple barcode as SVG (no disk persistence — fixes H11)
   * For production, use a library like 'jsbarcode' or 'bwip-js'
   */
  generateBarcode(params: {
    codigo: string;
    formato: 'code128' | 'i2of5';
    ancho?: number;
    alto?: number;
    mostrarTexto?: boolean;
  }): string {
    const { codigo, formato, ancho = 2, alto = 100, mostrarTexto = true } = params;

    // Property 11: validate Interleaved 2of5 format
    if (formato === 'i2of5') {
      if (!/^\d+$/.test(codigo)) {
        throw new BadRequestException('El código Interleaved 2of5 solo acepta dígitos numéricos');
      }
      if (codigo.length % 2 !== 0) {
        throw new BadRequestException('El código Interleaved 2of5 debe tener longitud par');
      }
    }

    if (!codigo || codigo.length === 0) {
      throw new BadRequestException('El código no puede estar vacío');
    }

    // Generate minimal SVG barcode representation
    const barWidth = ancho;
    const totalWidth = codigo.length * barWidth * 11;
    const svgHeight = alto + (mostrarTexto ? 20 : 0);

    let bars = '';
    let x = 10;
    for (let i = 0; i < codigo.length; i++) {
      const charCode = codigo.charCodeAt(i);
      // Simple alternating bar pattern (visual representation)
      for (let b = 0; b < 9; b++) {
        const isBar = (charCode + b) % 2 === 0;
        if (isBar) {
          bars += `<rect x="${x}" y="10" width="${barWidth}" height="${alto}" fill="black"/>`;
        }
        x += barWidth;
      }
      x += barWidth; // gap between chars
    }

    const textEl = mostrarTexto
      ? `<text x="${totalWidth / 2}" y="${alto + 15}" text-anchor="middle" font-size="12" font-family="monospace">${codigo}</text>`
      : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth + 20}" height="${svgHeight + 20}">
  <rect width="100%" height="100%" fill="white"/>
  ${bars}
  ${textEl}
</svg>`;
  }
}
