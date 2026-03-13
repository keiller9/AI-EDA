/**
 * Connection management tools
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';

export function registerConnectionTools(server: McpServer, bridge: WSBridge): void {
  server.tool(
    'eda_connection_status',
    'Check the connection status between MCP Server and JLCEDA Pro extension',
    {},
    async () => {
      const connected = bridge.isConnected();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            connected,
            wsPort: bridge.getPort(),
            message: connected
              ? 'EDA extension is connected and ready'
              : 'EDA extension is not connected. Please open JLCEDA Pro and click AI Bridge -> Connect',
          }, null, 2),
        }],
      };
    },
  );
}
