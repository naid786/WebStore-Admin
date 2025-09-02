import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { storeId: string }}) {
    try {
        const { userId } = await auth();
        const body = await req.json();

        const { label, images, isArchived, isFeatured } = body;
        const {storeId} = await params
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!label) {
            return new NextResponse("Label is required", { status: 400 })
        }

        if (!images) {
            return new NextResponse("Image URL is required", { status: 400 })
        }

        if (!await storeId) {
            return new NextResponse("StoreId is required", { status: 400 })
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: await storeId,
                userId
            }
        });

        if (!storeByUserId){
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const catalogue = await prismadb.catalogue.create({
            data: {
                label,
                storeId: await storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string, key: string }) => image)
                        ]
                    }
                },
                isArchived,
                isFeatured,
            }
        });

        return NextResponse.json(catalogue)

    } catch (error) {
        console.log('[CATALOGUES_POST]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string }}) {
    try {
        
        const {storeId} = await params
        const { searchParams } = new URL(req.url);
        const isFeatured = searchParams.get("isFeatured");
        if (!await storeId) {
            return new NextResponse("StoreId  is required", { status: 400 })
        }

        const catalogues = await prismadb.catalogue.findMany({
            where: {
                storeId:await storeId,
                isFeatured: isFeatured ? true : undefined,
            },include: {
                images: true
            }
        });

        return NextResponse.json(catalogues)

    } catch (error) {
        console.log('[CATALOGUES_GET]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}
