import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { X, CircleCheck } from 'lucide-react';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const PixFlyUploader = ({ apiBaseUrl, proj, sign, onUploadSuccess, onUploadError, customClass = "", buttonText = "Upload Images", buttonStyles = {}, modalStyles = {}, backgroundColor = "rgba(0, 0, 0, 0.8)", modalHeight = "80vh", modalWidth = "80vw", maxImages = 5 }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const handleFileSelection = useCallback((selectedFiles) => {
        if (!selectedFiles)
            return;
        const newFiles = Array.from(selectedFiles)
            .filter((file) => {
            if (!file.type.startsWith("image/")) {
                setError("Only image files are allowed.");
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("File size exceeds 5MB limit.");
                return false;
            }
            return true;
        })
            .slice(0, maxImages - files.length)
            .map((file) => ({
            file,
            url: URL.createObjectURL(file),
            progress: 0,
            status: "pending",
            size: file.size,
        }));
        setFiles((prevFiles) => [...prevFiles, ...newFiles].slice(0, maxImages));
        setError(null);
    }, [files.length, maxImages]);
    const uploadFile = (file, index) => __awaiter(undefined, undefined, undefined, function* () {
        try {
            const response = yield fetch(`${apiBaseUrl}/api/signed-uri`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileType: file.file.type, proj, sign }),
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.error || "Failed to generate pre-signed URL.");
            }
            const { signedUrl } = yield response.json();
            yield axios.put(signedUrl, file.file, {
                headers: { "Content-Type": file.file.type },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? Object.assign(Object.assign({}, f), { progress: percentCompleted, status: "uploading" }) : f)));
                },
            });
            const previewResponse = yield fetch(`${apiBaseUrl}/api/get-preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signed_url: signedUrl, sign }),
            });
            if (!previewResponse.ok) {
                const previewErrorData = yield previewResponse.json();
                throw new Error(previewErrorData.error || "Failed to get preview URL.");
            }
            const { url } = yield previewResponse.json();
            setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? Object.assign(Object.assign({}, f), { url, status: "success" }) : f)));
            onUploadSuccess === null || onUploadSuccess === void 0 ? void 0 : onUploadSuccess([url]);
            return url;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred.";
            setFiles((prevFiles) => prevFiles.map((f, i) => (i === index ? Object.assign(Object.assign({}, f), { status: "error", error: errorMessage }) : f)));
            console.error(`Error uploading file: ${errorMessage}`);
            onUploadError === null || onUploadError === undefined ? undefined : onUploadError(errorMessage);
            throw error;
        }
    });
    const handleFileUpload = useCallback(() => __awaiter(undefined, undefined, undefined, function* () {
        if (files.length === 0)
            return setError("Please select images to upload.");
        setUploading(true);
        setError(null);
        for (let i = 0; i < files.length; i++) {
            if (files[i].status !== "pending")
                continue;
            try {
                yield uploadFile(files[i], i);
            }
            catch (error) {
                console.error(`Error uploading file ${files[i].file.name}:`, error);
            }
        }
        setUploading(false);
    }), [files, uploadFile]);
    const closeModal = () => {
        setIsModalOpen(false);
        setFiles([]);
    };
    const buttonClasses = `${customClass} px-6 py-3 rounded-full font-medium text-white transition-all duration-300 ease-in-out`;
    return (React.createElement("div", { className: "relative" },
        React.createElement("button", { onClick: () => setIsModalOpen(true), style: buttonStyles, className: buttonClasses }, buttonText),
        React.createElement(AnimatePresence, null, isModalOpen && (React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, style: {
                backgroundColor,
                backdropFilter: "blur(8px)",
            }, className: "fixed inset-0 flex justify-center items-center z-50 p-4" },
            React.createElement(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, style: Object.assign({ height: modalHeight, width: modalWidth }, modalStyles), className: "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl relative w-full max-w-5xl flex flex-col" },
                React.createElement("div", { className: "p-8 flex-grow overflow-y-auto" },
                    React.createElement("button", { onClick: () => closeModal(), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200" },
                        React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "#ffffff", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" },
                            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }))),
                    React.createElement("h2", { className: "text-2xl font-bold mb-6 text-gray-800 dark:text-white" }, "Upload Your Images"),
                    React.createElement("div", { className: `relative border-2 border-dashed rounded-2xl p-8 mb-6 transition-all duration-300 ease-in-out ${files.length > 0
                            ? "border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20"
                            : "border-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"}`, onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
                            e.preventDefault();
                            handleFileSelection(e.dataTransfer.files);
                        } },
                        React.createElement("div", { className: "text-center" },
                            React.createElement("svg", { className: "mx-auto h-12 w-12 text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", "aria-hidden": "true" },
                                React.createElement("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })),
                            React.createElement("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-300" },
                                React.createElement("span", { className: "font-medium" }, "Click to upload"),
                                " or drag and drop"),
                            React.createElement("p", { className: "mt-1 text-xs text-gray-500 dark:text-gray-400" },
                                "PNG, JPG, JPEG up to 5MB (Max ",
                                maxImages,
                                " images)")),
                        React.createElement("input", { type: "file", accept: "image/*", multiple: true, className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", onChange: (e) => handleFileSelection(e.target.files), disabled: files.length >= maxImages })),
                    files.length > 0 && (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6" }, files.map((file, index) => (React.createElement("div", { key: index, className: "relative" },
                        React.createElement("div", { style: { height: "200px", position: "relative" }, className: "w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden" },
                            React.createElement("img", { src: file.url || "/placeholder.svg", alt: `Preview ${index + 1}`, className: "w-full h-full object-cover" }),
                            React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-2" },
                                React.createElement("p", { className: "text-white text-center font-light text-sm mb-1 line-clamp-1 px-4" }, file.file.name),
                                React.createElement("p", { className: "text-white text-center font-light text-xs mb-2" },
                                    (file.size / 1024).toFixed(2),
                                    " KB"),
                                file.status === "pending" && (React.createElement("button", { onClick: () => setFiles(files.filter((_, i) => i !== index)), className: "absolute top-1 right-1 bg-gray-700 rounded-full p-1 hover:bg-gray-700 transition-colors duration-200" },
                                    React.createElement(X, { className: "w-4 h-4 text-red-500" }))),
                                file.status === "uploading" && (React.createElement("div", { className: "absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2" },
                                    React.createElement("div", { className: "w-full bg-green-200 rounded-full h-1 dark:bg-green-700" },
                                        React.createElement("div", { className: "bg-green-500 h-1 rounded-full", style: { width: `${file.progress}%` } })),
                                    React.createElement("p", { className: "text-xs text-center mt-1 text-white" },
                                        file.progress,
                                        "%"))),
                                file.status === "success" && React.createElement(CircleCheck, { className: "w-8 h-8 text-warning-500" }),
                                file.status === "error" && React.createElement(X, { className: "w-8 h-8 text-red-500" }))),
                        file.status === "error" && React.createElement("p", { className: "text-xs text-red-500 mt-1" }, file.error)))))),
                    error && (React.createElement(motion.p, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "text-red-500 text-sm mb-4" }, error))),
                React.createElement("div", { className: "p-4 flex justify-end border-t border-gray-200 dark:border-gray-700" },
                    React.createElement("button", { onClick: handleFileUpload, style: buttonStyles, disabled: files.length === 0 || uploading, className: `${buttonClasses} font-bold ${files.length === 0 || uploading ? "bg-gray-400 cursor-not-allowed" : ""}` }, uploading ? "Uploading..." : "Start Upload"))))))));
};

export { PixFlyUploader };
//# sourceMappingURL=index.js.map
