#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import { Command } from 'commander';

// --- Path utils ---
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODOS_DIR = path.join(PROJECT_ROOT, 'todos');

function getFilePath(date: string): string {
  return path.join(TODOS_DIR, `${date}.md`);
}

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function resolveDate(opts: { date?: string; yesterday?: boolean }): string {
  if (opts.date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.date)) {
      console.error(`Invalid date format: "${opts.date}". Expected YYYY-MM-DD.`);
      process.exit(1);
    }
    return opts.date;
  }
  if (opts.yesterday) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return localDateString(d);
  }
  return localDateString(new Date());
}

// --- File I/O helpers ---
function readLines(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n');
}

function writeLines(filePath: string, lines: string[]): void {
  fs.mkdirSync(TODOS_DIR, { recursive: true });
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

// --- Command functions ---
function addTask(task: string, date: string): void {
  const filePath = getFilePath(date);
  const lines = readLines(filePath);
  // Strip trailing empty string to avoid growing blank lines
  if (lines[lines.length - 1] === '') lines.pop();
  lines.push(`- [ ] ${task}`);
  writeLines(filePath, lines);
  console.log(`Added: ${task}`);
}

function listTasks(date: string): void {
  const filePath = getFilePath(date);
  const lines = readLines(filePath);
  const tasks = lines.filter(l => l.startsWith('- ['));
  console.log(`tasks for ${date}`);
  if (tasks.length === 0) {
    return;
  }
  tasks.forEach((task, i) => console.log(`[${i}] ${task}`));
}

function doneTask(index: string, date: string): void {
  const i = parseInt(index, 10);
  const filePath = getFilePath(date);
  const lines = readLines(filePath);
  const tasks = lines.filter(l => l.startsWith('- ['));
  if (i < 0 || i >= tasks.length) {
    console.error(`Index ${i} out of range (0–${tasks.length - 1})`);
    process.exit(1);
  }
  const target = tasks[i];
  const fileIndex = lines.indexOf(target);
  if (target.startsWith('- [ ]')) {
    lines[fileIndex] = target.replace('- [ ]', '- [x]');
  } else {
    lines[fileIndex] = target.replace('- [x]', '- [ ]');
  }
  writeLines(filePath, lines);
  console.log(`Toggled: ${lines[fileIndex]}`);
}

function deleteTask(index: string, date: string): void {
  const i = parseInt(index, 10);
  const filePath = getFilePath(date);
  const lines = readLines(filePath);
  const tasks = lines.filter(l => l.startsWith('- ['));
  if (i < 0 || i >= tasks.length) {
    console.error(`Index ${i} out of range (0–${tasks.length - 1})`);
    process.exit(1);
  }
  const target = tasks[i];
  const fileIndex = lines.indexOf(target);
  lines.splice(fileIndex, 1);
  writeLines(filePath, lines);
  console.log(`Deleted: ${target}`);
}

// --- Commander wiring ---
const program = new Command();

program
  .name('todo')
  .description('Daily markdown-based todo CLI')
  .version('1.0.0');

program
  .command('add <task>')
  .description('Add a new task')
  .option('--date <YYYY-MM-DD>', 'Target date (default: today)')
  .option('--yesterday', 'Target yesterday')
  .action((task, opts) => addTask(task, resolveDate(opts)));

program
  .command('list')
  .description('List tasks')
  .option('--date <YYYY-MM-DD>', 'Target date (default: today)')
  .option('--yesterday', 'Target yesterday')
  .action(opts => listTasks(resolveDate(opts)));

program
  .command('done <index>')
  .description('Toggle a task done/undone by index')
  .option('--date <YYYY-MM-DD>', 'Target date (default: today)')
  .option('--yesterday', 'Target yesterday')
  .action((index, opts) => doneTask(index, resolveDate(opts)));

program
  .command('delete <index>')
  .description('Delete a task by index')
  .option('--date <YYYY-MM-DD>', 'Target date (default: today)')
  .option('--yesterday', 'Target yesterday')
  .action((index, opts) => deleteTask(index, resolveDate(opts)));

program.parse(process.argv);
