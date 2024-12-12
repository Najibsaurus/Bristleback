

export class AudioVisualizer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private canvas: HTMLCanvasElement;
  private canvasCtx: CanvasRenderingContext2D;
  private dataArray: Uint8Array;
  private animationId: number = 0;
  private barWidth: number = 3;
  private barGap: number = 2;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.canvasCtx = ctx;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvasCtx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  public async connectStream(stream: MediaStream) {
    try {
      console.log('Connecting stream to visualizer');
      

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      
      if (this.source) {
        this.source.disconnect();
      }

      
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      
      console.log('Stream connected successfully');
      return true;
    } catch (error) {
      console.error('Error connecting stream to visualizer:', error);
      return false;
    }
  }

  public start() {
    if (this.animationId) {
      this.stop();
    }
    console.log('Starting visualizer animation');
    this.draw();
  }

  public stop() {
    if (this.animationId) {
      console.log('Stopping visualizer animation');
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
      
      
      const width = this.canvas.width;
      const height = this.canvas.height;
      this.canvasCtx.clearRect(0, 0, width, height);
    }
  }

  private draw = () => {
    this.animationId = requestAnimationFrame(this.draw);

    const width = this.canvas.width;
    const height = this.canvas.height;
    const bufferLength = this.analyser.frequencyBinCount;

    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    
    this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this.canvasCtx.fillRect(0, 0, width, height);

    const totalWidth = bufferLength * (this.barWidth + this.barGap);
    let x = (width - totalWidth) / 2;

    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * height;
      
      if (barHeight === 0) continue;

      const hue = (i / bufferLength) * 360;
      this.canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.canvasCtx.fillRect(
        x,
        height - barHeight,
        this.barWidth,
        barHeight
      );

      x += this.barWidth + this.barGap;
    }
  };
}
