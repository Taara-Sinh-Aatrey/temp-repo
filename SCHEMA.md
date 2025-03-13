# Database Schema Documentation

## Core Tables

### customers
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| first_name         | VARCHAR(255)  | No       |                          | Customer's first name            |
| last_name          | VARCHAR(255)  | Yes      |                          | Customer's last name             |
| email              | VARCHAR(255)  | No       |                          | Customer's email (unique)        |
| google_oauth_id    | VARCHAR(255)  | No       |                          | Google OAuth ID (unique)         |
| profile_pic        | TEXT          | Yes      |                          | URL to profile picture           |
| gender             | VARCHAR(50)   | Yes      |                          | Customer's gender                |
| primary_language   | VARCHAR(50)   | Yes      |                          | Customer's preferred language    |
| created_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updated_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |

### merchants
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| first_name         | VARCHAR(255)  | No       |                          | Merchant's first name            |
| last_name          | VARCHAR(255)  | No       |                          | Merchant's last name             |
| email              | VARCHAR(255)  | No       |                          | Merchant's email (unique)        |
| phone_number       | VARCHAR(20)   | No       |                          | Merchant's phone number (unique) |
| business_name      | VARCHAR(255)  | No       |                          | Name of the business             |
| brand_name         | VARCHAR(255)  | Yes      |                          | Brand name (if different)        |
| brand_logo         | TEXT          | Yes      |                          | URL to brand logo                |
| industry           | VARCHAR(100)  | No       |                          | Industry category                |
| sub_industry       | VARCHAR(100)  | No       |                          | Sub-industry category            |
| location_lat       | DECIMAL(10,8) | No       |                          | Location latitude                |
| location_lng       | DECIMAL(11,8) | No       |                          | Location longitude               |
| google_place_id    | VARCHAR(255)  | Yes      |                          | Google Place ID (unique)         |
| status             | ENUM          | No       | 'active'                 | Account status                   |
| created_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updated_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |

### merchant_spocs
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| merchant_id        | UUID          | No       |                          | Foreign key to merchants         |
| name               | VARCHAR(255)  | No       |                          | SPOC name                        |
| email              | VARCHAR(255)  | No       |                          | SPOC email (unique)              |
| phone_number       | VARCHAR(20)   | No       |                          | SPOC phone number (unique)       |
| created_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |

### feedback
| Column               | Type          | Nullable | Default                  | Description                      |
|----------------------|---------------|----------|--------------------------|----------------------------------|
| id                   | UUID          | No       | gen_random_uuid()        | Primary key                      |
| customer_id          | UUID          | No       |                          | Foreign key to customers         |
| merchant_id          | UUID          | No       |                          | Foreign key to merchants         |
| qr_code_id           | UUID          | Yes      |                          | Foreign key to QRCodes           |
| feedback_id          | VARCHAR(255)  | Yes      |                          | External feedback reference ID   |
| language             | VARCHAR(50)   | Yes      |                          | Language of feedback             |
| place                | VARCHAR(255)  | Yes      |                          | Location of feedback             |
| raw_text             | TEXT          | Yes      |                          | Original feedback text           |
| translated_text      | TEXT          | Yes      |                          | Translated feedback text         |
| entities             | TEXT[]        | Yes      |                          | Extracted keywords/entities      |
| magnitude            | FLOAT         | Yes      |                          | Sentiment magnitude              |
| score                | FLOAT         | Yes      |                          | Sentiment score (-1 to +1)       |
| category             | VARCHAR(255)  | Yes      |                          | Feedback category                |
| discount_percentage  | FLOAT         | Yes      |                          | Discount percentage (0-100)      |
| is_discount_claimed  | BOOLEAN       | No       | FALSE                    | Whether discount was claimed     |
| discount_claimed_date| TIMESTAMP     | Yes      |                          | When discount was claimed        |
| discount_expiry_date | TIMESTAMP     | Yes      |                          | When discount expires            |
| created_at           | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updated_at           | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |
| images               | TEXT[]        | Yes      |                          | Array of S3 object IDs           |

### QRCodes
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| merchantId         | UUID          | No       |                          | Foreign key to merchants         |
| labelName          | VARCHAR(255)  | No       |                          | QR code label                    |
| qrCode             | TEXT          | No       |                          | QR code image data               |
| createdAt          | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updatedAt          | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |
| deletedAt          | TIMESTAMP     | Yes      |                          | Soft delete timestamp            |

## Optimization Tables

### customer_visits
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| customer_id        | UUID          | No       |                          | Foreign key to customers         |
| merchant_id        | UUID          | No       |                          | Foreign key to merchants         |
| visit_count        | INTEGER       | No       | 1                        | Number of visits                 |
| first_visit        | TIMESTAMP     | No       |                          | First visit timestamp            |
| last_visit         | TIMESTAMP     | No       |                          | Most recent visit timestamp      |
| created_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updated_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |

**Unique Constraint:** (customer_id, merchant_id)

### trending_topics
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| merchant_id        | UUID          | No       |                          | Foreign key to merchants         |
| entity             | VARCHAR(255)  | No       |                          | Topic/entity name                |
| count              | INTEGER       | No       | 0                        | Occurrence count                 |
| is_positive        | BOOLEAN       | No       |                          | Positive or negative trend       |
| date_period        | DATE          | No       |                          | Period this trend covers         |
| created_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updated_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |

**Unique Constraint:** (merchant_id, entity, is_positive, date_period)

### sentiment_summary
| Column             | Type          | Nullable | Default                  | Description                      |
|--------------------|---------------|----------|--------------------------|----------------------------------|
| id                 | UUID          | No       | gen_random_uuid()        | Primary key                      |
| merchant_id        | UUID          | No       |                          | Foreign key to merchants         |
| date_period        | DATE          | No       |                          | Period this summary covers       |
| positive_count     | INTEGER       | No       | 0                        | Count of positive feedback       |
| negative_count     | INTEGER       | No       | 0                        | Count of negative feedback       |
| neutral_count      | INTEGER       | No       | 0                        | Count of neutral feedback        |
| average_score      | FLOAT         | No       | 0                        | Average sentiment score          |
| qr_label           | VARCHAR(255)  | Yes      |                          | QR code label (for filtering)    |
| created_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record creation timestamp        |
| updated_at         | TIMESTAMP     | No       | CURRENT_TIMESTAMP        | Record update timestamp          |

**Unique Constraint:** (merchant_id, date_period, qr_label)

## Indexes

### merchants Table Indexes
- `idx_merchants_email` on `email`
- `idx_merchants_status` on `status`
- `idx_merchants_industry` on `industry`

### feedback Table Indexes
- `idx_feedback_merchant_id` on `merchant_id`
- `idx_feedback_customer_id` on `customer_id`
- `idx_feedback_score` on `score`
- `idx_feedback_created_at` on `created_at`
- `idx_feedback_merchant_created` on `(merchant_id, created_at)`
- `idx_feedback_entities` on `entities` using GIN
- `idx_feedback_qr_code` on `qr_code_id`
- `idx_feedback_feedback_id` on `feedback_id`

### QRCodes Table Indexes
- `idx_qrcodes_merchantid` on `merchantId`
- `idx_qrcodes_labelname` on `labelName`
- `idx_qrcodes_deleted` on `deletedAt` (partial index where deletedAt IS NULL)

### customer_visits Table Indexes
- `idx_customer_visits_merchant` on `merchant_id`
- `idx_customer_visits_count` on `(merchant_id, visit_count)`

### trending_topics Table Indexes
- `idx_trending_merchant_positive` on `(merchant_id, is_positive, date_period)`
- `idx_trending_count` on `count`

### sentiment_summary Table Indexes
- `idx_sentiment_merchant_date` on `(merchant_id, date_period)`
- `idx_sentiment_qr_label` on `(merchant_id, qr_label, date_period)`