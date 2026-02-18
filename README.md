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

### Configuration

To use the AI features, create a `.env` file in the root directory and add your Gemini API key:

```env
VITE_GOOGLE_API_KEY=your_api_key_here
```

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

#### GitHub Pages Setup

1.  **Configure Base URL**: If deploying to a project page (e.g., `user.github.io/repo`), add the base path in `vite.config.js`:
    ```js
    export default defineConfig({
      base: '/socratic-app/', // Replace with your repo name
      plugins: [react()],
    })
    ```
2.  **Add Workflow**: Add the provided `.github/workflows/deploy.yml` file to your repository.
3.  **Configure Settings**:
    - Go to your repository on GitHub.
    - Navigate to **Settings** > **Pages**.
    - Under **Build and deployment**, select **GitHub Actions** as the source.

#### Setting up the API Key for GitHub Pages

Since `.env` files are not committed to Git, you must set the API key as a repository secret:

1.  Go to your repository **Settings**.
2.  Select **Secrets and variables** > **Actions** from the left sidebar.
3.  Click **New repository secret**.
4.  Name: `VITE_GOOGLE_API_KEY`.
5.  Value: Paste your Gemini API key.
6.  The next time the deployment workflow runs, it will inject this key into the build.