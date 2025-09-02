import { s3 } from "@/lib/s3Client";
import { DeleteBucketCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function DELETE(req: Request) {

    try {

        const { userId } = await auth();
        const body = await req.json();

        const key = body.key

        if (!key) {
            return NextResponse.json("Invalid request body", { status: 400 });
        }

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        const command = new DeleteObjectCommand({
            Bucket:process.env.S3_BUCKET_NAME,
            Key:key
        })

        await s3.send(command);

        return NextResponse.json("File deleted successfully",{status:200})

    } catch (error) {
        console.log('[PRODUCTS_POST]', error)
        return new NextResponse("Internal error", { status: 500 });
    }

}