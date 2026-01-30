# n8n-nodes-cloudconvert

This is an n8n community node for [CloudConvert](https://cloudconvert.com) - a powerful file conversion API that supports 200+ formats.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

This node provides full access to the CloudConvert API v2, including:

### Resources & Operations

#### Job
- **Create** - Create a new conversion job with multiple tasks
- **Get** - Retrieve job details by ID
- **Get Many** - List all jobs with filtering
- **Delete** - Delete a job
- **Wait** - Wait for a job to complete (sync API)

#### Task
- **Create** - Create individual tasks (convert, import, export, etc.)
- **Get** - Retrieve task details by ID
- **Get Many** - List all tasks with filtering
- **Delete** - Delete a task
- **Cancel** - Cancel a running task
- **Retry** - Retry a failed task
- **Wait** - Wait for a task to complete (sync API)

#### File Operations
- **Convert** - Convert files between 200+ formats (PDF, DOCX, JPG, PNG, MP4, etc.)
- **Capture Website** - Screenshot websites as PDF, PNG, JPG, or WebP
- **Create Thumbnail** - Generate thumbnails from images or videos
- **Add Watermark** - Add text or image watermarks
- **Merge** - Merge multiple PDF files into one
- **Create Archive** - Create ZIP, RAR, TAR, 7Z archives

#### Operation
- **Get Formats** - List all available conversion formats and operations

#### User
- **Get Me** - Get current user information and credits

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-cloudconvert`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-cloudconvert
```

## Credentials

To use this node, you need a CloudConvert API key:

1. Sign up at [CloudConvert](https://cloudconvert.com/register)
2. Go to [API Settings](https://cloudconvert.com/dashboard/api/v2/keys)
3. Create a new API key with the required scopes
4. Copy the API key

### Available Scopes

- `user.read` - Read user information
- `task.read` - Read tasks
- `task.write` - Create and manage tasks
- `webhook.read` - Read webhooks
- `webhook.write` - Create webhooks

### Sandbox Mode

CloudConvert provides a sandbox environment for testing. Enable "Sandbox Mode" in the credentials to use the sandbox API (api.sandbox.cloudconvert.com).

## Usage Examples

### Convert PDF to JPG

1. Add a CloudConvert node
2. Select **File** resource and **Convert** operation
3. Set input source to **URL** and provide the PDF URL
4. Set output format to **jpg**
5. Enable **Wait for Completion** to get the result immediately
6. Optionally enable **Download Result** to get the file as binary data

### Capture Website Screenshot

1. Add a CloudConvert node
2. Select **File** resource and **Capture Website** operation
3. Enter the website URL
4. Choose output format (PDF, PNG, JPG, WebP)
5. Configure capture options (full page, screen size, etc.)

### Create a Conversion Job

1. Add a CloudConvert node
2. Select **Job** resource and **Create** operation
3. Define tasks in JSON format:

```json
{
  "import-file": {
    "operation": "import/url",
    "url": "https://example.com/document.pdf"
  },
  "convert-file": {
    "operation": "convert",
    "input": "import-file",
    "output_format": "jpg",
    "pages": "1-5"
  },
  "export-file": {
    "operation": "export/url",
    "input": "convert-file"
  }
}
```

### Merge PDF Files

1. First, import your PDF files using separate CloudConvert nodes or HTTP Request nodes
2. Add a CloudConvert node with **File** > **Merge** operation
3. Enter the task IDs of the imported files
4. The merged PDF will be exported

## Supported Formats

CloudConvert supports 200+ formats including:

- **Documents**: PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, ODT, RTF, TXT, HTML
- **Images**: JPG, PNG, GIF, BMP, TIFF, WebP, SVG, ICO, HEIC
- **Video**: MP4, AVI, MOV, MKV, WebM, FLV, WMV
- **Audio**: MP3, WAV, AAC, FLAC, OGG, WMA
- **Archives**: ZIP, RAR, 7Z, TAR, TAR.GZ
- **eBooks**: EPUB, MOBI, AZW
- **CAD**: DWG, DXF

See the [full list of supported formats](https://cloudconvert.com/formats).

## API Rate Limits

CloudConvert has the following rate limits:

- **Concurrent Jobs**: 5 (Free) / 100+ (Paid)
- **Minutes per day**: 25 (Free) / Unlimited (Paid)

See [CloudConvert Pricing](https://cloudconvert.com/pricing) for details.

## Resources

- [CloudConvert API Documentation](https://cloudconvert.com/api/v2)
- [CloudConvert Dashboard](https://cloudconvert.com/dashboard)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)

## Author

Created by [Ammar Alshuaibi](https://github.com/Ammar-Alshuaibi)
