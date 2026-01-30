import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CloudConvertApi implements ICredentialType {
	name = 'cloudConvertApi';

	displayName = 'CloudConvert API';

	documentationUrl = 'https://cloudconvert.com/api/v2';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your CloudConvert API Key. Get it from https://cloudconvert.com/dashboard/api/v2/keys',
		},
		{
			displayName: 'Use Sandbox',
			name: 'sandbox',
			type: 'boolean',
			default: false,
			description: 'Whether to use the sandbox API for testing (no credits consumed)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.sandbox ? "https://api.sandbox.cloudconvert.com/v2" : "https://api.cloudconvert.com/v2"}}',
			url: '/users/me',
		},
	};
}
