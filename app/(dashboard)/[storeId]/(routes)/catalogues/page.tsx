import prismadb from "@/lib/prismadb";
import { CatalogueClient } from "./components/client";
import { CatalogueColumn } from "./components/columns";
import {format} from "date-fns";

const CataloguesPage = async ({ params }: {
    params: { storeId: string }
}) => {
    const {storeId} = await params
    const catalogues = await prismadb.catalogue.findMany(
        {
            where: {
                storeId: storeId
            },
            include: { images: true },
            
            orderBy:{
                createdAt:'desc'
            }
        }
    );

    const formatedCatalogue :CatalogueColumn[] = catalogues.map((item)=>({
        id:item.id,
        isArchived: item.isArchived,
        isFeatured: item.isFeatured,
        label: item.label,
        createdAt: format(item.createdAt,"MMMM do, yyyy"),
    })) 

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CatalogueClient data={formatedCatalogue }/>
            </div>
        </div>
    );
}

export default CataloguesPage;