# Mindframe

> Structure your thoughts. Reframe your reality.

A personal cognitive behavioral therapy (CBT) tool designed to help users navigate difficult thoughts and situations. It helps you distinguish between **distorted thoughts** (which need challenging), **valid stressors** (which need coping strategies), **worries** (which need decision-making), and **moods** (which need regulation).

## What is this for?

This application guides you through a structured process based on CBT principles. It helps you triage your thoughts and choose the right path:

1.  **Socratic Restructuring** for irrational thoughts (Distortions).
2.  **Coping & Resilience** for difficult realities (Stressors).
3.  **Worry Tree** for managing anxiety and uncertainty (Worries).
4.  **Mood Reset** for emotional regulation and grounding (Moods).

Key features include:
- **Thought Triage**: Quickly categorize thoughts as Distortions, Stressors, Worries, or Moods.
- **Quick Add**: Capture thoughts instantly and save them as drafts to process later.
- **Guided Workflows**: Tailored step-by-step forms for Socratic Questioning or Radical Acceptance.
- **AI Analysis**: Get custom summaries, balanced thoughts, and coping plans powered by Google Gemini.
- **Thinking Error Identification**: Interactive selection of common cognitive distortions (e.g., Fortune Telling, Mind Reading).
- **Dashboard & Analytics**: Track sessions, visualize trends, see word clouds, analyze worry outcomes, and track technique usage.
- **Private & Secure**: Your data is tied to your private account and is not shared.

## When to use it?

Use this app when you catch yourself feeling:
- **Anxious** about a future event.
- **Overly critical** of yourself or others.
- Stuck in a loop of **negative thinking**.
- Upset by a specific situation and want to **check if your reaction aligns with the facts**.
- **Overwhelmed by a difficult reality** that you cannot change (Valid Stressor).
- **Powerless** in a situation and need to identify what is actually in your control.
- **Stuck in "What if..." loops** about hypothetical future events.
- **Unsure** if a problem is something you can solve right now or need to let go.
- **Overwhelmed by an intense emotion** and need to "quarantine" it so it doesn't ruin your day.
- **Physically shaken** by an event and need a grounding technique.

## Technical Overview

### File Structure
- **`src/`**: Contains the React frontend application.
- **`src/server/`**: A small Express.js backend API that manages user accounts and session data in a SQLite database.

### AI Integration
The app uses the **`@google/generative-ai`** SDK to communicate with Google's Gemini models.

- **System Instructions**: We use system instructions to define the AI's persona (CBT Therapist) and enforce a strict JSON output format.
- **Prompts**: The app constructs prompts based on the user's workflow.
  - *Distortions*: Sends the thought, evidence, and errors to request a **Balanced Thought** and **Efficacy Score**.
  - *Stressors*: Sends the situation, radical acceptance, and control audit to request a **Coping Plan** and **Resilience Score**.
  - *Worry Tree*: Sends the worry type (current/hypothetical) and plan to request a **Coping Strategy** and **Resilience Score**.
  - *Mood Reset*: Sends the event/emotion and intensity to request a **Suggested Technique** and **Resilience Score**.

### Data & Privacy
- **Database Storage**: All sessions are stored in a private SQLite database, linked to your user account.
- **Timestamps as IDs**: The application uses `Date.now()` to generate unique IDs for sessions. These timestamps are used to derive and display all dates in the Journal and Analytics views.
- **Export & Import**: You can download a full JSON file of your history using the **Export** button, and use the **Import** button to add sessions from a file.

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

This project has a React frontend and an Express backend. You'll need to run both.

1. **Start the backend server:**
   ```bash
   npm run server
   ```

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3001` and the frontend will typically run at `http://localhost:5173`.


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