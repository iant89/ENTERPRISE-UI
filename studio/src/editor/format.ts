/** Formats TypeScript/JSX with Prettier, loaded on first use. */
export async function formatCode(code: string): Promise<string> {
  const [prettier, typescript, estree] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/typescript'),
    import('prettier/plugins/estree'),
  ]);
  return prettier.format(code, { parser: 'typescript', plugins: [typescript, estree], singleQuote: true, printWidth: 100 });
}
