# daily-todo

A daily markdown-based todo CLI. Tasks are stored as markdown files in a local `todos/` folder, one file per day.

## Installation

```bash
npm install
npm run build
npm link  # makes `todo` available globally
```

## Usage

```bash
todo add "Buy groceries"
todo list
todo done 0
todo delete 1
```

All commands accept optional date flags:

```bash
todo list --yesterday
todo add "Fix bug" --date 2026-03-18
```

## Commands

| Command | Description |
|---|---|
| `add <task>` | Add a new task |
| `list` | List tasks for the day |
| `done <index>` | Toggle a task done/undone |
| `delete <index>` | Delete a task |

Tasks are saved to `todos/YYYY-MM-DD.md` as standard markdown checkboxes.
