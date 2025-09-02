import prismadb from "@/lib/prismadb";

export const getStockCount = async (storeId: string) => {
    const products = await prismadb.product.findMany({
        where: {
            storeId,
            isArchived: false,
        },
        select: {
            quantity: true,
        },
    });

    const totalQuantity = products.reduce((sum, product) => sum + (product.quantity ?? 0), 0);
    return totalQuantity;
}