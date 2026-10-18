# X Hook Studio

A standalone Next.js app for generating X hooks, thread outlines, complete threads, and repurposed X content.

## Features
- Single-post hooks, thread outlines, complete threads, and content repurposing
- Topic, audience, objective, voice, and source-content inputs
- Filter hooks by angle
- Copy individual results or all results
- AI-assisted draft improvement
- Anthropic API key stays server-side
- Responsive dark UI

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Add your Anthropic key to `ANTHROPIC_API_KEY`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Deploy to Vercel
1. Push this folder to a new GitHub repository, or import it into an existing repository as a separate project.
2. In Vercel, create a new project and import the repository.
3. Add `ANTHROPIC_API_KEY` under Project Settings → Environment Variables.
4. Redeploy.
5. Test all four formats and the Improve action.

## Notes
- No X API connection is required; this app generates drafts and does not publish automatically.
- Never put the Anthropic key in client-side code or commit `.env.local`.
- The model does not guarantee virality or factual accuracy. Review drafts before publishing.
