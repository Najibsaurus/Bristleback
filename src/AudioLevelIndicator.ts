export class AudioLevelIndicator {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private levelIndicator: HTMLElement;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationId: number = 0;

  constructor() {
    this.levelIndicator = document.getElementById(
      "levelIndicator"
    ) as HTMLElement;
    if (!this.levelIndicator) {
      console.warn("Level indicator microphone element not found");
    }

    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;
  }

  public async connectStream(stream: MediaStream) {
    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      if (this.source) {
        this.source.disconnect();
      }

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      return true;
    } catch (error) {
      console.error("Error connecting stream to mic level indicator:", error);
      return false;
    }
  }

  public start() {
    if (this.animationId) {
      this.stop();
    }
    this.updateLevel();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
      this.levelIndicator.style.width = "0%";
    }
  }

  private updateLevel = () => {
    this.animationId = requestAnimationFrame(this.updateLevel);

    this.analyser.getByteFrequencyData(this.dataArray);

    const average =
      Array.from(this.dataArray).reduce((a, b) => a + b, 0) /
      this.dataArray.length;
    const normalizedLevel = ((average * 2.75) / 255) * 100; // Convert to percentage

    if (this.levelIndicator) {
      this.levelIndicator.style.width = `${normalizedLevel}%`;
    }
  };
}
