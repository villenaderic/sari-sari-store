use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sale {
    pub id: i64,
    pub receipt_number: String,
    pub customer_id: Option<i64>,
    pub payment_type: String, // "CASH" or "CREDIT"
    pub subtotal: i64,
    pub total: i64,
    pub cash_received: i64,
    pub change_amount: i64,
    pub status: String, // "COMPLETED", "VOIDED"
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaleItem {
    pub id: i64,
    pub sale_id: i64,
    pub product_id: i64,
    pub quantity: i32,
    pub unit_price: i64,
    pub subtotal: i64,
}
