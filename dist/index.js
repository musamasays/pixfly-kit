import * as React from 'react';
import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';

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
    const buttonClasses = `${customClass} pf-px-6 pf-py-3 pf-rounded-full pf-font-medium pf-text-white pf-transition-all pf-duration-300 pf-ease-in-out`;
    return (React.createElement("div", { className: "pf-relative" },
        React.createElement("button", { onClick: () => setIsModalOpen(true), style: buttonStyles, className: buttonClasses }, buttonText),
        React.createElement(AnimatePresence, null, isModalOpen && (React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, style: {
                backgroundColor,
                backdropFilter: "blur(8px)",
            }, className: "pf-fixed pf-inset-0 pf-flex pf-justify-center pf-items-center pf-z-50 pf-p-4" },
            React.createElement(motion.div, { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 }, style: Object.assign({ height: modalHeight, width: modalWidth }, modalStyles), className: "pf-bg-white pf-dark:bg-gray-800 pf-rounded-2xl pf-shadow-2xl pf-relative pf-w-full pf-max-w-5xl pf-flex pf-flex-col" },
                React.createElement("div", { className: "pf-p-8 pf-flex-grow pf-overflow-y-auto" },
                    React.createElement("button", { onClick: () => closeModal(), className: "pf-absolute pf-top-4 pf-right-4 pf-text-gray-500 pf-hover:text-gray-700 pf-dark:text-gray-400 pf-dark:hover:text-gray-200 pf-transition-colors pf-duration-200" },
                        React.createElement("button", { onClick: () => closeModal(), className: "pf-absolute pf-top-4 pf-right-4 pf-text-gray-500 pf-hover:text-gray-700 pf-dark:text-gray-400 pf-dark:hover:text-gray-200 pf-transition-colors pf-duration-200" }, "\u274C")),
                    React.createElement("h2", { className: "pf-text-2xl pf-font-bold pf-mb-6 pf-text-gray-800 pf-dark:text-white" }, "Upload Your Images"),
                    React.createElement("div", { className: `pf-relative pf-border-2 pf-border-dashed pf-rounded-2xl pf-p-8 pf-mb-6 pf-transition-all pf-duration-300 pf-ease-in-out ${files.length > 0
                            ? "pf-border-green-500 pf-bg-green-50 pf-dark:bg-green-900 pf-dark:bg-opacity-20"
                            : "pf-border-gray-300 pf-bg-gray-100 pf-dark:bg-gray-700 pf-hover:bg-gray-200 pf-dark:hover:bg-gray-600"}`, onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
                            e.preventDefault();
                            handleFileSelection(e.dataTransfer.files);
                        } },
                        React.createElement("div", { className: "pf-text-center" },
                            React.createElement("svg", { className: "pf-mx-auto pf-h-12 pf-w-12 pf-text-gray-400", stroke: "currentColor", fill: "none", viewBox: "0 0 48 48", "aria-hidden": "true" },
                                React.createElement("path", { d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })),
                            React.createElement("p", { className: "pf-mt-1 pf-text-sm pf-text-gray-600 pf-dark:text-gray-300" },
                                React.createElement("span", { className: "pf-font-medium" }, "Click to upload"),
                                " or drag and drop"),
                            React.createElement("p", { className: "pf-mt-1 pf-text-xs pf-text-gray-500 pf-dark:text-gray-400" },
                                "PNG, JPG, JPEG up to 5MB (Max ",
                                maxImages,
                                " images)")),
                        React.createElement("input", { type: "file", accept: "image/*", multiple: true, className: "pf-absolute pf-inset-0 pf-w-full pf-h-full pf-opacity-0 pf-cursor-pointer", onChange: (e) => handleFileSelection(e.target.files), disabled: files.length >= maxImages })),
                    files.length > 0 && (React.createElement("div", { className: "pf-grid pf-grid-cols-1 sm:pf-grid-cols-2 md:pf-grid-cols-3 lg:pf-grid-cols-4 pf-gap-4 pf-mb-6" }, files.map((file, index) => (React.createElement("div", { key: index, className: "pf-relative" },
                        React.createElement("div", { style: { height: "200px", position: "relative" }, className: "pf-w-full pf-bg-gray-200 pf-dark:bg-gray-700 pf-rounded-lg pf-overflow-hidden" },
                            React.createElement("img", { src: file.url || "/placeholder.svg", alt: `Preview ${index + 1}`, className: "pf-w-full pf-h-full pf-object-cover" }),
                            React.createElement("div", { className: "pf-absolute pf-inset-0 pf-flex pf-flex-col pf-items-center pf-justify-center pf-bg-black pf-bg-opacity-50 pf-p-2" },
                                React.createElement("p", { className: "pf-text-white pf-text-center pf-font-light pf-text-sm pf-mb-1 pf-line-clamp-1 pf-px-4" }, file.file.name),
                                React.createElement("p", { className: "pf-text-white pf-text-center pf-font-light pf-text-xs pf-mb-2" },
                                    (file.size / 1024).toFixed(2),
                                    " KB"),
                                file.status === "pending" && (React.createElement("button", { onClick: () => setFiles(files.filter((_, i) => i !== index)), className: "pf-absolute pf-top-1 pf-right-1 pf-bg-gray-700 pf-rounded-full pf-p-1 pf-hover:bg-gray-700 pf-transition-colors pf-duration-200" }, "\u274C")),
                                file.status === "uploading" && (React.createElement("div", { className: "pf-absolute pf-bottom-0 pf-left-0 pf-right-0 pf-bg-black pf-bg-opacity-50 pf-p-2" },
                                    React.createElement("div", { className: "pf-w-full pf-bg-green-200 pf-rounded-full pf-h-1 pf-dark:bg-green-700" },
                                        React.createElement("div", { className: "pf-bg-green-500 pf-h-1 pf-rounded-full", style: { width: `${file.progress}%` } })),
                                    React.createElement("p", { className: "pf-text-xs pf-text-center pf-mt-1 pf-text-white" },
                                        file.progress,
                                        "%"))),
                                file.status === "success" && React.createElement("span", null, "\u2705"),
                                file.status === "error" && React.createElement("span", null, "\u274C"))),
                        file.status === "error" && (React.createElement("p", { className: "pf-text-xs pf-text-red-500 pf-mt-1" }, file.error))))))),
                    error && (React.createElement(motion.p, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "pf-text-red-500 pf-text-sm pf-mb-4" }, error))),
                React.createElement("div", { className: "pf-p-4 pf-flex pf-justify-end pf-border-t pf-border-gray-200 pf-dark:border-gray-700" },
                    React.createElement("button", { onClick: handleFileUpload, style: buttonStyles, disabled: files.length === 0 || uploading, className: `${buttonClasses} pf-font-bold ${files.length === 0 || uploading ? "pf-bg-gray-400 pf-cursor-not-allowed" : ""}` }, uploading ? "Uploading..." : "Start Upload"))))))));
};

export { PixFlyUploader };
//# sourceMappingURL=index.js.map
