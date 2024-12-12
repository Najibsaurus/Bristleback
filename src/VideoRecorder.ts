import {
  VideoRecorderOptions,
  RecordingResult,
  RecordingState,
  RecordingStats,
} from "./types";

export  class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private options: VideoRecorderOptions;
  private previewElement: HTMLVideoElement | null = null;
  private recordingStartTime: number = 0;
  private recordingState: RecordingState = "inactive";

  constructor(options: VideoRecorderOptions = {}) {
    this.options = {
      mimeType: this.getBestMimeType(),
      videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
      audioBitsPerSecond: options.audioBitsPerSecond || 128000,
      width: options.width || 1280,
      height: options.height || 720
    };
  }

  public async startPreview(
    previewElement: HTMLVideoElement,
    constraints: MediaStreamConstraints
  ): Promise<boolean> {
    try {
      await this.stopStream();
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;
      this.previewElement = previewElement;
      
      if (this.previewElement) {
        this.previewElement.srcObject = stream;
        this.previewElement.muted = true;
        await this.previewElement.play();
      }
      
      return true;
    } catch (error) {
      console.error('Error starting preview:', error);
      return false;
    }
  }

  public async startRecording(constraints: MediaStreamConstraints): Promise<boolean> {
    try {
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;

    
      if (this.previewElement) {
        this.previewElement.srcObject = stream;
      }

      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.options.mimeType,
        videoBitsPerSecond: this.options.videoBitsPerSecond,
        audioBitsPerSecond: this.options.audioBitsPerSecond
      });

      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.recordingStartTime = Date.now();
      this.recordingState = "recording";
      this.mediaRecorder.start(1000); // Start recording with 1 seconds chunks
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  public async switchDevice(constraints: MediaStreamConstraints): Promise<boolean> {
    try {
      await this.stopStream();
      
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;

      
      if (this.previewElement) {
        this.previewElement.srcObject = stream;
        await this.previewElement.play();
      }

      
      if (this.mediaRecorder?.state === 'recording') {
        const recordedChunks = this.chunks;
        
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: this.options.mimeType,
          videoBitsPerSecond: this.options.videoBitsPerSecond,
          audioBitsPerSecond: this.options.audioBitsPerSecond
        });

        this.chunks = recordedChunks;
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.chunks.push(e.data);
          }
        };

        this.mediaRecorder.start(1000);
      }

      return true;
    } catch (error) {
      console.error('Error switching device:', error);
      return false;
    }
  }

  private async stopStream(): Promise<void> {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  public async stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No MediaRecorder instance found'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.options.mimeType });
        const endTime = Date.now();
        const duration = endTime - this.recordingStartTime;
        
        this.chunks = [];
        this.recordingState = "inactive";
        
        resolve({
          blob,
          duration,
          size: blob.size
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch (error) {
        reject(error);
      }
    });
  }

  public getMediaStream(): MediaStream | null {
    return this.stream;
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  public saveVideo(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  public getRecordingStats(): RecordingStats {
    return {
      startTime: this.recordingStartTime,
      endTime: this.recordingState === "recording" ? null : Date.now(),
      duration: this.recordingState === "recording" ? Date.now() - this.recordingStartTime : 0,
      state: this.recordingState,
      mimeType: this.getBestMimeType(),
      size: this.chunks.reduce((total, chunk) => total + chunk.size, 0)
    };
  }

  public getRecordingState(): RecordingState {
    return this.recordingState;
  }

  private getBestMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  public static isSupported(): boolean {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder);
  }

  public static async getDevices(): Promise<{
    audioDevices: MediaDeviceInfo[];
    videoDevices: MediaDeviceInfo[];
  }> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioDevices: devices.filter(device => device.kind === 'audioinput'),
        videoDevices: devices.filter(device => device.kind === 'videoinput')
      };
    } catch (error) {
      console.error('Error getting devices:', error);
      return { audioDevices: [], videoDevices: [] };
    }
  }
}

export * from "./types";
