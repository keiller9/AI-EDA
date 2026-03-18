/**
 * Protocol Sync Test
 * Ensures both protocol.ts files have identical BridgeCommand enum values
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function extractEnumValues(filePath: string): Map<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const enumMap = new Map<string, string>();

  // Match lines like: KEY = 'value',
  const regex = /^\s+(\w+)\s*=\s*'([^']+)'/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    enumMap.set(match[1], match[2]);
  }
  return enumMap;
}

describe('Protocol Sync', () => {
  const mcpProtocolPath = path.resolve(__dirname, '../protocol.ts');
  const extProtocolPath = path.resolve(__dirname, '../../../eda-extension/src/protocol.ts');

  const mcpEnum = extractEnumValues(mcpProtocolPath);
  const extEnum = extractEnumValues(extProtocolPath);

  it('both files should exist and have enum values', () => {
    expect(mcpEnum.size).toBeGreaterThan(0);
    expect(extEnum.size).toBeGreaterThan(0);
  });

  it('should have the same number of enum values', () => {
    expect(mcpEnum.size).toBe(extEnum.size);
  });

  it('all MCP server enum keys should exist in extension', () => {
    const missingInExt: string[] = [];
    for (const key of mcpEnum.keys()) {
      if (!extEnum.has(key)) missingInExt.push(key);
    }
    expect(missingInExt).toEqual([]);
  });

  it('all extension enum keys should exist in MCP server', () => {
    const missingInMcp: string[] = [];
    for (const key of extEnum.keys()) {
      if (!mcpEnum.has(key)) missingInMcp.push(key);
    }
    expect(missingInMcp).toEqual([]);
  });

  it('all enum values should match between files', () => {
    const mismatches: string[] = [];
    for (const [key, value] of mcpEnum) {
      const extValue = extEnum.get(key);
      if (extValue !== value) {
        mismatches.push(`${key}: MCP="${value}" vs EXT="${extValue}"`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('should have no duplicate values', () => {
    const values = Array.from(mcpEnum.values());
    const uniqueValues = new Set(values);
    const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
    expect(duplicates).toEqual([]);
    expect(uniqueValues.size).toBe(values.length);
  });

  it('should have expected minimum command count (>= 120)', () => {
    expect(mcpEnum.size).toBeGreaterThanOrEqual(120);
  });
});
