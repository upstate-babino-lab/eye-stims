export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function vmin(ctx): number {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  return Math.min(width, height);
}

export function vmax(ctx): number {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  return Math.max(width, height);
}

export function vminsToPx(
  vmins: number,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  return Math.round((vmins / 100) * vmin(ctx));
}

export function logMARtoPx(logMAR: number, pxPerDegree: number): number {
  const degrees = Math.pow(10, logMAR) / 60;
  return Math.round(degrees * pxPerDegree);
}

export function diagonalLength(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  return Math.sqrt(ctx.canvas.width ** 2 + ctx.canvas.height ** 2);
}

export function colorToRGB(cssColor: string): { r: number; g: number; b: number } {
  const canvas = new OffscreenCanvas(1, 1);
  if (!canvas) {
    throw new Error('colorToRGB() got invalid OffscreenCanvas');
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('colorToRGB() got invalid context from canvas');
  }

  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const colorData = ctx.getImageData(0, 0, 1, 1).data;

  return {
    r: colorData[0],
    g: colorData[1],
    b: colorData[2],
  };
}

export function rgbToHex(rgb) {
  return (
    '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
  );
}
