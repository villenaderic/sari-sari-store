use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: i64,
    pub category_id: Option<i64>,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub name: String,
    pub unit: String,
    pub cost_price: i64, // in centavos
    pub selling_price: i64, // in centavos
    pub stock_quantity: i32,
    pub reorder_level: i32,
    pub supplier: Option<String>,
    pub status: String, // e.g. "ACTIVE", "INACTIVE"
    pub created_at: String,
    pub updated_at: String,
}
