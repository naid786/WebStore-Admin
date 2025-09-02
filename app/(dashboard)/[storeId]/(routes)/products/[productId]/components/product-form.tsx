"use client";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useOrigin } from "@/hooks/use-origin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Image, Product, Catalogue } from "@prisma/client";
import axios from "axios";
import { Trash, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string(), key: z.string() }).array(),
    price: z.number().min(1),
    quantity: z.number().min(1),
    description: z.string().min(1).optional(),
    categories: z.array(z.string()).default([]),
    catalogues: z.array(z.string()).default([]),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
});

type ProductFormValue = z.input<typeof formSchema>

interface ProductFormProps {
    initialData: Product & {
        images: Image[]
        categories: Category[];
        catalogues: Catalogue[];
    } | null;

    categories: Category[];
    catalogues: Catalogue[];
    
};


export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    catalogues
}) => {

    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Edit product" : "Create product"
    const description = initialData ? "Edit a product" : "Add a new product"
    const toastMessage = initialData ? "Product updated." : "Product create."
    const action = initialData ? "Save changes" : "Create"

    const form = useForm<ProductFormValue>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
            images: initialData.images.map(img => ({ url: img.url, key: img.key })),
            categories: initialData.categories.map(c => c.id),
            catalogues: initialData.catalogues.map(ct => ct.id),
        } : {
            name: '',
            images: [],
            price: 0,
            quantity: 0,
            description: '',
            catalogues: [],
            categories: [],
            isFeatured: false,
            isArchived: false,
        }
    });

    const onDelete = async () => {
        try {

            await axios.delete(`/api/${params.storeId}/products/${params.productsId}`);
            router.refresh();
            router.push(`/${params.storeId}/products`);
            toast.success("Product deleted")
        } catch (error) {
            toast.error("Something went wrong.");
        }
        finally {
            setLoading(false);
            setOpen(false);
        }
    }

    const onSubmit = async (data: ProductFormValue) => {
        try {
            setLoading(true)
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/products`, data);
            }

            router.refresh();
            router.push(`/${params.storeId}/products`)
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
                                <FormLabel>Images</FormLabel>
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
                                        maxFiles={5}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Product name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            type="number"
                                            placeholder="10.99"
                                            value={field.value}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                            step="0.01"
                                            min="0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading}
                                            type="number"
                                            placeholder="0"
                                            value={field.value}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            disabled={loading}
                                            placeholder="Product description"
                                            value={field.value}
                                            onChange={e => field.onChange(e.target.value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="categories"
                            render={({ field }) => {
                                const selected = categories.filter(c => field.value?.includes(c.id));
                                const toggle = (id: string) => {
                                    const next = field.value?.includes(id)
                                        ? field.value.filter(v => v !== id)
                                        : [...(field.value || []), id];
                                    field.onChange(next);
                                };
                                return (
                                    <FormItem>
                                        <FormLabel>Categories</FormLabel>
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    {/* Button acts as dropdown trigger; shows count of selected */}
                                                    <Button type="button" variant="outline" disabled={loading}>
                                                        {selected.length > 0 ? `${selected.length} selected` : "Select categories"}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-64">
                                                    <DropdownMenuLabel>Categories</DropdownMenuLabel>
                                                    {categories.map((c) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={c.id}
                                                            checked={field.value?.includes(c.id) || false}
                                                            onCheckedChange={() => toggle(c.id)}
                                                        >
                                                            {c.name}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>

                                        {/* Removable chips for selected categories */}
                                        {selected.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selected.map((c) => (
                                                    <Button
                                                        key={c.id}
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => toggle(c.id)}
                                                    >
                                                        {c.name}
                                                        <X className="ml-1 h-3 w-3" />
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {/* Add a new multi-select for Catalogues */}
                        <FormField
                            control={form.control}
                            name="catalogues"
                            render={({ field }) => {
                                const selected = catalogues.filter(ct => field.value?.includes(ct.id));
                                const toggle = (id: string) => {
                                    const next = field.value?.includes(id)
                                        ? field.value.filter(v => v !== id)
                                        : [...(field.value || []), id];
                                    field.onChange(next);
                                };
                                return (
                                    <FormItem>
                                        <FormLabel>Catalogues</FormLabel>
                                        <FormControl>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button type="button" variant="outline" disabled={loading}>
                                                        {selected.length > 0 ? `${selected.length} selected` : "Select catalogues"}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-64">
                                                    <DropdownMenuLabel>Catalogues</DropdownMenuLabel>
                                                    {catalogues.map((ct) => (
                                                        <DropdownMenuCheckboxItem
                                                            key={ct.id}
                                                            checked={field.value?.includes(ct.id) || false}
                                                            onCheckedChange={() => toggle(ct.id)}
                                                        >
                                                            {ct.label}
                                                        </DropdownMenuCheckboxItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </FormControl>

                                        {/* Removable chips for selected catalogues */}
                                        {selected.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selected.map((ct) => (
                                                    <Button
                                                        key={ct.id}
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => toggle(ct.id)}
                                                    >
                                                        {ct.label}
                                                        <X className="ml-1 h-3 w-3" />
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
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
                                            This product will appear on the home page
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
                                            This product will appear anywhere in the store
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