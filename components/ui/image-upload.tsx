"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import { ImagePlusIcon, Trash, Upload } from "lucide-react";

import { UploadModal } from "../modals/upload-modal";
import toast from "react-hot-toast";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: Array<{ url: string, key: string }>) => void;
    onRemove: (value: string) => void;
    value: Array<{ url: string, key: string }>;
    maxFiles: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
    maxFiles
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const removeImage = async (url: { url: string, key: string }) => {
        const deletefileResponse = await fetch("/api/s3/delete", {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ key: url.key }),
        })

        if (!deletefileResponse) {
            toast.error("Failed to delete file")
            return;
        }
        onRemove(url.url)
        toast.success("File deleted successfully")

    }
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    return (
        <div>
            <UploadModal disabled={disabled} maxFiles={maxFiles} maxSize={1024 * 1024 * 5} onChange={onChange} isOpen={open} onClose={() => setOpen(false)} value={value} />
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url.key} className="relative w-[200px] rounded-md overflow-hidden">
                        <div className="flex flex-col gap-1">
                            <div className='relative aspect-square  rounded-lgoverflow-hidden'>
                                <div className="z-10 absolute top-2 right-2">
                                    <Button type="button"
                                        disabled={loading}
                                        onClick={() => removeImage(url)}
                                        variant="destructive" size="icon">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                                <img
                                    className="w-full h-full object-cover bg-gray-50"
                                    alt={url.url}
                                    src={url.url}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={() => setOpen(true)} type="button">
                <ImagePlusIcon />
                Upload
            </Button>
        </div>
    )

}

export default ImageUpload;