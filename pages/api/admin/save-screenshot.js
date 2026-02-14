// Temporary API endpoint for saving help screenshots
// DELETE THIS FILE after screenshots are captured
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename, dataUrl } = req.body;

  if (!filename || !dataUrl) {
    return res.status(400).json({ error: 'Missing filename or dataUrl' });
  }

  // Sanitize filename
  const safeName = filename.replace(/[^a-zA-Z0-9\-_.]/g, '');
  const outputDir = path.join(process.cwd(), 'public', 'help');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Extract base64 data
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  const filePath = path.join(outputDir, safeName);

  fs.writeFileSync(filePath, base64Data, 'base64');

  return res.status(200).json({ success: true, path: `/help/${safeName}` });
}
