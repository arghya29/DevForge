import { describe, it, expect } from 'vitest';
import { createApp } from './helpers/loadApp.js';

describe('dom-utils', () => {
  it('escapes HTML correctly', () => {
    const { get } = createApp();
    const result = get("escapeHtml('<div>\"hello\" & \\'world\\'</div>')");
    expect(result).toBe('&lt;div&gt;&quot;hello&quot; &amp; &#39;world&#39;&lt;/div&gt;');
  });
});
