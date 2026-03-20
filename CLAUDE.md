# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # compile TypeScript to dist/
npm run build:watch  # watch mode
node dist/index.js   # run the CLI after building
```

There are no tests and no linter configured.

## Architecture

Single-file TypeScript CLI (`src/index.ts`) compiled to `dist/index.js`. Uses `commander` for command parsing.

**Data storage:** Tasks are stored as markdown files in `todos/YYYY-MM-DD.md` (gitignored). Each file contains lines like `- [ ] task` and `- [x] task`. The `todos/` directory is created automatically relative to the project root (resolved from `__dirname`).

**Task indexing:** Commands `done` and `delete` take a numeric index that refers to the position among task lines only (lines starting with `- [`), not the raw file line number.

**Date resolution:** All commands accept `--date YYYY-MM-DD` or `--yesterday`; default is today's local date.
