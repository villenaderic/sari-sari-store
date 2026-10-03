// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod errors;
mod models;
mod commands;
// mod services;

use database::Database;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let db = Database::new(app.handle())?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::product::get_products,
            commands::product::get_product,
            commands::product::create_product,
            commands::product::update_product,
            commands::product::delete_product,
            commands::category::get_categories,
            commands::category::create_category,
            commands::category::update_category,
            commands::category::delete_category,
            commands::customer::get_customers,
            commands::customer::create_customer,
            commands::customer::update_customer,
            commands::customer::delete_customer,
            commands::inventory::get_stock_movements,
            commands::inventory::add_stock_movement,
            commands::sale::get_sales,
            commands::sale::create_sale,
            commands::utang::get_utang_balances,
            commands::utang::get_utang_transactions,
            commands::utang::record_utang_payment,
            commands::backup::backup_database,
            commands::backup::restore_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
