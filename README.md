# Socratic Restructuring App

A personal cognitive behavioral therapy (CBT) tool designed to help users identify, challenge, and restructure negative thought patterns using Socratic questioning techniques.

## What is this for?

This application guides you through a structured process of **Cognitive Restructuring**. It helps you move from an automatic negative thought to a more balanced and realistic perspective by asking a series of evidence-based questions.

Key features include:
- **Guided Wizard**: A step-by-step form to analyze thoughts without getting overwhelmed.
- **Thinking Error Identification**: Interactive selection of common cognitive distortions (e.g., Fortune Telling, Mind Reading).
- **Dashboard**: A history view to track past sessions and review your progress over time.
- **Local Privacy**: All data is stored in your browser's LocalStorage, ensuring your thoughts remain private on your device.

## When to use it?

Use this app when you catch yourself feeling:
- Anxious about a future event.
- Overly critical of yourself or others.
- Stuck in a loop of negative thinking.
- Upset by a specific situation and want to check if your reaction aligns with the facts.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd socratic-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server:

```bash
npm run dev
```

The app will typically run at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

This will generate a `dist` folder containing static assets that can be deployed to any static hosting provider.

### Deployment

Since this is a client-side React application (Vite), it can be easily deployed to platforms like:
- **Netlify**: Drag and drop the `dist` folder or connect your Git repo.
- **Vercel**: Connect your Git repo; it usually detects Vite automatically.
- **GitHub Pages**: Use a workflow to build and deploy the `dist` folder.