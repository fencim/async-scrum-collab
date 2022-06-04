export interface IMedia {
    key: string;
    type: 'audio' | 'doc' | 'image' | 'video',
    dataUrl: string;
}