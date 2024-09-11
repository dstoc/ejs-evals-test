export interface CodeReference {
  readonly uri: string;
  readonly file: File;
}
export default async function buildContext(
  base: string,
  ...files: CodeReference[]
) {
  return (
    await Promise.all(
      files.map(async ({file, uri}) => {
        const extension = uri.match(/\.([^.]*?)$/)?.[1] ?? '';
        const path = uri.substr(base.length);
        return {path, extension, content: await file.text()};
      }),
    )
  )
    .map(
      ({path, extension, content}) => `${path}
\`\`\`${extension}
${content}
\`\`\``,
    )
    .join('\n\n');
}
