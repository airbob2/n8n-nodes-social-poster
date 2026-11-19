import type { INodeProperties } from 'n8n-workflow';

const show = (resource: string[], operation: string[]) => ({ show: { resource, operation } });

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Account', value: 'account' },
		{ name: 'Draft', value: 'draft' },
		{ name: 'Help', value: 'help' },
		{ name: 'Post', value: 'post' },
		{ name: 'Workspace', value: 'workspace' },
	],
	default: 'post',
};

export const operationProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many accounts',
				description: 'List the connected accounts you can post to',
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['draft'] } },
		options: [
			{ name: 'Cancel Schedule', value: 'cancelSchedule', action: 'Cancel the schedule of a draft', description: 'Remove the scheduled time from a draft' },
			{ name: 'Create', value: 'create', action: 'Create a draft', description: 'Create a draft without scheduling it' },
			{ name: 'Discard', value: 'discard', action: 'Discard a draft', description: 'Discard a draft' },
			{ name: 'Get', value: 'get', action: 'Get a draft', description: 'Get a draft and its status' },
			{ name: 'Schedule', value: 'schedule', action: 'Set the time of a draft', description: 'Store a time on a draft without confirming it for publishing' },
			{ name: 'Update', value: 'update', action: 'Update a draft', description: 'Change the text, link or media of a draft' },
			{ name: 'Validate', value: 'validate', action: 'Validate a draft', description: 'Check a draft against the rules of its network' },
		],
		default: 'create',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['post'] } },
		options: [
			{
				name: 'Create and Schedule',
				value: 'createAndSchedule',
				action: 'Create and schedule a post',
				description: 'Create a draft, schedule it and confirm it for publishing in one step',
			},
			{
				name: 'Schedule Draft',
				value: 'scheduleDraft',
				action: 'Schedule an existing draft for publishing',
				description: 'Schedule an existing draft and confirm it for publishing',
			},
		],
		default: 'createAndSchedule',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['workspace'] } },
		options: [
			{ name: 'Get AI Context', value: 'getAiContext', action: 'Get the AI context of a workspace', description: 'Get brand profile and network rules for writing posts' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many workspaces', description: 'List the workspaces of this API key' },
		],
		default: 'getAll',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['help'] } },
		options: [
			{ name: 'Search', value: 'search', action: 'Search the help center', description: 'Search the Social Poster help center' },
		],
		default: 'search',
	},
];

const workspaceOps = {
	account: ['getAll'],
	draft: ['cancelSchedule', 'create', 'discard', 'get', 'schedule', 'update', 'validate'],
	post: ['createAndSchedule', 'scheduleDraft'],
	workspace: ['getAiContext'],
};

const workspaceProperties: INodeProperties[] = Object.entries(workspaceOps).map(([resource, ops]) => ({
	displayName: 'Workspace Name or ID',
	name: 'workspace',
	type: 'options',
	typeOptions: { loadOptionsMethod: 'getWorkspaces' },
	default: '',
	description:
		'Workspace (team) to use. Leave empty to use the workspace of the API key. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	displayOptions: show([resource], ops),
}));

const accountProperty: INodeProperties = {
	displayName: 'Account Name or ID',
	name: 'account',
	type: 'options',
	typeOptions: { loadOptionsMethod: 'getAccounts', loadOptionsDependsOn: ['workspace'] },
	required: true,
	default: '',
	description:
		'Account to post to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	displayOptions: show(['draft', 'post'], ['create', 'createAndSchedule']),
};

const draftRefProperty: INodeProperties = {
	displayName: 'Draft ID',
	name: 'draftRef',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'dr_...',
	description: 'The draft_ref returned when the draft was created',
	displayOptions: show(['draft', 'post'], ['cancelSchedule', 'discard', 'get', 'schedule', 'update', 'validate', 'scheduleDraft']),
};

const captionProperty: INodeProperties = {
	displayName: 'Text',
	name: 'caption',
	type: 'string',
	typeOptions: { rows: 4 },
	required: true,
	default: '',
	description: 'Text of the post',
	displayOptions: show(['draft', 'post'], ['create', 'createAndSchedule']),
};

const scheduleProperties: INodeProperties[] = [
	{
		displayName: 'Schedule',
		name: 'scheduleMode',
		type: 'options',
		options: [
			{ name: 'In Minutes', value: 'minutes', description: 'Publish a number of minutes from now (at least 5)' },
			{ name: 'At Date and Time', value: 'dateTime', description: 'Publish at a fixed date and time' },
		],
		default: 'minutes',
		displayOptions: show(['draft', 'post'], ['schedule', 'createAndSchedule', 'scheduleDraft']),
	},
	{
		displayName: 'Minutes From Now',
		name: 'minutesFromNow',
		type: 'number',
		typeOptions: { minValue: 5 },
		default: 5,
		description: 'Posts with an API key go out at least 5 minutes after scheduling',
		displayOptions: {
			show: {
				resource: ['draft', 'post'],
				operation: ['schedule', 'createAndSchedule', 'scheduleDraft'],
				scheduleMode: ['minutes'],
			},
		},
	},
	{
		displayName: 'Date and Time',
		name: 'scheduledAt',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'When to publish. Must be at least 5 minutes in the future.',
		displayOptions: {
			show: {
				resource: ['draft', 'post'],
				operation: ['schedule', 'createAndSchedule', 'scheduleDraft'],
				scheduleMode: ['dateTime'],
			},
		},
	},
];

const xReviewedProperty: INodeProperties = {
	displayName: 'X Content Reviewed',
	name: 'xContentReviewed',
	type: 'boolean',
	default: false,
	description:
		'Whether a person has reviewed the exact text and media. Required for X (Twitter); set it only if that is true.',
	displayOptions: show(['post'], ['createAndSchedule', 'scheduleDraft']),
};

const draftOptionFields: INodeProperties[] = [
			{
				displayName: 'AI Generated',
				name: 'aiGenerated',
				type: 'boolean',
				default: false,
				description: 'Whether the text was written by AI (used for AI labels where the team turned them on)',
			},
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'Link to attach to the post',
			},
			{
				displayName: 'Media URLs',
				name: 'mediaUrls',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public http(s) addresses of images or videos, separated by commas or new lines (max. 20).',
			},
			{
				displayName: 'Post Type',
				name: 'postKind',
				type: 'string',
				default: '',
				placeholder: 'reel',
				description: 'Optional post type of the network, for example reel or story',
			},
			{
				displayName: 'TikTok Privacy',
				name: 'tiktokPrivacyLevel',
				type: 'options',
				options: [
					{ name: 'Followers', value: 'FOLLOWER_OF_CREATOR' },
					{ name: 'Friends', value: 'MUTUAL_FOLLOW_FRIENDS' },
					{ name: 'Only Me', value: 'SELF_ONLY' },
					{ name: 'Public', value: 'PUBLIC_TO_EVERYONE' },
				],
				default: 'PUBLIC_TO_EVERYONE',
				description: 'Visibility on TikTok when the team allows direct TikTok posting',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title for networks that use one (for example YouTube, Pinterest, Tumblr)',
			},
			{
				displayName: 'YouTube Privacy',
				name: 'youtubePrivacyLevel',
				type: 'options',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				default: 'private',
				description: 'Visibility of the YouTube video',
			},
];

const draftUpdateOptionFields: INodeProperties[] = [
			{
				displayName: 'AI Generated',
				name: 'aiGenerated',
				type: 'boolean',
				default: false,
				description: 'Whether the text was written by AI (used for AI labels where the team turned them on)',
			},
			{
				displayName: 'Link',
				name: 'link',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'Link to attach to the post',
			},
			{
				displayName: 'Media URLs',
				name: 'mediaUrls',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public http(s) addresses of images or videos, separated by commas or new lines (max. 20).',
			},
			{
				displayName: 'Post Type',
				name: 'postKind',
				type: 'string',
				default: '',
				placeholder: 'reel',
				description: 'Optional post type of the network, for example reel or story',
			},
			{
				displayName: 'Text',
				name: 'caption',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'New text of the post',
			},
			{
				displayName: 'TikTok Privacy',
				name: 'tiktokPrivacyLevel',
				type: 'options',
				options: [
					{ name: 'Followers', value: 'FOLLOWER_OF_CREATOR' },
					{ name: 'Friends', value: 'MUTUAL_FOLLOW_FRIENDS' },
					{ name: 'Only Me', value: 'SELF_ONLY' },
					{ name: 'Public', value: 'PUBLIC_TO_EVERYONE' },
				],
				default: 'PUBLIC_TO_EVERYONE',
				description: 'Visibility on TikTok when the team allows direct TikTok posting',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title for networks that use one (for example YouTube, Pinterest, Tumblr)',
			},
			{
				displayName: 'YouTube Privacy',
				name: 'youtubePrivacyLevel',
				type: 'options',
				options: [
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
					{ name: 'Unlisted', value: 'unlisted' },
				],
				default: 'private',
				description: 'Visibility of the YouTube video',
			},
];

const draftFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(['draft', 'post'], ['create', 'createAndSchedule']),
		options: draftOptionFields,
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(['draft'], ['update']),
		options: draftUpdateOptionFields,
	},
];

const helpProperties: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'What to search for',
		displayOptions: show(['help'], ['search']),
	},
	{
		displayName: 'Language',
		name: 'lang',
		type: 'options',
		options: [
			{ name: 'English', value: 'en' },
			{ name: 'German', value: 'de' },
		],
		default: 'en',
		displayOptions: show(['help'], ['search']),
	},
];

export const nodeProperties: INodeProperties[] = [
	resourceProperty,
	...operationProperties,
	...workspaceProperties,
	accountProperty,
	draftRefProperty,
	captionProperty,
	...scheduleProperties,
	xReviewedProperty,
	...draftFields,
	...helpProperties,
];
