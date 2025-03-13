#!/bin/bash

# Create main project directory
mkdir -p merchant-api

# Navigate to project directory
cd merchant-api

echo "Migration files created successfully!"

# Create directory structure
mkdir -p migrations config controllers middleware models routes services utils scripts

touch merchant-api/migrations/20230101000000_create_initial_tables.js
touch merchant-api/migrations/20230101000001_add_indexes.js
touch merchant-api/migrations/20230101000002_create_additional_tables.js

# Create config files
touch config/database.js config/s3.js config/passport.js

# Create controller files
touch controllers/authController.js controllers/qrCodeController.js controllers/dashboardController.js controllers/queryController.js

# Create middleware files
touch middleware/auth.js middleware/validation.js

# Create model files
touch models/Customer.js models/Merchant.js models/MerchantSpoc.js models/Feedback.js models/QRCode.js models/db.js

# Create route files
touch routes/auth.js routes/qrCode.js routes/dashboard.js routes/query.js

# Create service files
touch services/authService.js services/qrCodeService.js services/dashboardService.js services/queryService.js services/s3Service.js

# Create utility files
touch utils/logger.js utils/helpers.js

# Create root files
touch .env.example .gitignore app.js package.json README.md

touch scripts/run-migrations.js
touch scripts/generate-schema-pdf.js

# Initialize npm project (without prompts)
npm init -y

# Create a basic .gitignore file
cat > .gitignore << EOL
node_modules/
.env
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
coverage/
.DS_Store
EOL

echo "Project structure created successfully!"