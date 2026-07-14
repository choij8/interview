# STAR Interview Repository

A self-contained, Confluence-inspired interview knowledge base for storing questions and STAR responses.

## Features

- Create, edit, delete and duplicate interview entries
- Separate fields for Situation, Task, Action and Result
- Company, role, category, status, tags, notes and favourites
- Full-text search across every field
- Filter by category, draft, interview-ready status and favourites
- Sort by update date, creation date, question or company
- Create, rename and delete categories
- Import and export JSON
- Import and export CSV
- Local browser storage
- Light and dark modes
- Responsive desktop and mobile layout

## Run it

1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. No installation, account, server or internet connection is required.

Your entries are stored in that browser's local storage. Export a JSON backup regularly, especially before clearing browser data or changing devices.

## CSV format

The exported CSV contains:

`id, question, category, status, company, role, tags, situation, task, action, result, notes, favourite, createdAt, updatedAt`

Tags are separated with `|` in CSV files.

## JSON format

The JSON export contains repository metadata, categories and the complete entries array. When importing, the app lets you either replace the current repository or merge imported entries.

## Important limitation

This version is a local single-user application. It does not sync automatically across devices and does not include authentication, cloud hosting, collaborative editing or file attachments.
