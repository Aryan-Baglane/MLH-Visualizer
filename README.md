# Data Brew AI

An AI-powered data analysis platform that transforms CSV data into actionable insights with beautiful visualizations,
intelligent chat, and forecasting capabilities.

![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/react-18.3-blue)

## Features

- **Auto-Generated Dashboards** - Upload CSV and get instant visualizations
- **AI Chat Assistant** - Ask questions about your data in natural language
- **Smart Forecasting** - AI-powered predictions using linear regression
- **Multiple Chart Types** - Line, Bar, Pie, Area, and Scatter charts
- **Dynamic Insights** - Real-time statistical analysis and key findings
- **PDF Export** - Download your dashboards as professional reports
- **Dark Mode** - Beautiful UI with theme support
- **Visual Forecast Distinction** - Dashed lines and different colors for predictions

## Quick Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**Ready to deploy?** Check out our comprehensive [Deployment Guide](DEPLOYMENT.md)

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ installed
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/data-brew-ai.git
cd data-brew-ai

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Gemini API key to .env
# VITE_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

The app will be available at [http://localhost:3001](http://localhost:3001)

## Deployment

This project is ready to deploy to Render with zero configuration!

See the detailed [Deployment Guide](DEPLOYMENT.md) for step-by-step instructions.

**Quick Deploy Steps:**

1. Push to GitHub
2. Connect to Render
3. Add `VITE_GEMINI_API_KEY` environment variable
4. Deploy!

## Intelligent Chat Interface

The AI chat assistant automatically decides whether to generate visualizations or provide text-only responses based on
your query.

### Queries That Generate Charts:

**Visualization requests:**

- "Show me sales trends"
- "Visualize revenue by category"
- "Create charts for the data"

**Analysis requests:**

- "Analyze the data"
- "Give me insights"

### Queries That Return Text Only:

**Statistical questions:**

- "What is the average sales?"
- "Calculate total revenue"

**Counting questions:**

- "How many products sold over 1000 units?"

## Chart Features

### Chart Types

- **Line Charts** - Time-based trends and forecasts
- **Bar Charts** - Categorical comparisons
- **Pie Charts** - Proportions and distributions
- **Area Charts** - Cumulative trends
- **Scatter Charts** - Correlation analysis

### Forecast Feature

Click the "Forecast" button on any Line, Bar, or Area chart to:

- Generate AI-powered predictions using linear regression
- See forecasted values in **dashed orange lines** (vs solid blue for actual data)
- View trend direction and percentage change in insights
- Get realistic predictions with 30% extension of historical data

### Dynamic Insights

Each chart includes 3-5 automatically generated insights:

**Line Charts:**

- Overall trend with growth/decline percentage
- Peak value identification
- Average value and distribution
- Volatility analysis

**Bar Charts:**

- Top performer with percentage
- Bottom performer
- Top categories concentration
- Performance gap analysis

**Pie Charts:**

- Dominant segment percentage
- Distribution balance
- Top 3 concentration

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Components:** Radix UI, Tailwind CSS, shadcn/ui
- **Charts:** Recharts
- **AI:** Google Gemini 2.0 Flash
- **Backend:** Node.js HTTP Server
- **PDF Export:** jsPDF, html2canvas

## Project Structure

```
data-brew-ai/
├── src/
│   ├── components/
│   │   ├── auto-dashboard.tsx    # Dashboard with charts
│   │   ├── chat-interface.tsx    # AI chat component
│   │   ├── data-profile.tsx      # Data analysis view
│   │   └── ui/                   # Reusable UI components
│   ├── pages/
│   │   └── Index.tsx             # Main page
│   └── App.tsx                   # App entry point
├── server/
│   └── index.js                  # Production server
├── public/                       # Static assets
├── render.yaml                   # Render config
├── DEPLOYMENT.md                 # Deployment guide
└── package.json                  # Dependencies
```

## Screenshots

### Dashboard View

Auto-generated charts with insights

### Chat Interface

Ask questions in natural language

### Forecast Feature

Visual distinction between actual and predicted data

## Environment Variables

```bash
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional
PORT=3001
NODE_ENV=production
```

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Recharts](https://recharts.org/) for beautiful charts
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Support

For issues and questions:

- Check the [Deployment Guide](DEPLOYMENT.md)
- Review browser console for errors
- Verify Gemini API key is valid
- Check Render logs if deployed

---
**Made with using AI-powered data analysis**

