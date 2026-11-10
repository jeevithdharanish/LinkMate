import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import uniqid from "uniqid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf' // for resume uploads
];

// Extension is derived from the validated type, never from the client filename.
const EXTENSIONS = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'application/pdf': 'pdf',
};

// The declared MIME type is client-controlled; check the file's magic bytes match it.
function contentMatchesType(buf, type) {
  const ascii = (start, end) => buf.subarray(start, end).toString('latin1');
  switch (type) {
    case 'image/jpeg': return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'image/png': return buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/gif': return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a';
    case 'image/webp': return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case 'application/pdf': return ascii(0, 5) === '%PDF-';
    default: return false;
  }
}

export async function POST(req) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();

    if (formData.has('file')) {
      const file = formData.get('file');

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json(
          { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      const s3Client = new S3Client({
        region: 'ap-south-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
      });

      const randomId = uniqid();
      const newFilename = randomId + '.' + EXTENSIONS[file.type];
      const bucketName = process.env.BUCKET_NAME;

      const chunks = [];
      for await (const chunk of file.stream()) {
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks);

      if (body.length > MAX_FILE_SIZE || !contentMatchesType(body, file.type)) {
        return Response.json(
          { error: `File content does not match its type (${file.type}) or is too large.` },
          { status: 400 }
        );
      }

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: newFilename,
        ACL: 'public-read',
        Body: body,
        ContentType: file.type,
      }));

      const link = `https://${bucketName}.s3.ap-south-1.amazonaws.com/${newFilename}`;
      return Response.json(link);
    }

    return Response.json({ error: 'No file provided' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
