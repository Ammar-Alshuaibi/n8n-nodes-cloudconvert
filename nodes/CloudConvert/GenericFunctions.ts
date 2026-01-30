import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodePropertyOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Make an API request to CloudConvert
 */
export async function cloudConvertApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	sync: boolean = false,
): Promise<any> {
	const credentials = await this.getCredentials('cloudConvertApi');
	const sandbox = credentials.sandbox as boolean;

	let baseUrl = sandbox
		? 'https://api.sandbox.cloudconvert.com/v2'
		: 'https://api.cloudconvert.com/v2';

	// Use sync endpoint for waiting operations
	if (sync) {
		baseUrl = sandbox
			? 'https://sync.api.sandbox.cloudconvert.com/v2'
			: 'https://sync.api.cloudconvert.com/v2';
	}

	const options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		body,
		qs: query,
		url: `${baseUrl}${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'cloudConvertApi',
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request and return all items (handles pagination)
 */
export async function cloudConvertApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<any[]> {
	const returnData: IDataObject[] = [];

	let responseData;
	query.per_page = 100;
	query.page = 1;

	do {
		responseData = await cloudConvertApiRequest.call(this, method, endpoint, body, query);

		if (responseData.data && Array.isArray(responseData.data)) {
			returnData.push(...responseData.data);
		}

		query.page = (query.page as number) + 1;
	} while (
		responseData.links?.next ||
		(responseData.data?.length === query.per_page)
	);

	return returnData;
}

/**
 * Get available conversion formats
 */
export async function getFormats(
	this: ILoadOptionsFunctions,
	inputFormat?: string,
): Promise<INodePropertyOptions[]> {
	const query: IDataObject = {
		'filter[operation]': 'convert',
	};

	if (inputFormat) {
		query['filter[input_format]'] = inputFormat;
	}

	const operations = await cloudConvertApiRequest.call(
		this,
		'GET',
		'/operations',
		{},
		query,
	);

	const formats: INodePropertyOptions[] = [];
	const seen = new Set<string>();

	for (const op of operations.data || []) {
		const format = inputFormat ? op.output_format : op.input_format;
		if (format && !seen.has(format)) {
			seen.add(format);
			formats.push({
				name: format.toUpperCase(),
				value: format,
			});
		}
	}

	return formats.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get jobs list
 */
export async function getJobs(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const jobs = await cloudConvertApiRequestAllItems.call(
		this,
		'GET',
		'/jobs',
	);

	return jobs.map((job: IDataObject) => ({
		name: `${job.id} (${job.status})${job.tag ? ` - ${job.tag}` : ''}`,
		value: job.id as string,
	}));
}

/**
 * Get tasks list
 */
export async function getTasks(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const tasks = await cloudConvertApiRequestAllItems.call(
		this,
		'GET',
		'/tasks',
	);

	return tasks.map((task: IDataObject) => ({
		name: `${task.id} (${task.operation}) - ${task.status}`,
		value: task.id as string,
	}));
}
