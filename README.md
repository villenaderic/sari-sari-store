# Sari-Sari Store Inventory & Utang Manager

A comprehensive, offline-first desktop application tailored for small sari-sari stores in the Philippines.

## Overview
This application provides local inventory management, Point of Sale (POS), utang (credit) tracking, and sales analytics. It is designed to work completely offline, ensuring data privacy and no recurring cloud costs.

## Features
- **Dashboard**: Real-time overview of sales, utang, and low-stock items.
- **Point of Sale (POS)**: Fast and efficient checkout supporting both Cash and Utang (Credit) payments.
- **Inventory Management**: Track stock levels, stock-ins, adjustments, damages, and history.
- **Utang Ledger**: Maintain precise customer credit balances with payment history.
- **Reports**: Visualize revenue and sales trends.
- **Local Database**: Powered by a robust local SQLite database.
- **Backup & Restore**: Easily export and import your database file for safety.

## Technology Stack
- **Desktop Framework**: [Tauri v2](https://v2.tauri.app/)
- **Frontend**: React, TypeScript, Vite
- **UI/Styling**: Tailwind CSS, shadcn/ui, Lucide Icons, Recharts
- **Backend/Core**: Rust
- **Database**: SQLite (via `rusqlite`)

## Requirements
- **Node.js**: (v18+) For frontend dependency management.
- **Rust**: For building the Tauri application.
- **OS**: Windows, macOS, or Linux.

## Installation & Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   This starts the React frontend and the Tauri backend in development mode.
   ```bash
   npm run tauri dev
   ```

## Building Application & Packaging

To build the production version and generate platform installers (.exe, .msi, .dmg, .AppImage, .deb):

```bash
npm run tauri build
```
The installers will be placed in `src-tauri/target/release/bundle/`.

## Architecture & Data Safety
- The application uses `rusqlite` on the Rust backend for direct, performant database access.
- **Atomic Transactions**: Multi-step operations like completing a sale (which updates sales, stock movements, products, utang ledgers) use atomic SQLite transactions. If any step fails, everything is rolled back to prevent inconsistent data.
- **Money Handling**: Financial calculations are done in centavos (integers) to prevent floating-point precision errors.

## Backup and Restore
- Open the application and navigate to the **Backup & Restore** tab.
- Click **Create Backup** to securely save the `sari_sari.db` database to your computer.
- Click **Restore Database** to load a previous backup. (Note: Restoring will overwrite existing data).

## Troubleshooting
- **Database not found**: The database is initialized on the first launch in your system's AppData/Local AppData directory.
- **Tauri build errors**: Ensure you have installed the necessary OS-specific build dependencies for Tauri.

## License
MIT License
