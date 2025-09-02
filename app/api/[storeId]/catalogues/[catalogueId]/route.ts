import prismadb from "@/lib/prismadb";
import { s3 } from "@/lib/s3Client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: { catalogueId: string } }
) {
    try {

        const param = await params
        if (! param.catalogueId) {
            return new NextResponse("CatalogueId is required", { status: 400 })
        }

        const catalogue = await prismadb.catalogue.findUnique({
            where: {
                id: await param.catalogueId,
            },
            include:{
                images:true
            }
        });

        return NextResponse.json(catalogue)

    } catch (error) {
        console.log('[CATALOGUE_GET]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, catalogueId: string } }
) {
    try {

        const { userId } = await auth();
        const body = await req.json();

        const { label, images, isArchived, isFeatured } = body;
        const { storeId, catalogueId } = await params
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!label) {
            return new NextResponse("Label is required", { status: 400 })
        }

        if (!images) {
            return new NextResponse("ImageUrl is required", { status: 400 })
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

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        await prismadb.catalogue.update({
            where: {
                id: catalogueId,
            },
            data: {
                label, 
                images: {
                    deleteMany: {}
                },
                isArchived,
                isFeatured,
            }
        });

        const catalogue = await prismadb.catalogue.update({
            where: {
                id: catalogueId,
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string, key: string }) => image)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(catalogue)

    } catch (error) {
        console.log('[CATALOGUE_PATCH]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, catalogueId: string } }
) {
    try {

        const { userId } = await auth();
        const { storeId, catalogueId } = await params
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if (!catalogueId) {
            return new NextResponse("BillboardId is required", { status: 400 })
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

        // Get all images linked to this catalogue
        const images = await prismadb.catalogueImage.findMany({
            where: {
                catalogueId: catalogueId,
            }
        });

        for (const image of images) {
            const command = new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: image.key
            })

            await s3.send(command);
        }

        // Then delete the catalogue
        const catalogue = await prismadb.catalogue.deleteMany({
            where: {
                id: catalogueId,
            }
        });

        return NextResponse.json(catalogue)

    } catch (error) {
        console.log('[CATALOGUE_DELETE]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}