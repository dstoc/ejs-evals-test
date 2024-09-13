function extractCodeBlocks(
  text: string,
): {file?: string; type?: string; code: string}[] {
  const lines = text.split('\n');
  const results: {file?: string; type?: string; code: string}[] = [];

  let currentFile: string | undefined = undefined;
  let currentType: string | undefined = undefined;
  let currentCode: string[] = [];
  let insideCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!insideCodeBlock) {
      // Look for the start of a code block
      if (line.startsWith('```')) {
        currentType = line.slice(3).trim(); // Get the type after ```
        insideCodeBlock = true;
      } else if (line && !line.startsWith('```')) {
        // Assume it's a filename if it's not empty and doesn't start with ```
        currentFile = line;
      }
    } else {
      // We're inside a code block
      if (line.startsWith('```')) {
        // End of code block
        results.push({
          file: currentFile,
          type: currentType,
          code: currentCode.join('\n'),
        });
        // Reset for the next block
        currentFile = undefined;
        currentType = undefined;
        currentCode = [];
        insideCodeBlock = false;
      } else {
        // Collect code lines
        currentCode.push(lines[i]);
      }
    }
  }

  return results;
}

export function followsEditFormat(
  output: string,
  {vars: {context, suggestion}}: {vars: {context: string; suggestion: string}},
) {
  let editedSomething = false;
  for (const {file, code} of extractCodeBlocks(output)) {
    if (!file) return {pass: false, message: 'Missing file reference'};
    editedSomething = true;
  }
  if (!editedSomething) {
    return {pass: false, message: 'No edits'};
  }
  return {pass: true};
}

export function noNewLines(
  output: string,
  {vars: {context, suggestion}}: {vars: {context: string; suggestion: string}},
) {
  const priorLines = new Set<string>();
  for (const {code} of extractCodeBlocks(context)) {
    for (const line of code.split('\n')) {
      priorLines.add(line);
    }
  }
  for (const {code} of extractCodeBlocks(suggestion)) {
    for (const line of code.split('\n')) {
      priorLines.add(line);
    }
  }
  const newLines: string[] = [];
  for (const {code} of extractCodeBlocks(output)) {
    for (const line of code.split('\n')) {
      if (!priorLines.has(line)) {
        newLines.push(line);
      }
    }
  }
  return {
    pass: newLines.length === 0,
    message: `${newLines.length} new lines`,
  };
}
