/**
 * Connection management tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WSBridge } from '../ws-bridge.js';

export function registerConnectionTools(server: McpServer, bridge: WSBridge): void {
  server.tool(
    'eda_connection_status',
    'Check the connection status between MCP Server and JLCEDA Pro extension.\n\nReturns: { connected: boolean, wsPort: number, message: string }.\n\nCall this FIRST before any other eda_ tool if you are unsure whether the EDA extension is connected. If connected is false, ask the user to open JLCEDA Pro and click AI Bridge -> Connect. All other eda_ tools will fail with a connection error if the extension is not connected.',
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
          }),
        }],
      };
    },
  );
}
