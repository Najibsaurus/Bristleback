import { VideoRecorderOptions, RecordingResult, RecordingState, RecordingStats } from "./types";
export declare class VideoRecorder {
    private mediaRecorder;
    private stream;
    private chunks;
    private options;
    private previewElement;
    private recordingStartTime;
    private recordingState;
    constructor(options?: VideoRecorderOptions);
    startPreview(previewElement: HTMLVideoElement, constraints: MediaStreamConstraints): Promise<boolean>;
    startRecording(constraints: MediaStreamConstraints): Promise<boolean>;
    switchDevice(constraints: MediaStreamConstraints): Promise<boolean>;
    private stopStream;
    stopRecording(): Promise<RecordingResult>;
    getMediaStream(): MediaStream | null;
    isRecording(): boolean;
    saveVideo(blob: Blob, filename: string): void;
    getRecordingStats(): RecordingStats;
    getRecordingState(): RecordingState;
    private getBestMimeType;
    static isSupported(): boolean;
    static getDevices(): Promise<{
        audioDevices: MediaDeviceInfo[];
        videoDevices: MediaDeviceInfo[];
    }>;
}
export * from "./types";
