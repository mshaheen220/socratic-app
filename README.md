# Socratic Restructuring App

A personal cognitive behavioral therapy (CBT) tool designed to help users navigate difficult thoughts and situations. It helps you distinguish between **distorted thoughts** (which need challenging) and **valid stressors** (which need coping strategies).

## What is this for?

This application guides you through a structured process based on CBT principles. It helps you triage your thoughts and choose the right path:

1.  **Cognitive Restructuring** for irrational thoughts (Distortions).
2.  **Coping & Resilience** for difficult realities (Stressors).

Key features include:
- **Thought Triage**: Quickly categorize thoughts as Distortions or Stressors.
- **Guided Workflows**: Tailored step-by-step forms for Socratic Questioning or Radical Acceptance.
- **AI Analysis**: Get custom summaries, balanced thoughts, and coping plans powered by Google Gemini.
- **Thinking Error Identification**: Interactive selection of common cognitive distortions (e.g., Fortune Telling, Mind Reading).
- **Dashboard & Analytics**: Track sessions, visualize trends, and see word clouds of your common themes.
- **Local Privacy**: All data is stored in your browser's LocalStorage, ensuring your thoughts remain private on your device.

## When to use it?

Use this app when you catch yourself feeling:
- **Anxious** about a future event.
- **Overly critical** of yourself or others.
- Stuck in a loop of **negative thinking**.
- Upset by a specific situation and want to **check if your reaction aligns with the facts**.
- **Overwhelmed by a difficult reality** that you cannot change (Valid Stressor).
- **Powerless** in a situation and need to identify what is actually in your control.

## Technical Overview

### File Structure
- **`src/components/`**: Contains all React UI components (e.g., `Journal.jsx`, `Analytics.jsx`, `ThoughtTriage.jsx`).
- **`src/services/gemini.js`**: Handles interactions with the Google Gemini API.
- **`src/constants/`**: Static definitions for Thinking Errors and Cognitive Distortions.

### AI Integration
The app uses the **`@google/generative-ai`** SDK to communicate with Google's Gemini models.
- **System Instructions**: We use system instructions to define the AI's persona (CBT Therapist) and enforce a strict JSON output format.
- **Prompts**: The app constructs prompts based on the user's workflow.
  - *Distortions*: Sends the thought, evidence, and errors to request a **Balanced Thought** and **Efficacy Score**.
  - *Stressors*: Sends the situation, radical acceptance, and control audit to request a **Coping Plan** and **Resilience Score**.

### Data & Privacy
- **Local Storage**: All sessions are stored in your browser's `localStorage`. **Your data never leaves your device** (except to be processed by the AI API) and is not stored in any central database.
- **Timestamps as IDs**: The application uses `Date.now()` to generate unique IDs for sessions. These timestamps are used to derive and display all dates in the Journal and Analytics views.
- **Backup & Import**: Because data is local, clearing your browser cache will delete it. Use the **Backup** button to download a JSON file of your history, which can be **Imported** later or on a different device.

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