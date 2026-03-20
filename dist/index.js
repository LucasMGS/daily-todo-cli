#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const commander_1 = require("commander");
// --- Path utils ---
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TODOS_DIR = path.join(PROJECT_ROOT, 'todos');
function getFilePath(date) {
    return path.join(TODOS_DIR, `${date}.md`);
}
function localDateString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function resolveDate(opts) {
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
function readLines(filePath) {
    if (!fs.existsSync(filePath))
        return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n');
}
function writeLines(filePath, lines) {
    fs.mkdirSync(TODOS_DIR, { recursive: true });
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}
// --- Command functions ---
function addTask(task, date) {
    const filePath = getFilePath(date);
    const lines = readLines(filePath);
    // Strip trailing empty string to avoid growing blank lines
    if (lines[lines.length - 1] === '')
        lines.pop();
    lines.push(`- [ ] ${task}`);
    writeLines(filePath, lines);
    console.log(`Added: ${task}`);
}
function listTasks(date) {
    const filePath = getFilePath(date);
    const lines = readLines(filePath);
    const tasks = lines.filter(l => l.startsWith('- ['));
    console.log(`tasks for ${date}`);
    if (tasks.length === 0) {
        return;
    }
    tasks.forEach((task, i) => console.log(`[${i}] ${task}`));
}
function doneTask(index, date) {
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
    }
    else {
        lines[fileIndex] = target.replace('- [x]', '- [ ]');
    }
    writeLines(filePath, lines);
    console.log(`Toggled: ${lines[fileIndex]}`);
}
function deleteTask(index, date) {
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
const program = new commander_1.Command();
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
