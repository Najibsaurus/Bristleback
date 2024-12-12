export declare class AudioLevelIndicator {
    private audioContext;
    private analyser;
    private dataArray;
    private levelIndicator;
    private source;
    private animationId;
    constructor();
    connectStream(stream: MediaStream): Promise<boolean>;
    start(): void;
    stop(): void;
    private updateLevel;
}
