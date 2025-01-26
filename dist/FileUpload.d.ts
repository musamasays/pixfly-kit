import * as React from "react";
interface FileUploadProps {
    apiBaseUrl: string;
    proj: string;
    sign: string;
    onUploadSuccess?: (urls: string[]) => void;
    onUploadError?: (error: string) => void;
    customClass?: string;
    buttonText?: string;
    buttonStyles?: React.CSSProperties;
    modalStyles?: React.CSSProperties;
    backgroundColor?: string;
    modalHeight?: string;
    modalWidth?: string;
    maxImages?: number;
}
declare const PixFlyUploader: React.FC<FileUploadProps>;
export { PixFlyUploader };
