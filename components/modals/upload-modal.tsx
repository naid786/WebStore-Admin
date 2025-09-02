"use client"

import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "../ui/model";
import { Button } from "../ui/button";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { FileRejection, useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface UploadModalProps {
    disabled?: boolean;
    isOpen: boolean;
    onClose: () => void;
onChange: (value: Array<{ url: string,key:string }>) => void;
    value: Array<{ url: string, key: string }>;
    maxFiles: number;
    maxSize: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    onChange,
    maxFiles,
    maxSize,
    value
}) => {

    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [files, setFiles] = useState<Array<{
        id: string;
        file: File,
        uploading: boolean,
        progress: number;
        key?: string;
        isDeleting: boolean;
        error: boolean;
        objectUrl?: string;
    }>>([]);
    const [urls, setUrls] = useState<Array<{
        url:string;
        key:string;
    }>>([])

    const onUpload = async (file: File) => {
        setFiles((prevFiles) =>
            prevFiles.map((f) => f.file === file ? { ...f, uploading: true } : f
            )
        );

        try {
            const presignedUrlResponse = await fetch("/api/s3/upload", {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    size: file.size
                }),
            });

            if (!presignedUrlResponse) {
                toast.error("Failed to get Presigned Url")
                setFiles((prevFiles) =>
                    prevFiles.map((f) => f.file === file ? { ...f, uploading: false, progress: 0, error: true } : f
                    )
                );
                return
            }

            const { presignedUrl, key,url } = await presignedUrlResponse.json()

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentageCpmpleted = (event.loaded / event.total) * 100;
                        setFiles((prevFiles) =>
                            prevFiles.map((f) => f.file === file ? { ...f, progress: percentageCpmpleted, key: key } : f
                            )
                        );
                        
                    }
                }

                xhr.onload = () => {
                    if (xhr.status === 200 || xhr.status === 204) {
                        setFiles((prevFiles) =>
                            prevFiles.map((f) => f.file === file ? { ...f, progress: 100, uploading: false, error: false } : f
                            )
                        );

                        
                        
                        toast.success("File upload successfully");
                        if (!value.includes(url.trim())) {
                            setUrls((prev) => [...prev, { url: url.trim(), key: key }]);
                        }
                        resolve();
                    }
                    else {
                        reject(new Error(`Upload failed with status: ${xhr.status}`))
                    }
                };

                xhr.onerror = () => {
                    reject(new Error("Upload failed"));
                }

                xhr.open('PUT', presignedUrl);
                xhr.setRequestHeader("Content-Type", file.type);
                xhr.send(file);
            });
        } catch (error) {
            toast.error("Upload failed")
            setFiles((prevFiles) =>
                prevFiles.map((f) => f.file === file ? { ...f, uploading: false, progress: 0, error: true } : f
                )
            );
        }
    }
    useEffect(() => {
        if (!isOpen) {
            setFiles([]);
            setUrls([]);
            setLoading(false);
        }
    }, [isOpen]);
    const removeFile = async (fileId: string) => {
        try {
            setLoading(true)
            const fileToRemove = files.find((f) => f.id === fileId);

            if (fileToRemove) {
                if (fileToRemove.objectUrl) {
                    URL.revokeObjectURL(fileToRemove.objectUrl)
                }
            }

            setFiles((prevFiles) =>
                prevFiles.map((f) => f.id === fileId ? { ...f, isDeleting: true } : f
                )
            );

            const deletefileResponse = await fetch("/api/s3/delete", {
                method: "DELETE",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ key: fileToRemove?.key }),
            })

            if (!deletefileResponse) {
                toast.error("Failed to delete file")

                setFiles((prevFiles) =>
                    prevFiles.map((f) => f.id === fileId ? { ...f, isDeleting: false, error: true } : f
                    )
                );

                return;
            }

            setFiles((prevFiles) =>
                prevFiles.map((f) => f.id === fileId ? { ...f, isDeleting: false, error: false } : f
                )
            );
            // if (fileToRemove?.key) onRemove(fileToRemove?.key)
            toast.success("File deleted successfully")

            setFiles((prevFiles) =>
                prevFiles.filter((f) => f.id !== fileId)
            );

            setLoading(false)

        } catch (error) {
            toast.error("Failed to delete file")

            setFiles((prevFiles) =>
                prevFiles.map((f) => f.id === fileId ? { ...f, isDeleting: false, error: true } : f
                )
            );
            setLoading(false)
        }
    }
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFiles((prevFiles) => [
                ...prevFiles,
                ...acceptedFiles.map((file) => ({
                    id: uuidv4(),
                    file: file,
                    uploading: false,
                    progress: 0,
                    isDeleting: false,
                    error: false,
                    objectUrl: URL.createObjectURL(file),
                }))
            ]);
        }
        setLoading(true)
        acceptedFiles.forEach(onUpload)
        setLoading(false)
    }, []);

    const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
        // Do something with the files
        if (fileRejections.length > 0) {
            const tooManyFiles = fileRejections.find((fileRejected) => fileRejected.errors[0].code === "too-many-files");
            const fileTooLarge = fileRejections.find((fileRejected) => fileRejected.errors[0].code === "file-too-large");

            if (tooManyFiles) { toast.error("You can only upload 5 files at a time"); }
            if (fileTooLarge) { toast.error("File is too large, max is 5mb"); }


        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        maxFiles: maxFiles,
        maxSize: maxSize,//1024 * 1024 * 5,
        accept: {
            'image/*': [],
        }
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Modal
            title="Create store"
            description="Add a new store to manage products and categories"
            isOpen={isOpen}
            onClose={onClose}>
            <div>
                <div className="space-y-4 py-2 pb-4 items-center justify-end w-full">
                    <div className="pt-6 space-x-2 flex flex-col items-center justify-end w-full">
                        <div>
                            <div className="mb-4 flex items-center gap-4">
                                {files.map((file) => (
                                    <div key={file.id} className="relative w-[200px] rounded-md overflow-hidden">
                                        <div className="flex flex-col gap-1">
                                            <div className='relative aspect-square rounded-lgoverflow-hidden'>
                                                <div className="z-10 absolute top-2 right-2">
                                                    <Button type="button"
                                                        disabled={file.uploading || file.isDeleting}
                                                        onClick={() => {
                                                            removeFile(file.id)
                                                        }}
                                                        variant="destructive" size="icon">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <img

                                                    className="w-full h-full object-cover bg-gray-50"
                                                    alt={file.file.name}
                                                    src={file.objectUrl}
                                                />
                                                {file.progress && !file.isDeleting && (
                                                    <div className="absolute inset-0 bg-black/50 fex items-center justify-center">
                                                        <p className="text-white font medium text-lg">
                                                            {file.progress}%
                                                        </p>
                                                    </div>
                                                )}
                                                {file.error && (
                                                    <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                                                        <p className="text-white font-medium text-lg">
                                                            Error
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{file.file.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Card className={cn("relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-full", isDragActive ? 'boarder-primary bg-primary/10 border-solid ' : 'boarder-border hover:border-primary')}
                                {...getRootProps()}>
                                <CardContent className="flex flex-col items-center justify-center h-full w-full">
                                    <input {...getInputProps()} />
                                    {
                                        isDragActive ?
                                            <p className="text-center">Drop the files here ...</p> :
                                            (<div className="flex flex-col items-center justify-center h-full w-full gap-y-3">
                                                <p>Drag 'n' drop some files here, or click to select files</p>
                                                <Button type="button">Select files</Button>
                                            </div>
                                            )
                                    }
                                </CardContent>
                            </Card>
                        </div>
                        <div className=" items-center pt-4">
                            <Button disabled={loading} type="button" variant={"outline"} onClick={() => {
                                onChange(urls)
                                onClose()
                            }}>Done</Button>
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        </Modal>
    )
}