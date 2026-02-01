# Street Support Virtual Assistant v7

A Next.js-based virtual assistant for finding homelessness and housing support services in the West Midlands Combined Authority area.

## Features

- Crisis gate with safeguarding exits (DV, self-harm, child protection)
- Multi-path routing (Quick Route, Full Guided Route, Advice Only)
- Prevention pathway for housed users at risk
- Escalation system for conversation difficulties
- Session data capture for analytics
- Responsive design (mobile-friendly)

## Quick Start

### Prerequisites

- Node.js 18+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/street-support-va.git
cd street-support-va
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. Push code to GitHub

2. Connect repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Add environment variable:
   - In Vercel project settings, go to "Environment Variables"
   - Add `ANTHROPIC_API_KEY` with your API key

4. Deploy!

## Project Structure

```
street-support-va/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Demo page
├── components/
│   ├── ChatWidget.tsx        # Main chat interface
│   └── ChatLauncher.tsx      # Floating launch button
├── lib/
│   ├── session.ts            # Session management
│   ├── systemPrompt.ts       # Claude system prompt
│   └── types.ts              # TypeScript definitions
├── .env.example              # Environment template
├── package.json
├── tailwind.config.js        # Brand colors configured
└── README.md
```

## Configuration

### Brand Colors

Colors are configured in `tailwind.config.js`:

- Primary (header): `#339378`
- Secondary (user bubbles): `#721b78`
- Accent (interactive): `#086049`
- Background: `#f5f5f5`
- Text: `#1a1a1a`

### Widget Dimensions

Default: 480px × 640px

Modify in `tailwind.config.js` or directly in `ChatWidget.tsx`.

## Testing

### Test Scenarios

1. **Crisis Gate**: Select options 1-6 to test safeguarding exits
2. **Happy Path**: Select "7", then follow guided route
3. **Prevention**: Say you're housed but at risk of losing home
4. **Under 16**: Select "Under 16" at age question
5. **Escalation**: Give unclear answers repeatedly

### Manual Testing Checklist

- [ ] Crisis gate appears first
- [ ] All 6 safeguarding exits work
- [ ] Quick route skips detailed questions
- [ ] Full route asks all questions
- [ ] Prevention pathway triggers correctly
- [ ] Under 16 exits immediately
- [ ] Session ends properly
- [ ] Restart button works
- [ ] Mobile responsive

## Data Capture

Session data is logged to console in demo mode. Structure:

```json
{
  "session_id": "uuid",
  "timestamp_start": "ISO datetime",
  "timestamp_end": "ISO datetime",
  "local_authority": "birmingham",
  "route_type": "FULL",
  "terminal_outcome": "SERVICES_DELIVERED",
  "safeguarding_triggered": false,
  ...
}
```

For production, implement Google Sheets or database write in `lib/session.ts`.

## Embedding

### Option A: iframe (simplest)

```html
<iframe 
  src="https://your-deployment.vercel.app" 
  style="position: fixed; bottom: 0; right: 0; width: 480px; height: 640px; border: none;"
></iframe>
```

### Option B: Component integration

Copy `components/ChatWidget.tsx` and `components/ChatLauncher.tsx` into your Next.js project, along with the API route and supporting files.

## Support

For issues with the virtual assistant, contact Street Support Network.

For technical issues, check the browser console for errors.

## License

Proprietary - Street Support Network
