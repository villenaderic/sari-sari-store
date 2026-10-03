use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UtangAccount {
    pub id: i64,
    pub customer_id: i64,
    pub status: String, // "ACTIVE", "SETTLED"
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UtangTransaction {
    pub id: i64,
    pub account_id: i64,
    pub transaction_type: String, // "CREDIT_SALE", "PAYMENT", "ADJUSTMENT"
    pub reference_id: Option<String>,
    pub amount: i64, // positive for CREDIT_SALE, negative for PAYMENT ? Wait, let's keep it absolute and use transaction_type to determine +/- or just use +/- natively. Let's use absolute amount and transaction_type.
    pub description: Option<String>,
    pub created_at: String,
}
