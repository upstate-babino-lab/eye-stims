export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function vminsToPx(
  vmins: number,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const minDimension = Math.min(width, height);
  return Math.round((vmins / 100) * minDimension);
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
