export type DisplayProps = {
  //name?: string;
  width: number;
  height: number;
  aspectRatio: string;
  label: string;
  pxPerDegree: number;
  fps: number;
  // TODO gamma: 2.2 by default
};

export enum DisplayKey {
  SD1 = 'SD1',
  SD2 = 'SD2',
  HD = 'HD',
}

// In future allow user settings to add/change?
export const displays: Record<DisplayKey, DisplayProps> = {
  SD1: {
    width: 1280,
    height: 800,
    label: 'Projector display mode',
    aspectRatio: '16:10',
    pxPerDegree: 12.524, // Ok to assume square pixels?
    fps: 50, // Aligns with 2-centisecond duration boundaries
  },
  SD2: {
    width: 1280,
    height: 720,
    label: '720p',
    aspectRatio: '16:9',
    pxPerDegree: 12.524,
    fps: 50, // Aligns with 2-centisecond duration boundaries
  },
  HD: {
    width: 1920,
    height: 1080,
    label: '1080p',
    aspectRatio: '16:9',
    pxPerDegree: 12.524,
    fps: 50,
  },
};
