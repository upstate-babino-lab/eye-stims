export type DisplayProps = {
  name?: string;
  width: number;
  height: number;
  pxPerDegree: number;
  fps: number;
};

export enum DisplayKey {
  SD = 'SD',
  HD = 'HD',
}

// In future allow user settings to add/change?
export const displays: Record<DisplayKey, DisplayProps> = {
  SD: {
    width: 1280,
    height: 720,
    pxPerDegree: 12.524,
    fps: 30,
  },
  HD: {
    width: 1920,
    height: 1080,
    pxPerDegree: 12.524,
    fps: 60,
  },
};
