# External API Integration Plugin

This plugin demonstrates how to integrate with external APIs, handle authentication, and manage rate limiting.

## Features
- External API integration
- OAuth2 authentication
- Rate limiting and caching
- Error handling and retries
- Data transformation

## Installation
```bash
cd plugins/external-api-plugin
npm install
```

## Configuration
```json
{
  "name": "external-api-plugin",
  "version": "1.0.0",
  "description": "External API integration plugin",
  "config": {
    "apiKey": {
      "type": "string",
      "required": true,
      "description": "API key for external service"
    },
    "baseUrl": {
      "type": "string",
      "default": "https://api.example.com",
      "description": "Base URL for API"
    },
    "rateLimit": {
      "type": "number",
      "default": 100,
      "description": "Requests per minute"
    }
  },
  "permissions": ["network", "storage"]
}
```

## Usage
```typescript
// Register API endpoints
api.registerCommand('api:get', {
  description: 'Get data from external API',
  handler: async (args: string[]) => {
    const endpoint = args[0];
    return await this.apiClient.get(endpoint);
  }
});

// Use in UI
const data = await this.api.executeCommand('api:get', ['/users']);
```
