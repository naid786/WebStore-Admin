import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { storeId: string }}) {
    try {
        const { userId } = await auth();
        const body = await req.json();

        const { name,price,categoryId,catalogueId,description,quantity,images,isFeatured,isArchived } = body;
        const { storeId } = await params

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }

        if (!price) {
            return new NextResponse("Price is required", { status: 400 })
        }

        if (!quantity) {
            return new NextResponse("Quantity is required", { status: 400 })
        }

        if (!categoryId) {
            return new NextResponse("CategoryId is required", { status: 400 })
        }

        if (!catalogueId) {
            return new NextResponse("CatalogueId is required", { status: 400 })
        }

        if (!storeId) {
            return new NextResponse("StoreId is required", { status: 400 })
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId){
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                isFeatured,
                isArchived,
                quantity,
                storeId: storeId,
                categories: {
                    connect: [
                        ...categoryId.map((id: string) => ({ id }))
                    ]
                },
                catalogues: {
                    connect: [
                        ...catalogueId.map((id: string) => ({ id }))
                    ]
                },
                description,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string, key: string }) => image)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCTS_POST]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string }}) {
    try {
        
        const {searchParams} = new URL(req.url);
        const isFeatured = searchParams.get("isFeatured") ;
        const catalogues = searchParams.getAll("catalogues");
        const categories = searchParams.getAll("categories");
        const { storeId } = await params
        if (!storeId) {
            return new NextResponse("StoreId  is required", { status: 400 })
        }

        const products = await prismadb.product.findMany({
            where: {
            storeId: storeId,
            isFeatured: isFeatured ? true : undefined,
            isArchived: false,
            catalogues: catalogues.length > 0 ? {
                some: {
                id: { in: catalogues }
                }
            } : undefined,
            categories: categories.length > 0 ? {
                some: {
                id: { in: categories }
                }
            } : undefined,
            },
            include: {
            images: true,
            },
            orderBy: {
            createdAt: 'desc'
            }
        });

        return NextResponse.json(products)

    } catch (error) {
        console.log('[PRODUCTS_GET]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}
