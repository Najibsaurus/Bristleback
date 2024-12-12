export interface VideoRecorderOptions {
    mimeType?: string;
    videoBitsPerSecond?: number;
    audioBitsPerSecond?: number;
    width?: number;
    height?: number;
}
export interface RecordingResult {
    blob: Blob;
    duration: number;
    size: number;
}
export type RecordingState = "inactive" | "recording" | "paused";
export interface RecordingStats {
    startTime: number;
    endTime: number | null;
    duration: number;
    state: RecordingState;
    mimeType: string;
    size: number;
}
