# Finova 💳

Finova is a modern fintech web application built with Next.js and TypeScript. It provides users with a digital wallet experience where they can manage their balance, add money, send money, view transactions, and initiate withdrawals.

The project is being built as a real-world full-stack application to demonstrate authentication, API design, database transactions, payment integration, and secure financial data flows.

## 🚀 Features

### Authentication

* User registration
* User login
* JWT-based authentication
* HTTP-only authentication cookie
* Protected dashboard routes
* Password hashing with bcrypt

### Wallet

* Automatic wallet creation
* Wallet balance
* NGN currency support
* Secure wallet updates

### Add Money

* Paystack payment integration
* Payment initialization
* Payment verification
* Wallet balance update after successful payment
* Transaction creation

### Send Money

* Send money to another Finova user
* Recipient lookup
* Balance validation
* Prevent self-transfer
* Atomic MongoDB transactions
* Debit sender wallet
* Credit recipient wallet
* Transaction references

### Transactions

* Transaction history
* Credit and debit transactions
* Transaction status
* Transaction references
* Transaction details page

### Withdraw

* Nigerian bank selection
* Bank account verification
* Account name resolution
* Withdrawal amount validation
* Wallet balance validation
* Pending withdrawal transactions
* Paystack transfer integration in progress

### UI

* Responsive dashboard
* Mobile-friendly navigation
* shadcn/ui components
* Tailwind CSS
* Lucide icons
* Loading and error states
* Toast notifications

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* Sonner

### Backend

* Next.js App Router
* Next.js Route Handlers
* REST APIs
* JWT authentication
* bcrypt
* Mongoose

### Database

* MongoDB
* MongoDB Atlas

### Payments

* Paystack

### Development

* Git
* GitHub
* VS Code

## 🏗️ Architecture

Finova uses the Next.js App Router for both the frontend and backend.

```text
User
 │
 ▼
Next.js Frontend
 │
 ▼
API Route
 │
 ├── Authentication
 │
 ├── Validation
 │
 ├── Business Logic
 │
 ▼
MongoDB / Paystack
 │
 ▼
Response
 │
 ▼
Frontend
```

## 💰 Financial Data Flow

### Add Money

```text
User
 ↓
Enter amount
 ↓
Paystack payment initialization
 ↓
Paystack checkout
 ↓
Payment verification
 ↓
Wallet credited
 ↓
Credit transaction created
```

### Send Money

```text
Sender
 ↓
Enter recipient
 ↓
Validate recipient
 ↓
Check sender balance
 ↓
MongoDB transaction
 ├── Debit sender
 ├── Credit recipient
 ├── Create sender transaction
 └── Create recipient transaction
 ↓
Commit
```

### Withdraw

```text
User
 ↓
Select bank
 ↓
Enter account number
 ↓
Verify account
 ↓
Enter amount
 ↓
Check wallet balance
 ↓
Create withdrawal
 ↓
Debit wallet
 ↓
Create pending transaction
 ↓
Bank transfer processing
```

## 🔐 Security

Finova is designed with security principles in mind.

* Passwords are hashed before storage
* JWT authentication uses HTTP-only cookies
* Paystack secret keys remain server-side
* Protected API routes require authentication
* Users can only access their own wallet data
* Wallet transfers use MongoDB transactions
* Financial operations validate balances before processing
* Environment variables are used for secrets

> Never commit `.env.local` or any other file containing API keys, database credentials, or authentication secrets.

## 📁 Project Structure

```text
finova/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── users/
│   │   │   ├── wallet/
│   │   │   ├── transactions/
│   │   │   ├── transfer/
│   │   │   ├── payments/
│   │   │   ├── banks/
│   │   │   └── withdraw/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── add-money/
│   │   │   ├── send-money/
│   │   │   ├── withdraw/
│   │   │   └── transactions/
│   │   │
│   │   ├── login/
│   │   ├── signup/
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── dbConfig/
│   ├── helpers/
│   └── models/
│
├── public/
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/finova.git
cd finova
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
MONGODB_URI=
JWT_SECRET=

PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```

Never commit this file to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

## 🧪 Development

Finova is currently under active development.

Some features are complete while others are still being developed and improved.

Current development focus:

```text
Authentication       ✅
Wallet               ✅
Add Money            ✅
Send Money           ✅
Transactions         ✅
Transaction Details  ✅
Withdraw             🔄
Profile              ⏳
Settings             ⏳
Notifications        ⏳
Airtime              ⏳
Data                 ⏳
Bills                ⏳
Admin Dashboard      ⏳
```

## 🧠 What This Project Demonstrates

Finova is more than a UI project. It demonstrates practical full-stack concepts including:

* REST API design
* Authentication and authorization
* JWT sessions
* Database modeling
* MongoDB relationships
* Atomic database transactions
* Payment integration
* Financial data flow
* API validation
* Error handling
* Protected routes
* Client/server data flow
* Transaction references
* Pending/success/failed states
* Third-party API integration

## ⚠️ Disclaimer

Finova is a personal development and portfolio project.

It is not intended to hold or process real customer funds in production.

Before using a system like this commercially, additional security, compliance, regulatory, fraud-prevention, monitoring, auditing, and payment-provider requirements would need to be implemented.

## 👨‍💻 Author

**Ahmad Muhammad Tijjani**

Aspiring Full-Stack Developer focused on building practical applications with:

* React
* Next.js
* TypeScript
* MongoDB
* REST APIs
* Authentication

## 📌 Project Status

🚧 **Finova is actively being developed.**

The goal is to continue turning Finova into a complete fintech application while learning real-world backend architecture, system design, API development, database transactions, and secure financial workflows.
