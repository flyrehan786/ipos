# POS Application (Point of Sale)

A complete Point of Sale application built with Node.js, MySQL, and Angular 16.

## Features

- **User Management**: Complete authentication and authorization system with role-based access (Admin, Manager, Cashier)
- **Client Management**: Manage customer database with credit limits and balances
- **Product Management**: Inventory management with barcode support, categories, and stock tracking
- **Sale Orders**: Create and manage sales with discount, tax, and payment tracking
- **Purchase Orders**: Manage purchases from suppliers with complete order tracking
- **Transactions**: Complete payment and transaction history
- **Barcode Scanner**: Built-in barcode scanner support for quick product lookup
- **Dashboard**: Overview of sales, purchases, and inventory status

## Technology Stack

### Backend
- Node.js with Express.js
- MySQL Database
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- Angular 16
- Bootstrap 5
- Bootstrap Icons
- Barcode Scanner Support (works with handheld scanners)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure database connection:
   - Edit `.env` file and update database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

4. Create database and seed data:
```bash
npm run seed
```
This will:
- Create the database
- Create all tables
- Insert 1000+ records in each table

5. Start the backend server:
```bash
npm start
```
or for development:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## Default Login Credentials

After seeding the database, you can login with:

- **Username**: admin
- **Password**: password123

Other test accounts:
- **Username**: manager | **Password**: password123
- **Username**: cashier | **Password**: password123

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register new user
- GET `/api/auth/profile` - Get user profile
- POST `/api/auth/change-password` - Change password

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Clients
- GET `/api/clients` - Get all clients
- GET `/api/clients/search?q=term` - Search clients
- GET `/api/clients/:id` - Get client by ID
- POST `/api/clients` - Create new client
- PUT `/api/clients/:id` - Update client
- DELETE `/api/clients/:id` - Delete client

### Products
- GET `/api/products` - Get all products
- GET `/api/products/search?q=term` - Search products
- GET `/api/products/barcode/:barcode` - Get product by barcode
- GET `/api/products/low-stock` - Get low stock products
- GET `/api/products/:id` - Get product by ID
- POST `/api/products` - Create new product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Sale Orders
- GET `/api/sale-orders` - Get all sale orders
- GET `/api/sale-orders/date-range?startDate=&endDate=` - Get orders by date range
- GET `/api/sale-orders/:id` - Get sale order by ID
- POST `/api/sale-orders` - Create new sale order
- PUT `/api/sale-orders/:id` - Update sale order
- POST `/api/sale-orders/:id/payment` - Add payment to order
- DELETE `/api/sale-orders/:id` - Delete sale order

### Purchase Orders
- GET `/api/purchase-orders` - Get all purchase orders
- GET `/api/purchase-orders/date-range?startDate=&endDate=` - Get orders by date range
- GET `/api/purchase-orders/:id` - Get purchase order by ID
- POST `/api/purchase-orders` - Create new purchase order
- PUT `/api/purchase-orders/:id` - Update purchase order
- POST `/api/purchase-orders/:id/payment` - Add payment to order
- DELETE `/api/purchase-orders/:id` - Delete purchase order

### Transactions
- GET `/api/transactions` - Get all transactions
- GET `/api/transactions/date-range?startDate=&endDate=` - Get transactions by date range
- GET `/api/transactions/reference/:type/:id` - Get transactions by reference
- GET `/api/transactions/:id` - Get transaction by ID
- POST `/api/transactions` - Create new transaction
- DELETE `/api/transactions/:id` - Delete transaction

## Features in Detail

### Barcode Scanner
The application includes barcode scanning support that works with:
- **Handheld barcode scanners**: Connect a USB or Bluetooth barcode scanner - it will input directly into the field
- **Manual entry**: Type barcodes manually and press Enter
Simply click the "Scan Barcode" button when creating a sale order to quickly add products.

### Discount & Tax Management
Both sale and purchase orders support:
- No discount
- Percentage-based discount
- Fixed amount discount
- Tax rate configuration

### Payment Tracking
- Track partial payments
- Multiple payment methods (Cash, Card, Bank Transfer, Cheque)
- Automatic payment status updates (Unpaid, Partial, Paid)

### Stock Management
- Automatic stock updates on sales and purchases
- Low stock alerts
- Minimum stock level configuration

### User Roles
- **Admin**: Full access to all features including user management
- **Manager**: Access to all features except user management
- **Cashier**: Limited access to sales and basic operations

## Database Schema

The application uses the following main tables:
- `users` - System users with authentication
- `clients` - Customer database
- `products` - Product inventory
- `sale_orders` & `sale_order_items` - Sales transactions
- `purchase_orders` & `purchase_order_items` - Purchase transactions
- `transactions` - Payment and transaction history

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## Support

For issues and questions, please create an issue in the repository.

## License

This project is licensed under the ISC License.
