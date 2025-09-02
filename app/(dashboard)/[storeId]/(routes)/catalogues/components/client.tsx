"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Catalogue } from "@prisma/client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CatalogueColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface CatalogueClientProps{
    data: CatalogueColumn[]
}

export const CatalogueClient:React.FC<CatalogueClientProps> = ({
    data
})=>{

    const router = useRouter();
    const params = useParams();

    return(
        <>
            <div className="flex items-center justify-between">
                <Heading
                title={`Catalogues (${data.length}) `}
                    description="Manage catalogues for your store"
                />
                <Button onClick={()=>router.push(`/${params.storeId}/catalogues/new`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>
            <Separator />
            <DataTable columns={columns} data={data} searchKey="label"/>
            <Heading title="API" description="API calls for Catalogues" />
            <ApiList enityName="catalogues" entityIdName="catalogueId"/>
        </>
    )
}