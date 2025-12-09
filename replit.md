# Overview

KemisPay is a comprehensive payment processing platform designed for vendors to accept payments without requiring their own merchant accounts. The application provides a complete dashboard solution for managing payments, generating payment links, handling withdrawals, and managing KYC (Know Your Customer) documentation. Built as a full-stack web application with a React frontend and Express.js backend, it integrates with Stripe for payment processing and includes features for file storage, session management, and administrative oversight.

The platform is designed with a mobile-first approach, ensuring optimal user experience across all device types. KYC documents are securely stored using Storj buckets for enhanced security and decentralized storage.

# User Preferences

Preferred communication style: Simple, everyday language.
Branding: KemisPay LLC, a subsidiary of Kemis Group of Companies Inc.
Design approach: Mobile-first design, professional business aesthetic
File storage: Use Storj buckets for KYC document storage
Email service: AWS SES for transactional emails (waitlist@kemispay.com)
Waitlist page: Home page for new visitors with professional landing page design

# Recent Updates (December 9, 2025)

## Waitlist Landing Page & Email Integration
- Created beautiful, professional Bahamas waitlist landing page with hero section
- Implemented intuitive form to collect name, email, and phone number
- Integrated AWS SES (Simple Email Service) for sending confirmation emails
- Added "KemisPay Waitlist" as the sender name for professional branding
- Created waitlist table in PostgreSQL database with Drizzle ORM
- Implemented waitlist API endpoint at `/api/waitlist/join`
- Added "Request Early Access" button that scrolls to hero section
- Created Privacy Policy page at `/privacy`
- Created Terms of Service page at `/terms`
- Updated footer with scrollable navigation links:
  - "Why KemisPay" scrolls to features section
  - "Local" scrolls to "Built for the Bahamas" section
  - Privacy and Terms links navigate to their respective pages
- Updated company footer text: "KemisPay LLC, a subsidiary of Kemis Group of Companies Inc."
- Fixed input placeholder text colors to white for better visibility
- Set waitlist page as the home page (`/`) for new visitors

## Login Bug Fixes (Previous)
- Fixed frontend login condition to properly check for token and vendor
- Updated backend error handling to provide consistent API responses
- Improved Zod validation error messages

## Original Setup
- Updated branding from ChemistPay to KemisPay
- Implemented mobile-first responsive design
- Set up PostgreSQL database with Drizzle ORM
- Configured Stripe integration for payment processing
- Created vendor dashboard with balance overview, payment history, and withdrawal functionality
- Implemented KYC document upload system with full Storj integration using S3 API
- Added admin panel for KYC document review

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a modern component-based architecture. The UI framework leverages shadcn/ui components built on top of Radix UI primitives for accessibility and consistency. Tailwind CSS provides utility-first styling with a custom design system configuration. The application uses Wouter for lightweight client-side routing and React Hook Form with Zod for robust form validation. State management is handled through React Context for authentication and TanStack Query for server state management and caching.

## Backend Architecture
The server follows a REST API architecture using Express.js with TypeScript. The application implements a layered architecture separating concerns between route handlers, business logic services, and data access layers. Authentication is session-based with token management, and the API includes middleware for request logging and error handling. The backend exposes endpoints for vendor management, payment processing, withdrawal requests, KYC document handling, and administrative functions.

## Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for vendors, payments, payment links, withdrawal requests, KYC documents, and sessions. The database design supports vendor balance tracking, payment history, and document management with proper foreign key relationships and constraints.

## Authentication & Authorization
Authentication is implemented using session-based tokens stored in the database with expiration times. The system includes middleware for protecting routes and verifying vendor authentication. Session management allows for secure login/logout functionality with token validation for API requests.

## Payment Processing Integration
Stripe integration handles payment link generation, webhook processing, and payment event tracking. The system creates Stripe products and prices dynamically, manages payment links, and processes webhook events to update payment records and vendor balances automatically.

# External Dependencies

## Payment Processing
- **Stripe**: Core payment processing service for creating payment links, handling transactions, and webhook event processing
- **Stripe React Components**: Frontend integration for payment-related UI components

## Database & ORM
- **PostgreSQL**: Primary database using Neon serverless architecture
- **Drizzle ORM**: Type-safe database operations and schema management
- **Database Migrations**: Schema versioning and deployment through Drizzle Kit

## File Storage
- **Storj**: Decentralized cloud storage for KYC document uploads and management (service layer implemented but not fully integrated)

## Email Service
- **AWS SES (Simple Email Service)**: Transactional email service for sending waitlist confirmation emails
- **Email Service Layer**: Custom EmailService class handles all email operations with professional HTML templates

## UI Framework & Styling
- **Radix UI**: Accessible component primitives for all UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography

## Development & Build Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production build optimization for server-side code

## Form Handling & Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

## State Management & API
- **TanStack Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight client-side routing

## Development Environment
- **Replit Integration**: Development environment optimization with runtime error overlay and cartographer plugin