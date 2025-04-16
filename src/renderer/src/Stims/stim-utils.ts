export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
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