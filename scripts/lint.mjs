import { createRequire } from 'node:module';
import { installGlobGuard } from './lib/glob-guard.mjs';

const require = createRequire(import.meta.url);
installGlobGuard(require('braces'));
const { ESLint } = await import('eslint');
const eslint = new ESLint();
const results = await eslint.lintFiles(process.argv.slice(2).length ? process.argv.slice(2) : ['.']);
const formatter = await eslint.loadFormatter('stylish');
const output = formatter.format(results);
if (output) process.stdout.write(output);
if (results.some(result => result.errorCount > 0)) process.exitCode = 1;
