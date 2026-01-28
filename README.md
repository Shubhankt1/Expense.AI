<div align="center">

# Expense.AI

<!-- ### Personal Finance App with AI Insights -->

</div>

<div align="center">

![Expense.AI](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/Version-0.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A Personal Finance Manager and Budgeting tool that leverages AI to provide intelligent spending insights, automated transaction processing, and smart financial recommendations.

<!--
**[Live Demo](#) • [Documentation](#documentation) • [Contributing](CONTRIBUTING.md) • [Report Bug](https://github.com/issues)**
-->

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Building](#building)
- [Usage](#usage)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## 🎯 Overview

Expense.AI is an intelligent personal finance management platform that combines powerful expense tracking with AI-driven insights. Built with modern technologies and a focus on user experience, it helps users understand their spending patterns, manage budgets effectively, and make smarter financial decisions.

The platform leverages Google's Gemini AI to analyze financial data and provide personalized recommendations, while maintaining a clean, intuitive interface built with React and powered by Convex's real-time backend infrastructure.

---

## ✨ Features

### Core Functionality

- 🔐 **Secure Authentication** - Anonymous and multi-auth support via Convex Auth
- 💳 **Transaction Management** - Upload, track, and manage financial transactions
- 📊 **Bank Statement Processing** - Automated CSV/file upload for bulk transaction import
- 📈 **Budget Management** - Set and track category-based budgets with real-time spending updates
- 🎯 **Savings Goals** - Define and monitor progress toward financial milestones

### AI-Powered Features

- 🤖 **Smart Insights** - AI-generated spending patterns, budget alerts, and savings recommendations using Google Gemini
- 🔍 **Anomaly Detection** - Identify unusual spending patterns and potential financial risks
- 💡 **Personalized Recommendations** - Contextual financial advice based on spending behavior

### Dashboard & Visualization

- 📅 **Advanced Filtering** - Date range and category-based filtering with single source of truth
- 📊 **Spending Charts** - Visual representation of expenses by category and time period
- 🏠 **Dashboard** - Comprehensive overview of financial health and key metrics
- 📱 **Responsive Design** - Mobile-first UI built with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend

| Tool             | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| **React**        | ^19.0.0 | UI library              |
| **TypeScript**   | ~5.7.2  | Type safety             |
| **Vite**         | ^6.2.0  | Build tool & dev server |
| **Tailwind CSS** | ~3      | Styling                 |
| **Sonner**       | ^2.0.3  | Toast notifications     |

### Backend

| Tool              | Version | Purpose                     |
| ----------------- | ------- | --------------------------- |
| **Convex**        | ^1.31.2 | Backend platform & database |
| **Convex Auth**   | ^0.0.80 | Authentication              |
| **Google Gemini** | ^1.34.0 | AI insights generation      |

### Development

| Tool                  | Version | Purpose          |
| --------------------- | ------- | ---------------- |
| **ESLint**            | ^9.21.0 | Code linting     |
| **Prettier**          | ^3.5.3  | Code formatting  |
| **TypeScript ESLint** | ^8.24.1 | TS linting rules |

---

## 📁 Project Structure

```
Expense.AI/
├── src/                          # Frontend React application
│   ├── components/               # React components
│   │   ├── AppContent.tsx        # Main app layout
│   │   ├── Dashboard.tsx         # Dashboard view
│   │   ├── TransactionList.tsx   # Transaction display
│   │   ├── BudgetManager.tsx     # Budget management
│   │   ├── SavingsGoals.tsx      # Savings goal tracking
│   │   ├── SpendingChart.tsx     # Data visualization
│   │   ├── InsightsPanel.tsx     # AI insights display
│   │   ├── StatementUpload.tsx   # File upload handler
│   │   ├── DateFilterTabs.tsx    # Date filtering UI
│   │   ├── MonthSlider.tsx       # Month navigation
│   │   └── ...                   # Other UI components
│   ├── contexts/                 # React Context API
│   │   └── DateFilterContext.tsx # Global date filtering state
│   ├── hooks/                    # Custom React hooks
│   │   └── useDateFilter.ts      # Date filter hook
│   ├── lib/                      # Utilities
│   │   ├── dateUtils.ts          # Date manipulation
│   │   └── utils.ts              # General utilities
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
│
├── convex/                       # Backend (Convex functions)
│   ├── schema.ts                 # Database schema definition
│   ├── auth.ts                   # Authentication handlers
│   ├── auth.config.ts            # Auth configuration
│   ├── transactions.ts           # Transaction mutations & queries
│   ├── budgets.ts                # Budget management functions
│   ├── savings.ts                # Savings goal functions
│   ├── statements.ts             # Bank statement processing
│   ├── insights.ts               # AI insight generation
│   ├── gemini.ts                 # Google Gemini integration
│   ├── router.ts                 # HTTP route definitions
│   ├── http.ts                   # HTTP handler
│   ├── utils.ts                  # Backend utilities
│   ├── tsconfig.json             # TS config for backend
│   └── _generated/               # Auto-generated Convex types
│
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # Root TS configuration
├── tailwind.config.js            # Tailwind configuration
├── eslint.config.js              # ESLint configuration
├── postcss.config.cjs            # PostCSS configuration
├── package.json                  # Dependencies & scripts
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 or **yarn** >= 3.0.0
- **Git** (for version control)
- A **Convex account** ([Sign up free](https://www.convex.dev/))
- A **Google API key** (for Gemini AI - [Get it here](https://makersuite.google.com/app/apikey))

Verify installations:

```bash
node --version  # v18.0.0+
npm --version   # 9.0.0+
git --version   # 2.0.0+
```

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shubhanktyagi/Expense.AI.git
   cd Expense.AI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Then configure your environment variables:

   ```env
   # Convex backend URL (automatically set by Convex CLI)
   VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud

   # Google Gemini API
   VITE_GOOGLE_API_KEY=your_google_api_key_here
   ```

   **Getting your values:**
   - **VITE_CONVEX_URL**: Run `npx convex dev` (see Development section)
   - **VITE_GOOGLE_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Development

Start the full development environment (frontend + backend):

```bash
npm run dev
```

This command will:

- Start the **Convex backend** (sync with cloud)
- Start the **Vite dev server** with hot module replacement
- Open the app in your browser at `http://localhost:5173`

**Individual commands:**

```bash
npm run dev:frontend    # Frontend only on :5173
npm run dev:backend     # Backend sync only
```

### Building

Create an optimized production build:

```bash
npm run build
```

This will:

- Type-check both frontend and backend
- Bundle the frontend with Vite
- Output to `dist/` directory

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for:

- [Code of Conduct](CONTRIBUTING.md#code-of-conduct)
- [How to Contribute](CONTRIBUTING.md#how-to-contribute)
- [Development Setup](CONTRIBUTING.md#development-setup)
- [Coding Standards](CONTRIBUTING.md#coding-standards)
- [Commit Guidelines](CONTRIBUTING.md#commit-guidelines)
- [Pull Request Process](CONTRIBUTING.md#pull-request-process)

**Quick contribution steps:**

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and test locally
npm run dev
npm run lint

# 4. Commit following conventional commits
git commit -m "feat: add amazing feature"

# 5. Push and create Pull Request
git push origin feature/amazing-feature
```

---

## 🆘 Troubleshooting

### Common Issues

#### 1. Convex Connection Failed

```
Error: Failed to connect to Convex
```

**Solution:**

```bash
# Ensure backend is running
npm run dev:backend

# Or reinitialize Convex
npx convex dev
```

#### 2. Missing Environment Variables

```
Error: VITE_CONVEX_URL is not defined
```

**Solution:**

- Check `.env.local` file exists
- Ensure `VITE_CONVEX_URL` and `VITE_GOOGLE_API_KEY` are set
- Restart dev server: `npm run dev`

#### 3. Port Already in Use

```
Error: Port 5173 is already in use
```

**Solution:**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev:frontend -- --port 3000
```

#### 4. TypeScript Errors

```
Error: Property does not exist
```

**Solution:**

```bash
# Regenerate Convex types
npx convex dev

# Clear type cache
rm -rf node_modules/.vite
```

#### 5. Build Failures

```
Error during vite build
```

**Solution:**

```bash
# Run lint check first
npm run lint

# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Getting Help

- 📖 [Convex Documentation](https://docs.convex.dev/)
- 💬 [Convex Discord Community](https://discord.gg/convex)
- 🐛 [GitHub Issues](https://github.com/shubhanktyagi/Expense.AI/issues)
- 📝 [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📚 References

### Documentation

- [Convex Documentation](https://docs.convex.dev/)
- [Convex Auth](https://auth.convex.dev/)
- [The Zen of Convex - Best Practices](https://docs.convex.dev/production/best-practices/)
- [React 19 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### Related Resources

- [Google Gemini API](https://ai.google.dev/)
- [Convex HTTP API](https://docs.convex.dev/http-api)
- [Convex Stack (Technical Discussions)](https://stack.convex.dev/)
- [Financial Data Processing Guide](Pre-Processing%20Financial%20Data%20for%20AI.md)
- [Convex Function Types Best Practices](Convex%20Function%20Types%20-%20Best%20Practices.md)

### Community

- [Convex Discord](https://discord.gg/convex)
- [React Community](https://react.dev/community/support)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shubhank Tyagi**

- GitHub: [@shubhanktyagi](https://github.com/shubhanktyagi)
- Project: [Expense.AI](https://github.com/shubhanktyagi/Expense.AI)

---

## 🙏 Acknowledgments

- [Convex](https://convex.dev) for the excellent backend platform
- [Google AI](https://ai.google.dev/) for Gemini API
- The React and TypeScript communities

---

<div align="center">

**[⬆ Back to top](#)**

Made with ❤️ by [Shubhank Tyagi](https://github.com/Shubhankt1)

</div>
