"use client";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useOrigin } from "@/hooks/use-origin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Catalogue, CatalogueImage } from "@prisma/client";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const formSchema = z.object({
    label: z.string().min(1),
    images: z.object({ url: z.string(), key: z.string() }).array()
        .max(1, { message: "Only 1 image can be saved." }),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
});

type CatalogueFormValue = z.infer<typeof formSchema>

interface CatalogueFormProps {
    initialData: Catalogue & {
        images: CatalogueImage[]
    } | null
};


export const CatalogueForm: React.FC<CatalogueFormProps> = ({
    initialData
}) => {

    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit catalogue" : "Create catalogue"
    const description = initialData ? "Edit a catalogue" : "Add a new catalogue"
    const toastMessage = initialData ? "Catalogue updated." : "Catalogue created."
    const action = initialData ? "Save changes" : "Create"

    const form = useForm<CatalogueFormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            images: initialData.images
        } : {
            label: '',
            images: [],
            isFeatured: false,
            isArchived: false,
        }
    })

    const onDelete = async () => {
        try {

            await axios.delete(`/api/${params.storeId}/catalogues/${params.catalogueId}`);
            router.refresh();
            router.push(`/${params.storeId}/catalogues`);
            toast.success("Catalogue deleted")
        } catch (error) {
            toast.error("Make sure you removed all products using this catalogue first.");
        }
        finally {
            setLoading(false);
            setOpen(false);
        }
    }

    const onSubmit = async (data: CatalogueFormValue) => {
        try {
            setLoading(true)
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/catalogues/${params.catalogueId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/catalogues`, data);
            }

            router.refresh();
            router.push(`/${params.storeId}/catalogues`)
            toast.success(toastMessage)
        } catch (error) {
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full" >
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (

                            <FormItem>
                                <FormLabel>Background image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value}
                                        disabled={loading}
                                        onChange={(url) => {
                                            const newImages = [...field.value, ...url];
                                            field.onChange(newImages);
                                            console.log("images", field)
                                        }}
                                        onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                                        maxFiles={1}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (

                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Catalogue label" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (

                                <FormItem className="flex flex-row items-start spcae-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Featured
                                        </FormLabel>
                                        <FormDescription>
                                            This catalogue will appear on the home page
                                        </FormDescription>
                                    </div>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isArchived"
                            render={({ field }) => (

                                <FormItem className="flex flex-row items-start spcae-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Archived
                                        </FormLabel>
                                        <FormDescription>
                                            This catalogue's products will appear anywhere in the store
                                        </FormDescription>
                                    </div>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
                {/* <Separator /> */}
            </Form>
        </>

    )
}