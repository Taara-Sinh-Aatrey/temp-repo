# Merchant Feedback API

This is a RESTful API for merchants to manage customer feedback and analyze insights.

## Features

- **Merchant Authentication**: Google OAuth integration for secure merchant authentication
- **QR Code Generation**: Create and manage QR codes that customers can scan to provide feedback
- **Dashboard Analytics**: 
  - Total feedback counts with time series data
  - Customer revisit analysis
  - Sentiment analysis
  - Top and bottom trends identification
- **Query Support**: Natural language query processing via external microservice

## Tech Stack

- **Node.js & Express.js**: Backend framework
- **PostgreSQL**: Database with Knex.js as the query builder
- **Passport.js**: Authentication middleware for Google OAuth
- **AWS S3**: Cloud storage for feedback images
- **QRCode.js**: QR code generation

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new merchant
- `GET /api/auth/google`: Initiate Google OAuth flow
- `GET /api/auth/google/callback`: Google OAuth callback handler
- `GET /api/auth/profile`: Get merchant profile
- `PUT /api/auth/profile`: Update merchant profile

### QR Codes

- `POST /api/qrcode`: Generate a new QR code
- `GET /api/qrcode`: Get all QR codes for a merchant
- `GET /api/qrcode/:id`: Get a specific QR code
- `DELETE /api/qrcode/:id`: Delete a QR code

### Dashboard

- `GET /api/dashboard/overview`: Get complete dashboard overview
- `GET /api/dashboard/feedback`: Get total feedback count data
- `GET /api/dashboard/revisits`: Get customer revisit data
- `GET /api/dashboard/sentiment`: Get sentiment analysis data
- `GET /api/dashboard/top-trends`: Get top trends data
- `GET /api/dashboard/bottom-trends`: Get bottom trends data

### Query

- `POST /api/query`: Process a natural language query

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run the server:
   ```
   npm start
   ```

For development:
```
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

- Database credentials
- Google OAuth credentials
- AWS S3 configuration
- JWT secret
- Query service URL and API key

## Database Schema

The database includes the following tables:

### Core Tables
- `customers`: User information for people who provide feedback
- `merchants`: Business information for merchants
- `merchant_spocs`: Single Point of Contact information for merchants
- `feedback`: Customer feedback data with sentiment analysis
- `QRCodes`: QR codes associated with merchants

### Optimization Tables
- `customer_visits`: Tracks customer revisit frequency for faster analytics
- `trending_topics`: Stores pre-computed trends for dashboard performance
- `sentiment_summary`: Stores pre-aggregated sentiment data by time period

### Database Migrations

The project uses Knex.js migrations to manage the database schema. Migration files are located in the `migrations` directory.

To run migrations:
```
npm run migrate
```

To rollback migrations:
```
npm run migrate:rollback
```

To create a new migration:
```
npm run migrate:make migration_name
```

### Schema Documentation

You can generate a PDF document of the database schema using:
```
npm run schema:pdf
```

This will create a file called `schema-documentation.pdf` in the root directory.

## Project Structure

```
merchant-api/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
├── app.js          # Application entry point
└── package.json    # Dependencies and scripts
```

## Error Handling

The API uses consistent error responses:

- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Valid token but insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server-side error

Error response format:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## License

This project is proprietary and confidential.