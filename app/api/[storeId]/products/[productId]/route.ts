import prismadb from "@/lib/prismadb";
import { s3 } from "@/lib/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { productId: string } }
) {
    try {

        const {productId} = await params
        if (!productId) {
            return new NextResponse("ProductId is required", { status: 400 })
        }

        const product = await prismadb.product.findUnique({
            where: {
                id: productId,
            },
            include:{
                images: true,
                catalogues: true,
                categories: true,
            }
        });

        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCT_GET]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {

        const { userId } = await auth();
        const body = await req.json();
        const { productId,storeId } = await params
        const { name, price, categories, catalogues, description, quantity, images, isFeatured, isArchived } = body;

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

        if (!storeId) {
            return new NextResponse("StoreId is required", { status: 400 })
        }        

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        await prismadb.product.update({
            where: {
                id: productId,
            },
            data: {
                name,
                price,
                quantity,
                description,
                isFeatured,
                isArchived,
                storeId: storeId,
                images: {
                    deleteMany: {}
                },
                catalogues: {
                    disconnect: catalogues.map((id: string) => ({ id })),
                    connect: catalogues.map((id: string) => ({ id }))
                },
                categories: {
                    disconnect: categories.map((id: string) => ({ id })),
                    connect: categories.map((id: string) => ({ id }))
                },
            }
        });

        const product = await prismadb.product.update({
            where: {
                id: productId,
            },
            data:{
                images:{
                    createMany:{
                        data:[
                            ...images.map((image: { url: string, key: string }) => image)
                        ]
                    }
                }
            }
        })

        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCT_PATCH]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, productId: string } }
) {
    try {

        const { userId } = await auth();
        const { productId, storeId } = await params
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }


        if (!productId) {
            return new NextResponse("ProductId is required", { status: 400 })
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

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        // Get all images linked to this billboard
                const images = await prismadb.image.findMany({
                    where: {
                        productId: productId,
                    }
                });
        
                for (const image of images) {
                    const command = new DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: image.key
                    })
        
                    await s3.send(command);
                }

        const product = await prismadb.product.deleteMany({
            where: {
                id: productId,
            }
        });

        return NextResponse.json(product)

    } catch (error) {
        console.log('[PRODUCT_DELETE]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}