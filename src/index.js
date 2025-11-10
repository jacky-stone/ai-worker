/**
 * AI Worker API
 * Backend service for ai-react-vite
 */

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

// API routes
async function handleRequest(request) {
	const url = new URL(request.url);
	const path = url.pathname;

	// Route: GET /api/hello
	if (path === '/api/hello' && request.method === 'GET') {
		return new Response(
			JSON.stringify({
				message: 'Hello from Worker!',
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
		return handleRequest(request);
	},
};
