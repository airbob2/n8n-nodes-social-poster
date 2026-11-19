import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SocialPosterApi implements ICredentialType {
	name = 'socialPosterApi';

	displayName = 'Social Poster API';

	icon: Icon = { light: 'file:../icons/socialPoster.svg', dark: 'file:../icons/socialPoster.dark.svg' };

	documentationUrl = 'https://github.com/airbob2/n8n-nodes-social-poster#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Team API key from Social Poster (account menu → AI access → API key for n8n). It starts with spk_.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: 'https://app.social-poster.io',
			description: 'Address of your Social Poster app, without /mcp at the end',
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
			baseURL:
				'={{ $credentials.baseUrl.trim().replace(/\\/+$/, "").endsWith("/mcp") ? $credentials.baseUrl.trim().replace(/\\/+$/, "").slice(0, -4) : $credentials.baseUrl.trim().replace(/\\/+$/, "") }}',
			url: '/mcp',
			method: 'POST',
			headers: {
				Accept: 'application/json, text/event-stream',
				'Content-Type': 'application/json',
			},
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
			},
		},
	};
}
