import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;

function requireAuthHeaders() {
  if (PINATA_JWT) {
    return { Authorization: `Bearer ${PINATA_JWT}` };
  }
  if (PINATA_API_KEY && PINATA_SECRET) {
    return {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET,
    } as Record<string, string>;
  }
  throw new Error('Pinata credentials missing. Set PINATA_JWT or PINATA_API_KEY + PINATA_SECRET');
}

function b64ToBlob(base64Data: string) {
  const [meta, content] = base64Data.split(',');
  const bytes = Buffer.from(content, 'base64');
  const match = /data:(.*?);/.exec(meta || '');
  const mime = match ? match[1] : 'application/octet-stream';
  // Node 18 has global Blob and File via undici
  return new Blob([bytes], { type: mime });
}

export async function POST(req: NextRequest) {
  try {
    const { title, proofHash, imageBase64 } = await req.json();
    if (!title || !proofHash) {
      return NextResponse.json({ error: 'title and proofHash required' }, { status: 400 });
    }

    const authHeaders = requireAuthHeaders();

    // 1) Optional: upload image to Pinata (pinFileToIPFS)
    let imageUri: string | undefined;
    if (imageBase64) {
      const form = new FormData();
      const blob = b64ToBlob(imageBase64);
      form.append('file', blob, 'proof');
      const pinRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: authHeaders as any,
        body: form,
      });
      if (!pinRes.ok) {
        const t = await pinRes.text();
        return NextResponse.json({ error: 'Pinata file upload failed: ' + t }, { status: 500 });
      }
      const pinJson = await pinRes.json();
      const cid = pinJson.IpfsHash || pinJson.cid || pinJson.hash;
      imageUri = `ipfs://${cid}`;
    }

    // 2) Upload metadata JSON (pinJSONToIPFS)
    const now = new Date().toISOString();
    const metadata = {
      name: title,
      description: `Proof-of-accomplishment minted via ProofMint at ${now}`,
      image: imageUri,
      attributes: [
        { trait_type: 'ProofHash', value: proofHash },
        { trait_type: 'Timestamp', value: now }
      ]
    };

    const metaRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeaders as any),
      },
      body: JSON.stringify({ pinataContent: metadata }),
    });
    if (!metaRes.ok) {
      const t = await metaRes.text();
      return NextResponse.json({ error: 'Pinata JSON upload failed: ' + t }, { status: 500 });
    }
    const metaJson = await metaRes.json();
    const metaCid = metaJson.IpfsHash || metaJson.cid || metaJson.hash;
    const metadataURI = `ipfs://${metaCid}`;

    return NextResponse.json({ metadataURI });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'Pinata upload failed' }, { status: 500 });
  }
}
