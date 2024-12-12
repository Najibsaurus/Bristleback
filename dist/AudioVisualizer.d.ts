export declare class AudioVisualizer {
    private audioContext;
    private analyser;
    private canvas;
    private canvasCtx;
    private dataArray;
    private animationId;
    private barWidth;
    private barGap;
    private source;
    constructor(canvas: HTMLCanvasElement);
    private resizeCanvas;
    connectStream(stream: MediaStream): Promise<boolean>;
    start(): void;
    stop(): void;
    private draw;
}
