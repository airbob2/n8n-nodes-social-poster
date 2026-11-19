import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { nodeProperties } from './shared/descriptions';
import { callTool, resolveWorkspace } from './shared/transport';

/** Server rule for API keys: at least 5 minutes. A small buffer covers clock drift. */
const MIN_LEAD_MS = 5 * 60 * 1000;
const BUFFER_MS = 30 * 1000;

const NETWORK_LABELS: Record<string, string> = {
	facebook: 'Facebook',
	instagram: 'Instagram',
	linkedin: 'LinkedIn',
	twitter: 'X',
	google_business_profile: 'Google Business Profile',
	pinterest: 'Pinterest',
	tumblr: 'Tumblr',
	youtube: 'YouTube',
	tiktok_api: 'TikTok',
	tiktok: 'TikTok',
	threads: 'Threads',
	telegram: 'Telegram',
};

function networkLabel(network: string): string {
	return NETWORK_LABELS[network] ?? network;
}

function splitUrls(raw: unknown): string[] {
	if (typeof raw !== 'string') {
		return [];
	}
	return raw
		.split(/[\n,]+/)
		.map((value) => value.trim())
		.filter((value) => value !== '');
}

function draftArguments(fields: IDataObject): IDataObject {
	const args: IDataObject = {};
	if (typeof fields.caption === 'string' && fields.caption !== '') {
		args.caption = fields.caption;
	}
	if (typeof fields.link === 'string' && fields.link !== '') {
		args.link = fields.link;
	}
	const urls = splitUrls(fields.mediaUrls);
	if (urls.length > 0) {
		args.media_urls = urls;
		args.media_status_class = 'present';
	}
	if (typeof fields.postKind === 'string' && fields.postKind !== '') {
		args.post_kind = fields.postKind;
	}
	if (typeof fields.title === 'string' && fields.title !== '') {
		args.title = fields.title;
	}
	if (typeof fields.aiGenerated === 'boolean') {
		args.ai_generated = fields.aiGenerated;
	}
	if (typeof fields.tiktokPrivacyLevel === 'string' && fields.tiktokPrivacyLevel !== '') {
		args.tiktok_privacy_level = fields.tiktokPrivacyLevel;
	}
	if (typeof fields.youtubePrivacyLevel === 'string' && fields.youtubePrivacyLevel !== '') {
		args.youtube_privacy_level = fields.youtubePrivacyLevel;
	}
	return args;
}

function scheduledAtUtc(this: IExecuteFunctions, itemIndex: number): string {
	const mode = this.getNodeParameter('scheduleMode', itemIndex) as string;
	let when: number;
	if (mode === 'dateTime') {
		const raw = this.getNodeParameter('scheduledAt', itemIndex) as string;
		when = new Date(raw).getTime();
		if (Number.isNaN(when)) {
			throw new NodeOperationError(this.getNode(), 'The date and time is invalid.', { itemIndex });
		}
		if (when < Date.now() + MIN_LEAD_MS) {
			throw new NodeOperationError(
				this.getNode(),
				'Posts must be scheduled at least 5 minutes in the future. Immediate publishing is not available.',
				{ itemIndex },
			);
		}
	} else {
		const minutes = Math.max(5, Number(this.getNodeParameter('minutesFromNow', itemIndex, 5)));
		when = Date.now() + minutes * 60 * 1000 + BUFFER_MS;
	}
	return new Date(when).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function draftRefOf(result: IDataObject): string {
	const draft = (result.draft ?? {}) as IDataObject;
	return String(draft.draft_ref ?? '');
}

export class SocialPoster implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Social Poster',
		name: 'socialPoster',
		icon: { light: 'file:../../icons/socialPoster.svg', dark: 'file:../../icons/socialPoster.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create drafts and schedule social media posts with Social Poster',
		defaults: {
			name: 'Social Poster',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'socialPosterApi',
				required: true,
			},
		],
		properties: nodeProperties,
	};

	methods = {
		loadOptions: {
			async getWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const result = await callTool.call(this, 'list_allowed_workspaces', {});
				const workspaces = (result.workspaces ?? []) as IDataObject[];
				return workspaces.map((workspace) => ({
					name: String(workspace.display_name ?? workspace.workspace_ref),
					value: String(workspace.workspace_ref),
				}));
			},

			async getAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const selected = String(this.getCurrentNodeParameter('workspace') ?? '');
				const workspaceRef = await resolveWorkspace.call(this, selected);
				const result = await callTool.call(this, 'list_publish_targets', { workspace_ref: workspaceRef });
				const targets = (result.targets ?? []) as IDataObject[];
				return targets
					.map((target) => {
						const ref = String(target.account_ref);
						const mode = typeof target.automation === 'string' ? ` (${target.automation})` : '';
						const displayName =
							typeof target.display_name === 'string' && target.display_name.trim() !== ''
								? target.display_name.trim()
								: `${networkLabel(String(target.network))} · …${ref.slice(-6)}`;
						return {
							name: `${displayName}${mode}`,
							value: ref,
							description: `Reference ${ref}`,
						};
					})
					.sort((a, b) => a.name.localeCompare(b.name));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let result: IDataObject;

				if (resource === 'help') {
					result = await callTool.call(
						this,
						'search_help',
						{
							query: this.getNodeParameter('query', itemIndex) as string,
							lang: this.getNodeParameter('lang', itemIndex, 'en') as string,
						},
						itemIndex,
					);
				} else if (resource === 'workspace' && operation === 'getAll') {
					result = await callTool.call(this, 'list_allowed_workspaces', {}, itemIndex);
				} else {
					const workspaceRef = await resolveWorkspace.call(
						this,
						this.getNodeParameter('workspace', itemIndex, '') as string,
						itemIndex,
					);
					const ws = { workspace_ref: workspaceRef };
					const draftRef = (): string => this.getNodeParameter('draftRef', itemIndex) as string;
					const key = `${resource}:${operation}`;

					switch (key) {
						case 'workspace:getAiContext':
							result = await callTool.call(this, 'get_workspace_ai_context', ws, itemIndex);
							break;
						case 'account:getAll':
							result = await callTool.call(this, 'list_publish_targets', ws, itemIndex);
							break;
						case 'draft:create':
							result = await callTool.call(
								this,
								'create_draft',
								{
									...ws,
									account_ref: this.getNodeParameter('account', itemIndex) as string,
									...draftArguments(this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject),
									caption: this.getNodeParameter('caption', itemIndex) as string,
								},
								itemIndex,
							);
							break;
						case 'draft:update':
							result = await callTool.call(
								this,
								'update_draft',
								{
									...ws,
									draft_ref: draftRef(),
									...draftArguments(this.getNodeParameter('updateFields', itemIndex, {}) as IDataObject),
								},
								itemIndex,
							);
							break;
						case 'draft:get':
							result = await callTool.call(this, 'get_draft', { ...ws, draft_ref: draftRef() }, itemIndex);
							break;
						case 'draft:validate':
							result = await callTool.call(this, 'validate_draft', { ...ws, draft_ref: draftRef() }, itemIndex);
							break;
						case 'draft:discard':
							result = await callTool.call(this, 'discard_draft', { ...ws, draft_ref: draftRef() }, itemIndex);
							break;
						case 'draft:schedule':
							result = await callTool.call(
								this,
								'schedule_draft',
								{ ...ws, draft_ref: draftRef(), scheduled_at_utc: scheduledAtUtc.call(this, itemIndex) },
								itemIndex,
							);
							break;
						case 'draft:cancelSchedule':
							result = await callTool.call(this, 'cancel_schedule', { ...ws, draft_ref: draftRef() }, itemIndex);
							break;
						case 'post:createAndSchedule':
						case 'post:scheduleDraft': {
							// Check the time before anything is created.
							const when = scheduledAtUtc.call(this, itemIndex);
							let ref: string;
							let created: IDataObject | undefined;
							if (operation === 'createAndSchedule') {
								created = await callTool.call(
									this,
									'create_draft',
									{
										...ws,
										account_ref: this.getNodeParameter('account', itemIndex) as string,
										...draftArguments(this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject),
										caption: this.getNodeParameter('caption', itemIndex) as string,
									},
									itemIndex,
								);
								ref = draftRefOf(created);
							} else {
								ref = draftRef();
							}
							const scheduled = await callTool.call(
								this,
								'schedule_draft',
								{ ...ws, draft_ref: ref, scheduled_at_utc: when },
								itemIndex,
							);
							const preview = await callTool.call(this, 'preview_publish', { ...ws, draft_ref: ref }, itemIndex);
							const confirmed = await callTool.call(
								this,
								'confirm_publish',
								{
									...ws,
									draft_ref: ref,
									confirmation_token: String(preview.confirmation_token ?? ''),
									displayed_exact_content: this.getNodeParameter('xContentReviewed', itemIndex, false) as boolean,
								},
								itemIndex,
							);
							const previewData = { ...((preview.preview ?? {}) as IDataObject) };
							result = {
								draft_ref: ref,
								scheduled_at_utc: ((scheduled.draft ?? {}) as IDataObject).scheduled_at_utc,
								status_class: confirmed.status_class,
								approval_class: confirmed.approval_class,
								customer_next: confirmed.customer_next,
								draft: confirmed.draft,
								preview: previewData,
							};
							break;
						}
						default:
							throw new NodeOperationError(this.getNode(), `Unsupported operation ${key}`, { itemIndex });
					}
				}
				returnData.push({ json: result, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: itemIndex } });
					continue;
				}
				if (error instanceof NodeOperationError || error instanceof NodeApiError) {
					throw new NodeOperationError(this.getNode(), error.message, {
						itemIndex,
						description: error.description ?? undefined,
					});
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}
