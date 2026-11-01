// Where things are, so no script hard-codes a machine's folders.
//   KIT      this kit (the worktree of the kit-backup branch)
//   REPO     the fred checkout: FRED_REPO, else the main worktree of the git repo the kit lives in (the kit is a worktree of it)
//   SCRATCH  the kit's parent folder: built test pages (fred/null.html, fredNN/), item worktrees (wt-qNN)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SCRATCH = path.dirname(KIT);
export const REPO = process.env.FRED_REPO || path.dirname(
  execFileSync('git', ['-C', KIT, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim());
