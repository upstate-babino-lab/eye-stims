import { StimType, Stimulus } from './Stimulus';

export class ImageStim extends Stimulus {
  filePath: string = ''; // Absolute path to the image file
  size: number = 100; // Percentage of vmax (viewport maximum)
  private _image: HTMLImageElement | null = null;

  constructor(props: Partial<ImageStim> = {}) {
    super({ ...props, stimType: StimType.ImageStim });
    this.filePath = props.filePath ?? this.filePath;
    this.size = props.size ?? this.size;
    loadImage('image://' + this.filePath) // Using custom protocol defined in main
      .then((image) => {
        this._image = image;
      })
      .catch((err) => {
        console.error(`Failed to load image at ${this.filePath}:`, err);
      });
  }

  renderFrame(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    _pxPerDegree: number,
    ageSeconds: number
  ): void {
    if (ageSeconds < 0 || ageSeconds > this.durationMs / 1000) {
      return;
    }

    ctx.save();
    // Start with pure background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!this._image) {
      console.warn(`>>>>> Image not yet loaded: ${this.filePath}`);
      ctx.font = '20px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center'; // Horizontal centering
      ctx.textBaseline = 'middle'; // Vertical centering
      ctx.fillText(
        `Image not loaded: ${this.filePath}`,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );
    } else {
      const scaleX = ctx.canvas.width / this._image.width;
      const scaleY = ctx.canvas.height / this._image.height;
      const scale = Math.min(scaleX, scaleY) * (this.size / 100);
      const scaledWidth = this._image.width * scale;
      const scaledHeight = this._image.height * scale;

      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.drawImage(
        this._image,
        -scaledWidth / 2, // Center horizontally
        -scaledHeight / 2, // Center vertically
        scaledWidth,
        scaledHeight
      );
    }

    ctx.restore();
  }
}

async function loadImage(imageFileName: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageFileName;

    image.onload = () => resolve(image);
    image.onerror = (err) => {
      console.error(`Failed to load image: ${imageFileName}`, err);
      reject(err);
    };
  });
}
