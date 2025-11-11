/**
 * AI Worker API with MCP (Model Context Protocol) Support
 * Backend service for ai-react-vite
 */

import { mcpTools, executeToolCall } from './mcp-tools.js';

// CORS headers for cross-origin requests
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight requests
function handleOptions(request) {
	return new Response(null, {
		headers: corsHeaders,
	});
}

// Call OpenAI API with optional MCP tools support
async function callOpenAI(messages, env, enableTools = true) {
	const apiKey = env.OPENAI_API_KEY;
	const apiUrl = env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
	const model = env.OPENAI_MODEL || 'gpt-3.5-turbo';

	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured');
	}

	const requestBody = {
		model: model,
		messages: messages,
		temperature: 0.7,
		max_tokens: 2000,
	};

	// Add tools if enabled
	if (enableTools) {
		requestBody.tools = mcpTools;
		requestBody.tool_choice = 'auto';
	}

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OpenAI API error: ${response.status} - ${error}`);
	}

	const data = await response.json();
	return data;
}

// Handle tool calls and get final response
async function callOpenAIWithTools(messages, env) {
	const maxIterations = 5; // Prevent infinite loops
	let iteration = 0;
	let currentMessages = [...messages];

	while (iteration < maxIterations) {
		iteration++;

		// Call OpenAI
		const response = await callOpenAI(currentMessages, env, true);
		const message = response.choices[0].message;

		// Check if AI wants to call tools
		if (message.tool_calls && message.tool_calls.length > 0) {
			// Add assistant's message with tool calls to history
			currentMessages.push(message);

			// Execute each tool call
			for (const toolCall of message.tool_calls) {
				const toolName = toolCall.function.name;
				const toolArgs = JSON.parse(toolCall.function.arguments);

				console.log(`Executing tool: ${toolName}`, toolArgs);

				// Execute the tool
				const toolResult = await executeToolCall(toolName, toolArgs);

				// Add tool result to messages
				currentMessages.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					content: JSON.stringify(toolResult),
				});
			}

			// Continue loop to get AI's response based on tool results
			continue;
		}

		// No more tool calls, return final response
		return {
			content: message.content,
			toolCallsMade: iteration > 1,
		};
	}

	throw new Error('Maximum tool call iterations reached');
}

// API routes
async function handleRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname;

	// Route: POST /api/chat - AI Chat endpoint with MCP support
	if (path === '/api/chat' && request.method === 'POST') {
		try {
			const body = await request.json();
			const { message, history, enableTools = true } = body;

			if (!message) {
				return new Response(
					JSON.stringify({ error: 'Message is required' }),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					}
				);
			}

			// Prepare messages for OpenAI API
			const messages = [];

			// Add system message with MCP context
			messages.push({
				role: 'system',
				content: `你是一个友好、专业的AI助手。请用简洁、清晰的方式回答用户的问题。

你可以使用以下工具来帮助回答问题：
- get_weather: 查询任何城市的实时天气信息
- search_web: 在网络上搜索最新信息
- calculate: 执行数学计算
- get_current_time: 获取任何时区的当前时间

当用户询问需要实时数据或计算的问题时，主动使用这些工具。使用工具后，将结果以自然、友好的方式呈现给用户。`,
			});

			// Add conversation history (limit to last 10 messages to save tokens)
			if (history && Array.isArray(history)) {
				const recentHistory = history.slice(-10);
				recentHistory.forEach(msg => {
					if (msg.role && msg.content) {
						messages.push({
							role: msg.role,
							content: msg.content,
						});
					}
				});
			}

			// Add current user message
			messages.push({
				role: 'user',
				content: message,
			});

			// Call OpenAI API with MCP tools
			const result = await callOpenAIWithTools(messages, env);

			return new Response(
				JSON.stringify({
					reply: result.content,
					toolsUsed: result.toolCallsMade,
					timestamp: new Date().toISOString(),
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		} catch (error) {
			console.error('Chat API error:', error);
			return new Response(
				JSON.stringify({
					error: error.message || 'Internal server error',
					timestamp: new Date().toISOString(),
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				}
			);
		}
	}

	// Route: GET /api/tools - List available MCP tools
	if (path === '/api/tools' && request.method === 'GET') {
		return new Response(
			JSON.stringify({
				tools: mcpTools.map(tool => ({
					name: tool.function.name,
					description: tool.function.description,
					parameters: tool.function.parameters,
				})),
				total: mcpTools.length,
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			}
		);
	}

	// Route: GET /api/hello
	if (path === '/api/hello' && request.method === 'GET') {
		return new Response(
			JSON.stringify({
				message: 'Hello from Worker with MCP support!',
				timestamp: new Date().toISOString(),
				features: {
					mcp: true,
					tools: mcpTools.length,
				},
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			}
		);
	}

	// Route: POST /api/echo
	if (path === '/api/echo' && request.method === 'POST') {
		const body = await request.json();
		return new Response(
			JSON.stringify({
				echo: body,
				timestamp: new Date().toISOString(),
			}),
			{
				headers: {
					'Content-Type': 'application/json',
					...corsHeaders,
				},
			}
		);
	}

	// Default route
	return new Response(
		JSON.stringify({
			message: 'AI Worker API',
			routes: [
				'GET /api/hello',
				'POST /api/echo',
				'POST /api/chat',
			],
		}),
		{
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		}
	);
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return handleOptions(request);
		}

		// Handle API requests
		return handleRequest(request, env);
	},
};
