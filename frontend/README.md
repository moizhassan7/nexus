# Nexus - Frontend

The frontend for **Nexus**, an AI-native Code and API Security Platform. It provides a stunning, high-performance, and responsive user interface for developers and security teams to monitor, scan, and remediate vulnerabilities.

## Features
- **SaaS-Grade UI/UX**: Built with a sleek dark mode, glassmorphism components, and vibrant gradients.
- **Real-time API Scanning**: Live execution logs and progress visualization for API scanning.
- **Detailed Vulnerability Reports**: Interactive issue cards with syntax-highlighted code blocks, evidence context, and OWASP categorizations.
- **Dashboard Analytics**: Visual breakdown of total scans, average scores, and critical risks.
- **Authentication**: JWT-based login and registration flows.

## Tech Stack
- **Framework**: React 18, Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS (with custom utility classes)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charting**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+

### Installation
1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Project Structure
- `/src/components`: Reusable UI components (IssueCards, Modals, Navbar, etc.)
- `/src/pages`: Main application routes (Dashboard, API Scanner, Results, Landing)
- `/src/services`: API integration and request handling logic
- `/src/context`: React Context providers (AuthContext)
- `/src/types`: TypeScript type definitions

## Design System
Nexus utilizes a specific design token configuration:
- **Primary/Secondary Accents**: `orange-500` & `purple-400`
- **Surface Colors**: Deep blacks (`#070A0F`), elevated cards with `backdrop-blur`
- **Typography**: Inter (sans-serif) & JetBrains Mono (for code)
