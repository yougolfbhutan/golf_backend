import 'dotenv/config';
import { createHash } from 'crypto';

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

console.log('cloud name  :', JSON.stringify(cloud));
console.log(
  'api key     :',
  key
    ? `${key.slice(0, 3)}...${key.slice(-3)} (length ${key.length})`
    : 'MISSING',
);
console.log(
  'api secret  :',
  secret ? `set (length ${secret.length})` : 'MISSING',
);

if (!cloud || !key || !secret) {
  console.error('One or more CLOUDINARY_* variables are missing from .env');
  process.exit(1);
}

const timestamp = Math.floor(Date.now() / 1000);
const folder = 'test';
const signature = createHash('sha1')
  .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
  .digest('hex');

// 1x1 transparent PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const form = new FormData();
form.append(
  'file',
  new Blob([new Uint8Array(png)], { type: 'image/png' }),
  'test.png',
);
form.append('api_key', key);
form.append('timestamp', String(timestamp));
form.append('folder', folder);
form.append('signature', signature);

async function main(): Promise<void> {
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    {
      method: 'POST',
      body: form,
    },
  );
  console.log('\nHTTP status :', res.status);
  console.log('response    :', await res.text());
}

main().catch((err) => console.error('Request failed:', err));
