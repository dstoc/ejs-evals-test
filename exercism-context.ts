import {CodeReference, default as buildContext} from './build-context.ts';

export default async function (
  exercise: string,
  base: string,
  ...files: CodeReference[]
) {
  const targets = [
    `${base}${exercise}/.docs/instructions.md`,
    `${base}${exercise}/${exercise}.js`,
    `${base}${exercise}/${exercise}.spec.js`,
  ];
  const results = files.filter(({file, uri}) => targets.includes(uri));
  return buildContext(base, ...results);
}
