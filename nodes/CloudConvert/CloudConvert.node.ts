import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	cloudConvertApiRequest,
	cloudConvertApiRequestAllItems,
	getFormats,
	getJobs,
	getTasks,
} from './GenericFunctions';

export class CloudConvert implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CloudConvert Complete',
		name: 'cloudConvertComplete',
		icon: 'file:cloudconvert.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Convert files with CloudConvert API',
		defaults: {
			name: 'CloudConvert Complete',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'cloudConvertApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Job',
						value: 'job',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Operation',
						value: 'operation',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'job',
			},

			// ==================== JOB OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new job with tasks',
						action: 'Create a job',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a job',
						action: 'Delete a job',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a job by ID',
						action: 'Get a job',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many jobs',
						action: 'Get many jobs',
					},
					{
						name: 'Wait',
						value: 'wait',
						description: 'Wait for a job to complete',
						action: 'Wait for a job',
					},
				],
				default: 'create',
			},

			// ==================== TASK OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['task'],
					},
				},
				options: [
					{
						name: 'Cancel',
						value: 'cancel',
						description: 'Cancel a task',
						action: 'Cancel a task',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a task',
						action: 'Create a task',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a task',
						action: 'Delete a task',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a task by ID',
						action: 'Get a task',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many tasks',
						action: 'Get many tasks',
					},
					{
						name: 'Retry',
						value: 'retry',
						description: 'Retry a failed task',
						action: 'Retry a task',
					},
					{
						name: 'Wait',
						value: 'wait',
						description: 'Wait for a task to complete',
						action: 'Wait for a task',
					},
				],
				default: 'get',
			},

			// ==================== FILE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'Convert',
						value: 'convert',
						description: 'Convert a file from one format to another',
						action: 'Convert a file',
					},
					{
						name: 'Capture Website',
						value: 'captureWebsite',
						description: 'Capture a website as PDF or image',
						action: 'Capture a website',
					},
					{
						name: 'Create Archive',
						value: 'archive',
						description: 'Create an archive from files',
						action: 'Create an archive',
					},
					{
						name: 'Create Thumbnail',
						value: 'thumbnail',
						description: 'Create a thumbnail from an image or video',
						action: 'Create a thumbnail',
					},
					{
						name: 'Merge',
						value: 'merge',
						description: 'Merge multiple PDF files',
						action: 'Merge files',
					},
					{
						name: 'Watermark',
						value: 'watermark',
						description: 'Add a watermark to images or videos',
						action: 'Add watermark',
					},
				],
				default: 'convert',
			},

			// ==================== OPERATION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['operation'],
					},
				},
				options: [
					{
						name: 'Get Formats',
						value: 'getFormats',
						description: 'Get available conversion formats',
						action: 'Get available formats',
					},
				],
				default: 'getFormats',
			},

			// ==================== USER OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get Me',
						value: 'getMe',
						description: 'Get current user information',
						action: 'Get current user',
					},
				],
				default: 'getMe',
			},

			// ==================== JOB FIELDS ====================
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['get', 'delete', 'wait'],
					},
				},
				description: 'The ID of the job',
			},
			{
				displayName: 'Tasks',
				name: 'tasks',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['create'],
					},
				},
				description: 'The tasks to be executed in the job (JSON object)',
				placeholder: `{
  "import-my-file": {
    "operation": "import/url",
    "url": "https://example.com/file.pdf"
  },
  "convert-my-file": {
    "operation": "convert",
    "input": "import-my-file",
    "output_format": "jpg"
  },
  "export-my-file": {
    "operation": "export/url",
    "input": "convert-my-file"
  }
}`,
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['getAll'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Tag',
						name: 'tag',
						type: 'string',
						default: '',
						description: 'A tag to identify the job',
					},
					{
						displayName: 'Webhook URL',
						name: 'webhook_url',
						type: 'string',
						default: '',
						description: 'URL to send webhook notifications',
					},
					{
						displayName: 'Webhook Events',
						name: 'webhook_events',
						type: 'multiOptions',
						options: [
							{ name: 'Job Created', value: 'job.created' },
							{ name: 'Job Finished', value: 'job.finished' },
							{ name: 'Job Failed', value: 'job.failed' },
						],
						default: [],
						description: 'Events that trigger webhook notifications',
					},
				],
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Waiting', value: 'waiting' },
							{ name: 'Processing', value: 'processing' },
							{ name: 'Finished', value: 'finished' },
							{ name: 'Error', value: 'error' },
						],
						default: '',
						description: 'Filter jobs by status',
					},
					{
						displayName: 'Tag',
						name: 'tag',
						type: 'string',
						default: '',
						description: 'Filter jobs by tag',
					},
				],
			},

			// ==================== TASK FIELDS ====================
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['get', 'delete', 'cancel', 'retry', 'wait'],
					},
				},
				description: 'The ID of the task',
			},
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				options: [
					{ name: 'Convert', value: 'convert' },
					{ name: 'Export URL', value: 'export/url' },
					{ name: 'Import URL', value: 'import/url' },
					{ name: 'Import Upload', value: 'import/upload' },
					{ name: 'Capture Website', value: 'capture-website' },
					{ name: 'Watermark', value: 'watermark' },
					{ name: 'Thumbnail', value: 'thumbnail' },
					{ name: 'Merge', value: 'merge' },
					{ name: 'Archive', value: 'archive' },
				],
				default: 'convert',
				description: 'The type of task to create',
			},
			{
				displayName: 'Task Data',
				name: 'taskData',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
					},
				},
				description: 'Task configuration as JSON',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Waiting', value: 'waiting' },
							{ name: 'Processing', value: 'processing' },
							{ name: 'Finished', value: 'finished' },
							{ name: 'Error', value: 'error' },
						],
						default: '',
						description: 'Filter tasks by status',
					},
					{
						displayName: 'Operation',
						name: 'operation',
						type: 'string',
						default: '',
						description: 'Filter tasks by operation type (e.g., convert, import/url)',
					},
					{
						displayName: 'Job ID',
						name: 'job_id',
						type: 'string',
						default: '',
						description: 'Filter tasks by job ID',
					},
				],
			},

			// ==================== FILE CONVERT FIELDS ====================
			{
				displayName: 'Input Source',
				name: 'inputSource',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert', 'thumbnail', 'watermark', 'archive'],
					},
				},
				options: [
					{
						name: 'URL',
						value: 'url',
						description: 'Import file from URL',
					},
					{
						name: 'Task ID',
						value: 'task',
						description: 'Use output from another task',
					},
					{
						name: 'Binary Data',
						value: 'binary',
						description: 'Upload binary data from workflow',
					},
				],
				default: 'url',
			},
			{
				displayName: 'File URL',
				name: 'fileUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert', 'thumbnail', 'watermark', 'archive'],
						inputSource: ['url'],
					},
				},
				description: 'URL of the file to process',
				placeholder: 'https://example.com/file.pdf',
			},
			{
				displayName: 'Input Task ID',
				name: 'inputTaskId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert', 'thumbnail', 'watermark', 'archive'],
						inputSource: ['task'],
					},
				},
				description: 'ID of the task whose output to use as input',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryProperty',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert', 'thumbnail', 'watermark', 'archive'],
						inputSource: ['binary'],
					},
				},
				description: 'Name of the binary property containing the file',
			},
			{
				displayName: 'Input Format',
				name: 'inputFormat',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert'],
					},
				},
				description: 'The input format (e.g., pdf, docx). Leave empty to auto-detect.',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'string',
				default: 'pdf',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert'],
					},
				},
				description: 'The output format to convert to (e.g., pdf, jpg, png, docx)',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert', 'captureWebsite', 'thumbnail', 'watermark', 'archive', 'merge'],
					},
				},
				description: 'Whether to wait for the conversion to complete before returning',
			},
			{
				displayName: 'Download Result',
				name: 'downloadResult',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert', 'captureWebsite', 'thumbnail', 'watermark', 'archive', 'merge'],
						waitForCompletion: [true],
					},
				},
				description: 'Whether to download the converted file as binary data',
			},
			{
				displayName: 'Conversion Options',
				name: 'conversionOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['convert'],
					},
				},
				options: [
					{
						displayName: 'Filename',
						name: 'filename',
						type: 'string',
						default: '',
						description: 'Override output filename',
					},
					{
						displayName: 'Quality',
						name: 'quality',
						type: 'number',
						default: 75,
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						description: 'Quality for image conversions (1-100)',
					},
					{
						displayName: 'Page Range',
						name: 'page_range',
						type: 'string',
						default: '',
						description: 'Page range for PDF conversions (e.g., 1-5)',
					},
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						default: 0,
						description: 'Output width in pixels',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						default: 0,
						description: 'Output height in pixels',
					},
					{
						displayName: 'DPI',
						name: 'dpi',
						type: 'number',
						default: 0,
						description: 'DPI for conversions',
					},
					{
						displayName: 'Sheet (Excel)',
						name: 'sheet',
						type: 'number',
						default: 0,
						description: 'Which sheet to convert (1-based index). Set to 0 to use all_sheets option instead.',
					},
					{
						displayName: 'All Sheets (Excel)',
						name: 'all_sheets',
						type: 'boolean',
						default: false,
						description: 'Whether to convert all sheets from Excel file (creates multiple output files)',
					},
					{
						displayName: 'Sheet Name (Excel)',
						name: 'sheet_name',
						type: 'string',
						default: '',
						description: 'Convert a specific sheet by name (e.g., "Sheet2"). Takes precedence over sheet number.',
					},
				],
			},

			// ==================== CAPTURE WEBSITE FIELDS ====================
			{
				displayName: 'Website URL',
				name: 'websiteUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['captureWebsite'],
					},
				},
				placeholder: 'https://example.com',
				description: 'URL of the website to capture',
			},
			{
				displayName: 'Output Format',
				name: 'captureFormat',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['captureWebsite'],
					},
				},
				options: [
					{ name: 'PDF', value: 'pdf' },
					{ name: 'PNG', value: 'png' },
					{ name: 'JPG', value: 'jpg' },
					{ name: 'WebP', value: 'webp' },
				],
				default: 'pdf',
			},
			{
				displayName: 'Capture Options',
				name: 'captureOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['captureWebsite'],
					},
				},
				options: [
					{
						displayName: 'Filename',
						name: 'filename',
						type: 'string',
						default: '',
						description: 'Output filename without extension',
					},
					{
						displayName: 'Width',
						name: 'screen_width',
						type: 'number',
						default: 1440,
						description: 'Screen width in pixels',
					},
					{
						displayName: 'Height',
						name: 'screen_height',
						type: 'number',
						default: 900,
						description: 'Screen height in pixels',
					},
					{
						displayName: 'Full Page',
						name: 'full_page',
						type: 'boolean',
						default: true,
						description: 'Whether to capture the full page',
					},
					{
						displayName: 'Wait Until',
						name: 'wait_until',
						type: 'options',
						options: [
							{ name: 'Load', value: 'load' },
							{ name: 'DOM Content Loaded', value: 'domcontentloaded' },
							{ name: 'Network Idle 0', value: 'networkidle0' },
							{ name: 'Network Idle 2', value: 'networkidle2' },
						],
						default: 'load',
					},
					{
						displayName: 'Wait Time (ms)',
						name: 'wait_time',
						type: 'number',
						default: 0,
						description: 'Additional time to wait in milliseconds',
					},
				],
			},

			// ==================== THUMBNAIL FIELDS ====================
			{
				displayName: 'Thumbnail Format',
				name: 'thumbnailFormat',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['thumbnail'],
					},
				},
				options: [
					{ name: 'PNG', value: 'png' },
					{ name: 'JPG', value: 'jpg' },
					{ name: 'WebP', value: 'webp' },
				],
				default: 'png',
			},
			{
				displayName: 'Thumbnail Options',
				name: 'thumbnailOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['thumbnail'],
					},
				},
				options: [
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						default: 300,
						description: 'Thumbnail width',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						default: 300,
						description: 'Thumbnail height',
					},
					{
						displayName: 'Fit',
						name: 'fit',
						type: 'options',
						options: [
							{ name: 'Contain', value: 'contain' },
							{ name: 'Cover', value: 'cover' },
							{ name: 'Fill', value: 'fill' },
							{ name: 'Inside', value: 'inside' },
							{ name: 'Outside', value: 'outside' },
						],
						default: 'contain',
					},
				],
			},

			// ==================== WATERMARK FIELDS ====================
			{
				displayName: 'Watermark Type',
				name: 'watermarkType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['watermark'],
					},
				},
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Image', value: 'image' },
				],
				default: 'text',
			},
			{
				displayName: 'Watermark Text',
				name: 'watermarkText',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['watermark'],
						watermarkType: ['text'],
					},
				},
			},
			{
				displayName: 'Watermark Image URL',
				name: 'watermarkImageUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['watermark'],
						watermarkType: ['image'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'watermarkOutputFormat',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['watermark'],
					},
				},
				options: [
					{ name: 'PNG', value: 'png' },
					{ name: 'JPG', value: 'jpg' },
					{ name: 'WebP', value: 'webp' },
					{ name: 'PDF', value: 'pdf' },
				],
				default: 'png',
			},
			{
				displayName: 'Watermark Options',
				name: 'watermarkOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['watermark'],
					},
				},
				options: [
					{
						displayName: 'Position',
						name: 'layer_position',
						type: 'options',
						options: [
							{ name: 'Center', value: 'center' },
							{ name: 'Top Left', value: 'northwest' },
							{ name: 'Top Right', value: 'northeast' },
							{ name: 'Bottom Left', value: 'southwest' },
							{ name: 'Bottom Right', value: 'southeast' },
						],
						default: 'center',
					},
					{
						displayName: 'Opacity',
						name: 'layer_opacity',
						type: 'number',
						default: 50,
						typeOptions: {
							minValue: 0,
							maxValue: 100,
						},
					},
				],
			},

			// ==================== MERGE FIELDS ====================
			{
				displayName: 'Input Tasks',
				name: 'mergeTasks',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['merge'],
					},
				},
				description: 'Comma-separated list of task IDs to merge',
				placeholder: 'task-id-1, task-id-2, task-id-3',
			},
			{
				displayName: 'Output Format',
				name: 'mergeFormat',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['merge'],
					},
				},
				options: [
					{ name: 'PDF', value: 'pdf' },
				],
				default: 'pdf',
			},

			// ==================== ARCHIVE FIELDS ====================
			{
				displayName: 'Archive Format',
				name: 'archiveFormat',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['archive'],
					},
				},
				options: [
					{ name: 'ZIP', value: 'zip' },
					{ name: 'RAR', value: 'rar' },
					{ name: 'TAR', value: 'tar' },
					{ name: 'TAR.GZ', value: 'tar.gz' },
					{ name: '7Z', value: '7z' },
				],
				default: 'zip',
			},

			// ==================== OPERATION FILTERS ====================
			{
				displayName: 'Filters',
				name: 'operationFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['operation'],
						operation: ['getFormats'],
					},
				},
				options: [
					{
						displayName: 'Operation Type',
						name: 'operation',
						type: 'options',
						options: [
							{ name: 'All', value: '' },
							{ name: 'Convert', value: 'convert' },
							{ name: 'Archive', value: 'archive' },
							{ name: 'Capture Website', value: 'capture-website' },
							{ name: 'Merge', value: 'merge' },
							{ name: 'Thumbnail', value: 'thumbnail' },
							{ name: 'Watermark', value: 'watermark' },
						],
						default: '',
						description: 'Filter by operation type',
					},
					{
						displayName: 'Input Format',
						name: 'input_format',
						type: 'string',
						default: '',
						description: 'Filter by input format (e.g., pdf, docx)',
					},
					{
						displayName: 'Output Format',
						name: 'output_format',
						type: 'string',
						default: '',
						description: 'Filter by output format (e.g., jpg, png)',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getInputFormats(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getFormats.call(this);
			},
			async getOutputFormats(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const inputFormat = this.getCurrentNodeParameter('inputFormat') as string;
				return getFormats.call(this, inputFormat);
			},
			async getJobs(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getJobs.call(this);
			},
			async getTasks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return getTasks.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject = {};

				// ==================== JOB ====================
				if (resource === 'job') {
					if (operation === 'create') {
						const tasksJson = this.getNodeParameter('tasks', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						let tasks: IDataObject;
						try {
							tasks = JSON.parse(tasksJson);
						} catch (e) {
							throw new Error('Invalid JSON in Tasks field');
						}

						const body: IDataObject = {
							tasks,
							...additionalFields,
						};

						responseData = await cloudConvertApiRequest.call(this, 'POST', '/jobs', body);
					}

					if (operation === 'get') {
						const jobId = this.getNodeParameter('jobId', i) as string;
						responseData = await cloudConvertApiRequest.call(this, 'GET', `/jobs/${jobId}`);
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						const query: IDataObject = {};
						if (filters.status) query['filter[status]'] = filters.status;
						if (filters.tag) query['filter[tag]'] = filters.tag;

						if (returnAll) {
							const jobs = await cloudConvertApiRequestAllItems.call(this, 'GET', '/jobs', {}, query);
							responseData = { data: jobs };
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							query.per_page = limit;
							responseData = await cloudConvertApiRequest.call(this, 'GET', '/jobs', {}, query);
						}
					}

					if (operation === 'delete') {
						const jobId = this.getNodeParameter('jobId', i) as string;
						await cloudConvertApiRequest.call(this, 'DELETE', `/jobs/${jobId}`);
						responseData = { success: true };
					}

					if (operation === 'wait') {
						const jobId = this.getNodeParameter('jobId', i) as string;
						responseData = await cloudConvertApiRequest.call(this, 'GET', `/jobs/${jobId}`, {}, {}, true);
					}
				}

				// ==================== TASK ====================
				if (resource === 'task') {
					if (operation === 'create') {
						const taskType = this.getNodeParameter('taskType', i) as string;
						const taskDataJson = this.getNodeParameter('taskData', i) as string;

						let taskData: IDataObject;
						try {
							taskData = JSON.parse(taskDataJson);
						} catch (e) {
							throw new Error('Invalid JSON in Task Data field');
						}

						responseData = await cloudConvertApiRequest.call(this, 'POST', `/${taskType}`, taskData);
					}

					if (operation === 'get') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await cloudConvertApiRequest.call(this, 'GET', `/tasks/${taskId}`);
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						const query: IDataObject = {};
						if (filters.status) query['filter[status]'] = filters.status;
						if (filters.operation) query['filter[operation]'] = filters.operation;
						if (filters.job_id) query['filter[job_id]'] = filters.job_id;

						if (returnAll) {
							const tasks = await cloudConvertApiRequestAllItems.call(this, 'GET', '/tasks', {}, query);
							responseData = { data: tasks };
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							query.per_page = limit;
							responseData = await cloudConvertApiRequest.call(this, 'GET', '/tasks', {}, query);
						}
					}

					if (operation === 'delete') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						await cloudConvertApiRequest.call(this, 'DELETE', `/tasks/${taskId}`);
						responseData = { success: true };
					}

					if (operation === 'cancel') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await cloudConvertApiRequest.call(this, 'POST', `/tasks/${taskId}/cancel`);
					}

					if (operation === 'retry') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await cloudConvertApiRequest.call(this, 'POST', `/tasks/${taskId}/retry`);
					}

					if (operation === 'wait') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await cloudConvertApiRequest.call(this, 'GET', `/tasks/${taskId}`, {}, {}, true);
					}
				}

				// ==================== FILE ====================
				if (resource === 'file') {
					if (operation === 'convert') {
						const inputSource = this.getNodeParameter('inputSource', i) as string;
						const outputFormat = this.getNodeParameter('outputFormat', i) as string;
						const inputFormat = this.getNodeParameter('inputFormat', i, '') as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i) as boolean;
						const downloadResult = waitForCompletion && this.getNodeParameter('downloadResult', i, false) as boolean;
						const conversionOptions = this.getNodeParameter('conversionOptions', i) as IDataObject;

						// Build job with import, convert, and export tasks
						const tasks: IDataObject = {};

						// Import task based on source
						if (inputSource === 'url') {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							tasks['import-file'] = {
								operation: 'import/url',
								url: fileUrl,
							};
						} else if (inputSource === 'task') {
							tasks['import-file'] = {
								operation: 'import/url',
								url: this.getNodeParameter('inputTaskId', i),
							};
						} else if (inputSource === 'binary') {
							// For binary uploads, we need to handle differently
							const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
							const binaryData = items[i].binary?.[binaryProperty];
							if (!binaryData) {
								throw new Error(`No binary data found for property "${binaryProperty}"`);
							}

							// First create an upload task
							const uploadTask = await cloudConvertApiRequest.call(this, 'POST', '/import/upload');
							const uploadTaskData = (uploadTask as IDataObject).data as IDataObject;
							const uploadResult = uploadTaskData?.result as IDataObject;
							const uploadForm = uploadResult?.form as IDataObject;
							const uploadUrl = uploadForm?.url as string;

							if (uploadUrl) {
								// Upload the file
								const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
								const formData = (uploadForm?.parameters || {}) as IDataObject;

								await this.helpers.httpRequest({
									method: 'POST',
									url: uploadUrl,
									body: {
										...(formData as object),
										file: {
											value: buffer,
											options: {
												filename: binaryData.fileName || 'file',
												contentType: binaryData.mimeType,
											},
										},
									},
								});

								tasks['import-file'] = {
									operation: 'import/upload',
								};
							}
						}

						// Convert task
						const convertTask: IDataObject = {
							operation: 'convert',
							input: 'import-file',
							output_format: outputFormat,
						};

						if (inputFormat) {
							convertTask.input_format = inputFormat;
						}

						// Add conversion options (handle sheet options specially)
						for (const [key, value] of Object.entries(conversionOptions)) {
							// For all_sheets, pass it even if false (explicit setting)
							if (key === 'all_sheets') {
								if (value === true) {
									convertTask[key] = true;
								}
							} else if (key === 'sheet' && typeof value === 'number' && value > 0) {
								// Only set sheet if it's greater than 0
								convertTask[key] = value;
							} else if (key === 'sheet_name' && value && value !== '') {
								// Sheet name takes precedence
								convertTask['sheet'] = value;
							} else if (value !== '' && value !== 0 && value !== undefined && value !== false) {
								convertTask[key] = value;
							}
						}

						tasks['convert-file'] = convertTask;

						// Export task
						tasks['export-file'] = {
							operation: 'export/url',
							input: 'convert-file',
						};

						// Create the job
						const jobResponse = await cloudConvertApiRequest.call(
							this,
							'POST',
							'/jobs',
							{ tasks },
							{},
							waitForCompletion,
						);

						responseData = jobResponse;

						// Download result if requested
						if (downloadResult && (jobResponse as IDataObject).data) {
							const jobData = (jobResponse as IDataObject).data as IDataObject;
							const jobTasks = (jobData.tasks || []) as IDataObject[];
							const exportTask = jobTasks.find((t: IDataObject) => t.operation === 'export/url');

							if (exportTask && (exportTask.result as IDataObject)?.files) {
								const files = (exportTask.result as IDataObject).files as IDataObject[];
								
								// Handle multiple files (e.g., from all_sheets=true)
								if (files.length > 1) {
									// Multiple files - create separate output items for each
									const multiFileResults: INodeExecutionData[] = [];
									
									for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
										const fileData = files[fileIndex];
										const fileUrl = fileData.url as string;

										const binaryDataBuffer = await this.helpers.httpRequest({
											method: 'GET',
											url: fileUrl,
											encoding: 'arraybuffer',
										});

										multiFileResults.push({
											json: {
												...jobData,
												fileIndex,
												filename: fileData.filename,
												totalFiles: files.length,
											},
											binary: {
												data: await this.helpers.prepareBinaryData(
													Buffer.from(binaryDataBuffer),
													fileData.filename as string,
												),
											},
										});
									}
									
									// Add all file results to return data
									returnData.push(...multiFileResults);
									continue; // Skip normal response handling
								} else if (files.length === 1) {
									// Single file
									const fileData = files[0];
									const fileUrl = fileData.url as string;

									const binaryData = await this.helpers.httpRequest({
										method: 'GET',
										url: fileUrl,
										encoding: 'arraybuffer',
									});

									responseData = {
										...jobData,
										binary: {
											data: await this.helpers.prepareBinaryData(
												Buffer.from(binaryData),
												fileData.filename as string,
											),
										},
									};
								}
							}
						}
					}

					if (operation === 'captureWebsite') {
						const websiteUrl = this.getNodeParameter('websiteUrl', i) as string;
						const captureFormat = this.getNodeParameter('captureFormat', i) as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i) as boolean;
						const downloadResult = waitForCompletion && this.getNodeParameter('downloadResult', i, false) as boolean;
						const captureOptions = this.getNodeParameter('captureOptions', i) as IDataObject;

						const tasks: IDataObject = {
							'capture': {
								operation: 'capture-website',
								url: websiteUrl,
								output_format: captureFormat,
								...captureOptions,
							},
							'export': {
								operation: 'export/url',
								input: 'capture',
							},
						};

						const jobResponse = await cloudConvertApiRequest.call(
							this,
							'POST',
							'/jobs',
							{ tasks },
							{},
							waitForCompletion,
						);

						responseData = jobResponse;

						if (downloadResult) {
							// Download logic similar to convert
							const jobData = (jobResponse as IDataObject).data as IDataObject;
							const jobTasks = (jobData.tasks || []) as IDataObject[];
							const exportTask = jobTasks.find((t: IDataObject) => t.operation === 'export/url');

							if (exportTask && (exportTask.result as IDataObject)?.files) {
								const files = (exportTask.result as IDataObject).files as IDataObject[];
								if (files.length > 0) {
									const fileData = files[0];
									const fileUrl = fileData.url as string;

									const binaryData = await this.helpers.httpRequest({
										method: 'GET',
										url: fileUrl,
										encoding: 'arraybuffer',
									});

									responseData = {
										...jobData,
										binary: {
											data: await this.helpers.prepareBinaryData(
												Buffer.from(binaryData),
												fileData.filename as string,
											),
										},
									};
								}
							}
						}
					}

					if (operation === 'thumbnail') {
						const inputSource = this.getNodeParameter('inputSource', i) as string;
						const thumbnailFormat = this.getNodeParameter('thumbnailFormat', i) as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i) as boolean;
						const downloadResult = waitForCompletion && this.getNodeParameter('downloadResult', i, false) as boolean;
						const thumbnailOptions = this.getNodeParameter('thumbnailOptions', i) as IDataObject;

						const tasks: IDataObject = {};

						if (inputSource === 'url') {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							tasks['import'] = {
								operation: 'import/url',
								url: fileUrl,
							};
						} else if (inputSource === 'task') {
							const inputTaskId = this.getNodeParameter('inputTaskId', i) as string;
							tasks['import'] = { input: inputTaskId };
						}

						tasks['thumbnail'] = {
							operation: 'thumbnail',
							input: 'import',
							output_format: thumbnailFormat,
							...thumbnailOptions,
						};

						tasks['export'] = {
							operation: 'export/url',
							input: 'thumbnail',
						};

						const jobResponse = await cloudConvertApiRequest.call(
							this,
							'POST',
							'/jobs',
							{ tasks },
							{},
							waitForCompletion,
						);

						responseData = jobResponse;

						if (downloadResult) {
							const jobData = (jobResponse as IDataObject).data as IDataObject;
							const jobTasks = (jobData.tasks || []) as IDataObject[];
							const exportTask = jobTasks.find((t: IDataObject) => t.operation === 'export/url');

							if (exportTask && (exportTask.result as IDataObject)?.files) {
								const files = (exportTask.result as IDataObject).files as IDataObject[];
								if (files.length > 0) {
									const fileData = files[0];
									const fileUrl = fileData.url as string;

									const binaryData = await this.helpers.httpRequest({
										method: 'GET',
										url: fileUrl,
										encoding: 'arraybuffer',
									});

									responseData = {
										...jobData,
										binary: {
											data: await this.helpers.prepareBinaryData(
												Buffer.from(binaryData),
												fileData.filename as string,
											),
										},
									};
								}
							}
						}
					}

					if (operation === 'watermark') {
						const inputSource = this.getNodeParameter('inputSource', i) as string;
						const watermarkType = this.getNodeParameter('watermarkType', i) as string;
						const watermarkOutputFormat = this.getNodeParameter('watermarkOutputFormat', i) as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i) as boolean;
						const downloadResult = waitForCompletion && this.getNodeParameter('downloadResult', i, false) as boolean;
						const watermarkOptions = this.getNodeParameter('watermarkOptions', i) as IDataObject;

						const tasks: IDataObject = {};

						if (inputSource === 'url') {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							tasks['import'] = {
								operation: 'import/url',
								url: fileUrl,
							};
						}

						const watermarkTask: IDataObject = {
							operation: 'watermark',
							input: 'import',
							output_format: watermarkOutputFormat,
							...watermarkOptions,
						};

						if (watermarkType === 'text') {
							watermarkTask.layer_text = this.getNodeParameter('watermarkText', i) as string;
						} else {
							const watermarkImageUrl = this.getNodeParameter('watermarkImageUrl', i) as string;
							tasks['import-watermark'] = {
								operation: 'import/url',
								url: watermarkImageUrl,
							};
							watermarkTask.layer_input = 'import-watermark';
						}

						tasks['watermark'] = watermarkTask;

						tasks['export'] = {
							operation: 'export/url',
							input: 'watermark',
						};

						const jobResponse = await cloudConvertApiRequest.call(
							this,
							'POST',
							'/jobs',
							{ tasks },
							{},
							waitForCompletion,
						);

						responseData = jobResponse;

						if (downloadResult) {
							const jobData = (jobResponse as IDataObject).data as IDataObject;
							const jobTasks = (jobData.tasks || []) as IDataObject[];
							const exportTask = jobTasks.find((t: IDataObject) => t.operation === 'export/url');

							if (exportTask && (exportTask.result as IDataObject)?.files) {
								const files = (exportTask.result as IDataObject).files as IDataObject[];
								if (files.length > 0) {
									const fileData = files[0];
									const fileUrl = fileData.url as string;

									const binaryData = await this.helpers.httpRequest({
										method: 'GET',
										url: fileUrl,
										encoding: 'arraybuffer',
									});

									responseData = {
										...jobData,
										binary: {
											data: await this.helpers.prepareBinaryData(
												Buffer.from(binaryData),
												fileData.filename as string,
											),
										},
									};
								}
							}
						}
					}

					if (operation === 'merge') {
						const mergeTasksStr = this.getNodeParameter('mergeTasks', i) as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i) as boolean;
						const downloadResult = waitForCompletion && this.getNodeParameter('downloadResult', i, false) as boolean;

						const inputTasks = mergeTasksStr.split(',').map((t) => t.trim());

						const tasks: IDataObject = {
							'merge': {
								operation: 'merge',
								input: inputTasks,
								output_format: 'pdf',
							},
							'export': {
								operation: 'export/url',
								input: 'merge',
							},
						};

						const jobResponse = await cloudConvertApiRequest.call(
							this,
							'POST',
							'/jobs',
							{ tasks },
							{},
							waitForCompletion,
						);

						responseData = jobResponse;

						if (downloadResult) {
							const jobData = (jobResponse as IDataObject).data as IDataObject;
							const jobTasks = (jobData.tasks || []) as IDataObject[];
							const exportTask = jobTasks.find((t: IDataObject) => t.operation === 'export/url');

							if (exportTask && (exportTask.result as IDataObject)?.files) {
								const files = (exportTask.result as IDataObject).files as IDataObject[];
								if (files.length > 0) {
									const fileData = files[0];
									const fileUrl = fileData.url as string;

									const binaryData = await this.helpers.httpRequest({
										method: 'GET',
										url: fileUrl,
										encoding: 'arraybuffer',
									});

									responseData = {
										...jobData,
										binary: {
											data: await this.helpers.prepareBinaryData(
												Buffer.from(binaryData),
												fileData.filename as string,
											),
										},
									};
								}
							}
						}
					}

					if (operation === 'archive') {
						const inputSource = this.getNodeParameter('inputSource', i) as string;
						const archiveFormat = this.getNodeParameter('archiveFormat', i) as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i) as boolean;
						const downloadResult = waitForCompletion && this.getNodeParameter('downloadResult', i, false) as boolean;

						const tasks: IDataObject = {};

						if (inputSource === 'url') {
							const fileUrl = this.getNodeParameter('fileUrl', i) as string;
							tasks['import'] = {
								operation: 'import/url',
								url: fileUrl,
							};
						}

						tasks['archive'] = {
							operation: 'archive',
							input: 'import',
							output_format: archiveFormat,
						};

						tasks['export'] = {
							operation: 'export/url',
							input: 'archive',
						};

						const jobResponse = await cloudConvertApiRequest.call(
							this,
							'POST',
							'/jobs',
							{ tasks },
							{},
							waitForCompletion,
						);

						responseData = jobResponse;

						if (downloadResult) {
							const jobData = (jobResponse as IDataObject).data as IDataObject;
							const jobTasks = (jobData.tasks || []) as IDataObject[];
							const exportTask = jobTasks.find((t: IDataObject) => t.operation === 'export/url');

							if (exportTask && (exportTask.result as IDataObject)?.files) {
								const files = (exportTask.result as IDataObject).files as IDataObject[];
								if (files.length > 0) {
									const fileData = files[0];
									const fileUrl = fileData.url as string;

									const binaryData = await this.helpers.httpRequest({
										method: 'GET',
										url: fileUrl,
										encoding: 'arraybuffer',
									});

									responseData = {
										...jobData,
										binary: {
											data: await this.helpers.prepareBinaryData(
												Buffer.from(binaryData),
												fileData.filename as string,
											),
										},
									};
								}
							}
						}
					}
				}

				// ==================== OPERATION ====================
				if (resource === 'operation') {
					if (operation === 'getFormats') {
						const filters = this.getNodeParameter('operationFilters', i) as IDataObject;

						const query: IDataObject = {};
						if (filters.operation) query['filter[operation]'] = filters.operation;
						if (filters.input_format) query['filter[input_format]'] = filters.input_format;
						if (filters.output_format) query['filter[output_format]'] = filters.output_format;

						responseData = await cloudConvertApiRequest.call(this, 'GET', '/operations', {}, query);
					}
				}

				// ==================== USER ====================
				if (resource === 'user') {
					if (operation === 'getMe') {
						responseData = await cloudConvertApiRequest.call(this, 'GET', '/users/me');
					}
				}

				// Handle response
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
