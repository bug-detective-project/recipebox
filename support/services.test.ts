import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const read = (file: string): string => readFileSync(join(root, file), 'utf8');

describe('the services of the project', () => {
  it('are declared here exactly as in services.json of main, which its CI uses', () => {
    const declared = JSON.parse(read('package.json')).bugDetective.project.services;
    // main is a branch of the same repository; in a clone without a local main, origin/main.
    const show = (ref: string): string => execFileSync('git', ['show', `${ref}:services.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    let onMain: string;
    try {
      onMain = show('main');
    } catch {
      onMain = show('origin/main');
    }

    expect(JSON.parse(onMain)).toEqual(declared);
  });
});

describe('the QA CLI', () => {
  it('has nothing left of a database kept in a file', () => {
    const cli = read('run.ts');

    expect(cli).not.toMatch(/sqlite|DATABASE_PATH|\.db\b/i);
    expect(cli).toContain("['run', 'db:reset']");
  });

  it('refuses to run without the address of the database, in the language asked', () => {
    const run = (lang: string): string => {
      try {
        execFileSync(process.execPath, ['run.ts', '--ticket', '1', '--workspace', '.', '--package', 'tickets', '--lang', lang], {
          cwd: root,
          encoding: 'utf8',
          env: { PATH: process.env.PATH },
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        return 'no error';
      } catch (error) {
        return `${(error as { status: number }).status} ${(error as { stderr: string }).stderr}`;
      }
    };

    expect(run('en')).toMatch(/^2 DATABASE_URL is not set/);
    expect(run('pt')).toMatch(/^2 DATABASE_URL não está definida/);
  });
});
