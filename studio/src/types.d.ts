declare module 'virtual:studio-types' {
  /** Declaration files keyed by their virtual `file:///node_modules/...` path. */
  const files: Record<string, string>;
  export default files;
}

// Monaco feature modules imported only for their side effects ship without declarations.
declare module 'monaco-editor/editor/contrib/*';
declare module 'monaco-editor/editor/browser/*';
declare module 'monaco-editor/features/*';
declare module 'monaco-editor/base/*';
