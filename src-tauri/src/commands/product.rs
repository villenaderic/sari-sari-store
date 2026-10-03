use crate::models::product::Product;
use crate::errors::{Result, AppError};
use tauri::State;
use crate::database::Database;
use rusqlite::params;

#[tauri::command]
pub fn get_products(db: State<'_, Database>) -> Result<Vec<Product>> {
    let conn = db.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, category_id, sku, barcode, name, unit, cost_price, selling_price, stock_quantity, reorder_level, supplier, status, created_at, updated_at FROM products ORDER BY name ASC")?;
    
    let products = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            category_id: row.get(1)?,
            sku: row.get(2)?,
            barcode: row.get(3)?,
            name: row.get(4)?,
            unit: row.get(5)?,
            cost_price: row.get(6)?,
            selling_price: row.get(7)?,
            stock_quantity: row.get(8)?,
            reorder_level: row.get(9)?,
            supplier: row.get(10)?,
            status: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    })?.collect::<std::result::Result<Vec<_>, _>>()?;
    
    Ok(products)
}

#[tauri::command]
pub fn get_product(db: State<'_, Database>, id: i64) -> Result<Product> {
    let conn = db.get_connection()?;
    let mut stmt = conn.prepare("SELECT id, category_id, sku, barcode, name, unit, cost_price, selling_price, stock_quantity, reorder_level, supplier, status, created_at, updated_at FROM products WHERE id = ?1")?;
    
    let product = stmt.query_row(params![id], |row| {
        Ok(Product {
            id: row.get(0)?,
            category_id: row.get(1)?,
            sku: row.get(2)?,
            barcode: row.get(3)?,
            name: row.get(4)?,
            unit: row.get(5)?,
            cost_price: row.get(6)?,
            selling_price: row.get(7)?,
            stock_quantity: row.get(8)?,
            reorder_level: row.get(9)?,
            supplier: row.get(10)?,
            status: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    })?;
    
    Ok(product)
}

#[tauri::command]
pub fn create_product(db: State<'_, Database>, product: Product) -> Result<Product> {
    let conn = db.get_connection()?;
    
    // Check if barcode already exists
    if let Some(ref barcode) = product.barcode {
        if !barcode.is_empty() {
            let mut stmt = conn.prepare("SELECT COUNT(*) FROM products WHERE barcode = ?1")?;
            let count: i64 = stmt.query_row(params![barcode], |row| row.get(0))?;
            if count > 0 {
                return Err(AppError::Validation("Barcode is already assigned to another product.".into()));
            }
        }
    }

    if let Some(ref sku) = product.sku {
        if !sku.is_empty() {
            let mut stmt = conn.prepare("SELECT COUNT(*) FROM products WHERE sku = ?1")?;
            let count: i64 = stmt.query_row(params![sku], |row| row.get(0))?;
            if count > 0 {
                return Err(AppError::Validation("SKU is already assigned to another product.".into()));
            }
        }
    }

    conn.execute(
        "INSERT INTO products (category_id, sku, barcode, name, unit, cost_price, selling_price, stock_quantity, reorder_level, supplier, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            product.category_id,
            product.sku,
            product.barcode,
            product.name,
            product.unit,
            product.cost_price,
            product.selling_price,
            product.stock_quantity,
            product.reorder_level,
            product.supplier,
            product.status
        ],
    )?;
    
    let id = conn.last_insert_rowid();
    get_product(db, id)
}

#[tauri::command]
pub fn update_product(db: State<'_, Database>, product: Product) -> Result<Product> {
    let conn = db.get_connection()?;
    
    // Validate uniqueness except for current product
    if let Some(ref barcode) = product.barcode {
        if !barcode.is_empty() {
            let mut stmt = conn.prepare("SELECT COUNT(*) FROM products WHERE barcode = ?1 AND id != ?2")?;
            let count: i64 = stmt.query_row(params![barcode, product.id], |row| row.get(0))?;
            if count > 0 {
                return Err(AppError::Validation("Barcode is already assigned to another product.".into()));
            }
        }
    }

    conn.execute(
        "UPDATE products SET 
            category_id = ?1, sku = ?2, barcode = ?3, name = ?4, unit = ?5, 
            cost_price = ?6, selling_price = ?7, stock_quantity = ?8, 
            reorder_level = ?9, supplier = ?10, status = ?11,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?12",
        params![
            product.category_id,
            product.sku,
            product.barcode,
            product.name,
            product.unit,
            product.cost_price,
            product.selling_price,
            product.stock_quantity,
            product.reorder_level,
            product.supplier,
            product.status,
            product.id
        ],
    )?;
    
    get_product(db, product.id)
}

#[tauri::command]
pub fn delete_product(db: State<'_, Database>, id: i64) -> Result<()> {
    let conn = db.get_connection()?;
    
    // Check if product is used in sales
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM sale_items WHERE product_id = ?1")?;
    let count: i64 = stmt.query_row(params![id], |row| row.get(0))?;
    if count > 0 {
         return Err(AppError::BusinessRule("Cannot delete product because it has been sold before. Set status to INACTIVE instead.".into()));
    }

    conn.execute("DELETE FROM products WHERE id = ?1", params![id])?;
    Ok(())
}
