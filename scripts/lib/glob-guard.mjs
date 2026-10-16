/** GHSA-vfj7-8cjw-p6xm: guard recursive braces AST walkers before ESLint loads. */
export function installGlobGuard(braces) {
  const check = input => {
    if (typeof input === 'string') {
      let depth = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === '\\') { i++; continue; }
        if ('{(['.includes(input[i]) && ++depth > 128) throw new SyntaxError('Glob nesting exceeds 128 levels');
        if ('})]'.includes(input[i])) depth = Math.max(0, depth - 1);
      }
      return;
    }
    if (!input || typeof input !== 'object') return;
    const stack = [[input, 0]], seen = new WeakSet();
    while (stack.length) {
      const [node, depth] = stack.pop();
      if (depth > 128 || seen.has(node)) throw new SyntaxError('Glob AST nesting/cycle exceeds safe bounds');
      seen.add(node);
      for (const child of node.nodes ?? []) stack.push([child, depth + 1]);
    }
  };
  for (const name of ['parse', 'compile', 'expand', 'stringify']) {
    const original = braces[name];
    braces[name] = function(input, options) { check(input); return original.call(this, input, options); };
  }
}
