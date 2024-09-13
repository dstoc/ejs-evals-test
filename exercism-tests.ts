import {CodeReference} from './build-context.ts';

export default async function (base: string, docs: CodeReference[]) {
  const exercises = new Set<string>();
  for (const file of docs) {
    exercises.add(file.uri.substr(base.length).split('/')[0]);
  }
  return await Promise.all(
    [...exercises].map(async (exercise) => {
      return {
        vars: {
          exercise,
          context: {
            '=gen': 'file:///build-context.ts',
            args: [
              `${base}`,
              `${base}${exercise}/.docs/instructions.md`,
              `${base}${exercise}/${exercise}.js`,
              `${base}${exercise}/${exercise}.spec.js`,
            ],
          },
          applyContext: {
            '=gen': 'file:///build-context.ts',
            args: [
              `${base}`,
              `${base}${exercise}/${exercise}.js`,
              `${base}${exercise}/${exercise}.spec.js`,
            ],
          },
        },
      };
    }),
  );
}
