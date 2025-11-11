/**
 * MCP (Model Context Protocol) Tools
 * Define available tools that AI can use
 */

// Tool definitions in OpenAI function calling format
export const mcpTools = [
	{
		type: 'function',
		function: {
			name: 'get_weather',
			description: 'Get current weather information for a specific location',
			parameters: {
				type: 'object',
				properties: {
					location: {
						type: 'string',
						description: 'The city name or location, e.g. "Beijing", "New York"',
					},
					unit: {
						type: 'string',
						enum: ['celsius', 'fahrenheit'],
						description: 'Temperature unit',
						default: 'celsius',
					},
				},
				required: ['location'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'search_web',
			description: 'Search the web for current information',
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'The search query',
					},
					num_results: {
						type: 'number',
						description: 'Number of results to return (1-10)',
						default: 5,
					},
				},
				required: ['query'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'calculate',
			description: 'Perform mathematical calculations. Supports basic arithmetic and common math functions.',
			parameters: {
				type: 'object',
				properties: {
					expression: {
						type: 'string',
						description: 'Mathematical expression to evaluate, e.g. "2 + 2", "sqrt(16)", "sin(3.14159/2)"',
					},
				},
				required: ['expression'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'get_current_time',
			description: 'Get the current date and time in a specific timezone',
			parameters: {
				type: 'object',
				properties: {
					timezone: {
						type: 'string',
						description: 'IANA timezone name, e.g. "Asia/Shanghai", "America/New_York", "UTC"',
						default: 'UTC',
					},
				},
			},
		},
	},
];

// Tool execution functions
export async function executeToolCall(toolName, args) {
	switch (toolName) {
		case 'get_weather':
			return await getWeather(args.location, args.unit || 'celsius');

		case 'search_web':
			return await searchWeb(args.query, args.num_results || 5);

		case 'calculate':
			return await calculate(args.expression);

		case 'get_current_time':
			return await getCurrentTime(args.timezone || 'UTC');

		default:
			return { error: `Unknown tool: ${toolName}` };
	}
}

// Weather tool implementation
async function getWeather(location, unit) {
	try {
		// Using wttr.in as a free weather service
		const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);

		if (!response.ok) {
			return { error: 'Failed to fetch weather data' };
		}

		const data = await response.json();
		const current = data.current_condition[0];
		const area = data.nearest_area[0];

		const tempC = parseInt(current.temp_C);
		const tempF = parseInt(current.temp_F);
		const temp = unit === 'fahrenheit' ? tempF : tempC;
		const tempUnit = unit === 'fahrenheit' ? '°F' : '°C';

		return {
			location: `${area.areaName[0].value}, ${area.country[0].value}`,
			temperature: `${temp}${tempUnit}`,
			feels_like: unit === 'fahrenheit' ? `${current.FeelsLikeF}°F` : `${current.FeelsLikeC}°C`,
			condition: current.weatherDesc[0].value,
			humidity: `${current.humidity}%`,
			wind_speed: `${current.windspeedKmph} km/h`,
			wind_direction: current.winddir16Point,
			visibility: `${current.visibility} km`,
			pressure: `${current.pressure} mb`,
			uv_index: current.uvIndex,
		};
	} catch (error) {
		return { error: `Weather lookup failed: ${error.message}` };
	}
}

// Web search tool implementation (using DuckDuckGo)
async function searchWeb(query, numResults) {
	try {
		// Using DuckDuckGo Instant Answer API
		const response = await fetch(
			`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
		);

		if (!response.ok) {
			return { error: 'Search request failed' };
		}

		const data = await response.json();

		const results = [];

		// Add abstract if available
		if (data.Abstract) {
			results.push({
				title: data.Heading || 'Summary',
				snippet: data.Abstract,
				url: data.AbstractURL,
				source: data.AbstractSource,
			});
		}

		// Add related topics
		if (data.RelatedTopics && data.RelatedTopics.length > 0) {
			data.RelatedTopics.slice(0, numResults - results.length).forEach(topic => {
				if (topic.Text && topic.FirstURL) {
					results.push({
						title: topic.Text.split(' - ')[0],
						snippet: topic.Text,
						url: topic.FirstURL,
					});
				}
			});
		}

		return {
			query,
			results,
			total_results: results.length,
		};
	} catch (error) {
		return { error: `Search failed: ${error.message}` };
	}
}

// Calculator tool implementation
async function calculate(expression) {
	try {
		// Simple safe math evaluation
		// Only allow numbers, basic operators, and common math functions
		const safeExpression = expression
			.replace(/[^0-9+\-*/.()sqrt\s]/g, '')
			.replace(/sqrt/g, 'Math.sqrt');

		// Evaluate the expression
		const result = eval(safeExpression);

		if (typeof result !== 'number' || !isFinite(result)) {
			return { error: 'Invalid calculation result' };
		}

		return {
			expression,
			result,
			formatted: result.toLocaleString(),
		};
	} catch (error) {
		return { error: `Calculation failed: ${error.message}` };
	}
}

// Current time tool implementation
async function getCurrentTime(timezone) {
	try {
		const now = new Date();

		const formatted = now.toLocaleString('zh-CN', {
			timeZone: timezone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		});

		return {
			timezone,
			datetime: formatted,
			timestamp: now.getTime(),
			iso: now.toISOString(),
		};
	} catch (error) {
		return { error: `Time lookup failed: ${error.message}` };
	}
}
