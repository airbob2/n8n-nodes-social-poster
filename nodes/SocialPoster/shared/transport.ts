import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

type Context = IExecuteFunctions | ILoadOptionsFunctions;

/** English explanations for Social Poster error codes. */
const ERROR_MESSAGES: Record<string, string> = {
	schedule_lead_time_required:
		'With an API key, posts must be scheduled at least 5 minutes ahead. Immediate publishing is not available.',
	invalid_schedule_time: 'The scheduled time is invalid or in the past.',
	workspace_not_found_or_denied: 'The workspace was not found or this API key has no access to it.',
	draft_not_found_or_denied: 'The draft was not found or belongs to another workspace.',
	account_not_allowed: 'This account cannot be used. Check the account switches in AI access.',
	automation_account_required:
		'Turn on automation for this account in Social Poster (account menu → AI access).',
	mcp_notice_required:
		'Confirm the automation notice for this team in Social Poster (account menu → AI access) first.',
	validation_failed: 'The post does not meet the rules of the network (for example the text length).',
	confirmation_invalid_or_stale: 'The publishing confirmation expired. Run the preview again.',
	payload_changed_repreview_required: 'The draft changed after the preview. Run the preview again.',
	x_preview_not_shown:
		'X requires that a person reviewed the exact text and media. Set "X Content Reviewed" only if that is true.',
	x_duplicate_text: 'The same text is already planned on another X account.',
	network_mcp_unavailable: 'This network is not available for automation.',
	tiktok_inbox_limit: 'TikTok already has 5 open drafts from the last 24 hours. Finish some in the TikTok app first.',
	post_limit: 'The post limit of your plan is reached.',
	rate_limited: 'Too many requests. Wait a minute and try again.',
	forbidden: 'This API key is not allowed to do this.',
	internal: 'Social Poster could not complete the request. Try again later.',
};

export function socialPosterBaseUrl(raw: unknown): string {
	const value = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : 'https://app.social-poster.io';
	return value.replace(/\/+$/, '').replace(/\/mcp$/, '');
}

let requestId = 0;

/** Sends one JSON-RPC request to the Social Poster MCP endpoint. */
export async function mcpRequest(
	this: Context,
	method: string,
	params?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('socialPosterApi');
	requestId += 1;
	const body: IDataObject = { jsonrpc: '2.0', id: requestId, method };
	if (params !== undefined) {
		body.params = params;
	}
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${socialPosterBaseUrl(credentials.baseUrl)}/mcp`,
		headers: {
			Accept: 'application/json, text/event-stream',
			'Content-Type': 'application/json',
		},
		body,
		json: true,
	};
	let response: IDataObject;
	try {
		response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'socialPosterApi',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
	if (response && typeof response === 'object' && response.error) {
		const rpcError = response.error as IDataObject;
		throw new NodeOperationError(this.getNode(), `Social Poster error: ${String(rpcError.message ?? 'unknown')}`);
	}
	return (response?.result ?? {}) as IDataObject;
}

/** Calls one Social Poster tool and returns its structured result. */
export async function callTool(
	this: Context,
	name: string,
	args: IDataObject,
	itemIndex = 0,
): Promise<IDataObject> {
	const result = await mcpRequest.call(this, 'tools/call', { name, arguments: args });
	const structured = (result.structuredContent ?? {}) as IDataObject;
	if (result.isError === true) {
		const code = String(structured.error ?? 'unknown_error');
		const message = ERROR_MESSAGES[code] ?? `Social Poster refused the request (${code}).`;
		const detail = typeof structured.customer_next === 'string' ? structured.customer_next : undefined;
		throw new NodeOperationError(this.getNode(), message, {
			itemIndex,
			description: detail ? `Code: ${code}. Social Poster says: ${detail}` : `Code: ${code}`,
		});
	}
	return structured;
}

/** Uses the given workspace or, when empty, the only workspace of the API key. */
export async function resolveWorkspace(
	this: Context,
	workspaceRef: string,
	itemIndex = 0,
): Promise<string> {
	if (workspaceRef.trim() !== '') {
		return workspaceRef.trim();
	}
	const result = await callTool.call(this, 'list_allowed_workspaces', {}, itemIndex);
	const workspaces = (result.workspaces ?? []) as IDataObject[];
	if (workspaces.length === 0) {
		throw new NodeOperationError(this.getNode(), 'This API key has no workspace.', { itemIndex });
	}
	return String(workspaces[0].workspace_ref);
}
