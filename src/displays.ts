export type DisplayProps = {
  name?: string;
  width: number;
  height: number;
  fps: number;
};

export enum DisplayKey {
  SD = 'SD',
  HD = 'HD',
}

// Future feature to allow user settings to add/change?
export const displays: Record<DisplayKey, DisplayProps> = {
  SD: {
    width: 1280,
    height: 720,
    fps: 30,
  },
  HD: {
    width: 1920,
    height: 1080,
    fps: 60,
  },
};
