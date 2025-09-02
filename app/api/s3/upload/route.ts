import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3Client";

const uploadRequestSchema = z.object({
    fileName: z.string(),
    contentType: z.string(),
    size: z.number(),
})

const provider = "https://file-webstore.t3.storageapi.dev/"

export async function POST(req: Request) {

    try {
        const { userId } = await auth();
        const body = await req.json();

        const validation = uploadRequestSchema.safeParse(body);

        if (!validation.success){
            return NextResponse.json("Invalid request body",{status:400});
        }

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        const {contentType,fileName,size} = validation.data;

        const uniqueKey = `${uuidv4()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: uniqueKey,
            ContentType:contentType,
            ContentLength:size,
        })

        const presignedUrl = await getSignedUrl(s3,command,{
            expiresIn:360
        });

        const response ={
            presignedUrl,
            key:uniqueKey,
            url:provider+uniqueKey
        };

        return NextResponse.json(response,{status:200})

    } catch (error) {
        console.log('[IMAGE_UPLOAD_ERROR]', error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (!key) {
            return new NextResponse("Image key is required", { status: 400 });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });

        const url = await getSignedUrl(s3, command);

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error('[IMAGE_RETRIEVAL_ERROR]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}