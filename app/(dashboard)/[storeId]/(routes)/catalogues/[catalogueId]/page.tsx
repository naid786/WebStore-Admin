import prismadb from "@/lib/prismadb";
import { CatalogueForm } from "./components/catalogue-form";

const CataloguePage = async ({
    params
}: {
    params: { catalogueId: string }
}) => {

    const { catalogueId } = await params;
    const catalogue = await prismadb.catalogue.findUnique({
        where: { id: catalogueId },
        include: { images: true }
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CatalogueForm initialData={catalogue} />
            </div>
        </div>
    );
}

export default CataloguePage;