import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { storeId: string }}) {
    try {
        const { userId } = await auth();
        const body = await req.json();

        const { name, isFeatured, isArchived } = body;
        const {storeId} = await params
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
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

        const category = await prismadb.category.create({
            data: {
                name,
                storeId: storeId,
                isFeatured,
                isArchived,
            }
        });

        return NextResponse.json(category)

    } catch (error) {
        console.log('[CATEGORIES_POST]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string }}) {
    try {
        
        const { storeId } = await params

        if (!storeId) {
            return new NextResponse("StoreId is required", { status: 400 })
        }

        const categories = await prismadb.category.findMany({
            where: {
                storeId:storeId,
            }
        });

        return NextResponse.json(categories)

    } catch (error) {
        console.log('[CATEGORIES_GET]', error)
        return new NextResponse("Internal error", { status: 500 })
    }
}
