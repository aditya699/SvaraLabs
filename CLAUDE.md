# CLAUDE.md — Svara Labs

## What is this project?

Svara Labs is an open-source audio AI platform — think of it as a research-driven, open-source ElevenLabs. The goal is to understand audio as a modality from first principles and build every piece of the audio AI stack: from raw waveform physics through signal processing, speech recognition, neural vocoders, text-to-speech, voice cloning, and audio language models.

This is not a wrapper around existing APIs. Every component is built from scratch, trained on real data, and shipped as a usable product. The platform serves as both a learning lab and a production-grade tool — each research milestone becomes a feature users can interact with.

**The North Star:** Understand the audio AI research space fully — every layer of the stack, from waveform physics to audio language models, built and reasoned about from first principles. Shippable products (voice cloning, TTS, STT, etc.) are downstream artifacts of that understanding, not the goal itself.

**Status:** Early development. Stage 1 — audio physics, waveform capture, and frequency analysis — is built (voice recording, waveform/spectrum visualization, interactive chart tooltips, recording CRUD). A realtime speech-to-text service is also live via a WebSocket proxy to the OpenAI Realtime API (`gpt-4o-transcribe`) — this is a productized shortcut so users have STT today; the from-scratch speech recognition research (CTC, seq2seq) remains a separate upcoming stage. No auth.

## Vision & Research Direction

The platform grows through research stages, each building on the last:

- **Audio fundamentals** — waveform capture, frequency analysis, DFT/FFT from scratch
- **Signal processing** — STFT, mel spectrograms, MFCCs, all implemented in numpy
- **Deep learning on audio** — CNNs and RNNs on spectrograms, phoneme classification
- **Speech recognition** — CTC loss, sequence-to-sequence, Whisper fine-tuning
- **Self-supervised representations** — Wav2Vec, HuBERT style audio embeddings
- **Neural vocoders** — WaveNet, HiFi-GAN, spectrogram-to-speech
- **Text-to-speech** — Tacotron, FastSpeech, controllable synthesis
- **Neural audio codecs** — EnCodec, RVQ, audio-to-discrete-tokens
- **Voice cloning** — speaker encoders, zero-shot cloning, XTTS-style systems
- **Audio language models** — AudioLM, VoiceBox, Moshi-style architectures
- **Emotion & prosody** — paralinguistic analysis, expressive synthesis

Each stage ships as a feature in the platform. The roadmap is dynamic — stages may be reordered, expanded, or condensed based on what we learn.

## Tech Stack

- **Backend:** Python 3.12+, FastAPI, Motor (async MongoDB), matplotlib, numpy, scipy, PyTorch, `websockets` (for OpenAI Realtime proxy)
- **Frontend:** React 19, Vite, Tailwind CSS v3, Framer Motion, Recharts, Lucide React, React Router v7, Axios
- **Database:** MongoDB (Atlas)

## Project Structure

```
SvaraLabs/
├── server/                        # FastAPI backend
│   ├── main.py                    # App factory, CORS, lifespan, router mount
│   ├── core/
│   │   └── config.py              # Pydantic Settings (reads .env)
│   ├── db/
│   │   └── mongo.py               # get_db() singleton via Motor
│   ├── recordings/                # CRUD + waveform/spectrum generation (routes/schemas/utils)
│   ├── predictions/               # CNN spoken-command classifier (routes/model/queue)
│   ├── stt/                       # Realtime STT WebSocket proxy to OpenAI Realtime
│   │   ├── routes.py              # /api/v1/stt WS — relays PCM16 chunks to OpenAI, streams deltas back
│   │   └── schemas.py             # WS message shapes (AudioChunk, Delta, Final, Error)
│   ├── Learning/                  # Research notes & experiments
│   └── requirements.txt           # Python dependencies
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Axios instance (baseURL from env)
│   │   │   ├── recordings.js      # Recording CRUD
│   │   │   ├── predictions.js     # Command predictions
│   │   │   └── stt.js             # openSttSocket() — WebSocket helper for realtime STT
│   │   ├── components/
│   │   │   ├── Layout.jsx         # App shell (floating pill navbar: Vision / Services / Learn)
│   │   │   ├── Recorder.jsx       # Voice recorder (MediaRecorder API + webm→wav)
│   │   │   ├── CommandRecorder.jsx # 1.5s auto-stop recorder for command classification
│   │   │   ├── LiveTranscriber.jsx # Mic → AudioContext → 16kHz PCM16 → WS → live transcript
│   │   │   ├── WaveformCard.jsx
│   │   │   ├── InteractiveWaveform.jsx
│   │   │   ├── InteractiveSpectrum.jsx
│   │   │   └── RecordingList.jsx
│   │   └── pages/
│   │       ├── Vision.jsx         # `/` — mission, North Star, 11-stage roadmap
│   │       ├── Services.jsx       # `/services` — index of feature cards
│   │       ├── services/
│   │       │   ├── Recordings.jsx # `/services/recordings` — Recorder + RecordingList
│   │       │   ├── Commands.jsx   # `/services/commands` — CommandRecorder
│   │       │   └── STT.jsx        # `/services/stt` — LiveTranscriber
│   │       ├── Learn.jsx          # `/learn`
│   │       └── RecordingDetail.jsx # `/recordings/:id` — interactive waveform/spectrum + delete
│   ├── tailwind.config.js         # Design system
│   └── vite.config.js             # Vite config with API proxy to :8000
├── .env                           # Secrets (gitignored)
├── .env.sample                    # Template for .env
└── .gitignore
```

## Running Locally

```bash
# Backend
cd SvaraLabs
pip install -r server/requirements.txt
uvicorn server.main:app --reload    # http://localhost:8000

# Frontend
cd client
npm install
npm run dev                          # http://localhost:5173
```

Requires a `.env` file at the project root (copy `.env.sample`).

## Features Built

### Voice Recording & Waveform (complete — Stage 1)
- Browser audio capture via MediaRecorder API (webm) with client-side webm→WAV conversion
- Upload WAV to backend, scipy decodes audio, matplotlib plots time vs amplitude
- FFT-based frequency spectrum (0–8 kHz) generated alongside waveform
- Waveform and spectrum PNGs stored as base64 in MongoDB alongside recording metadata
- Full CRUD: create (upload + plot), list (paginated), get single, delete

### Realtime Speech-to-Text (complete — productized via OpenAI Realtime)
- WebSocket endpoint at `/api/v1/stt` proxies to `wss://api.openai.com/v1/realtime?intent=transcription` using `gpt-4o-transcribe` with server-side VAD.
- Client (`LiveTranscriber.jsx`) captures mic via `getUserMedia`, pulls float32 frames through an `AudioContext` + `ScriptProcessorNode`, downsamples to 16 kHz mono, converts to PCM16, base64-encodes, and ships each frame as `{type: "audio", data}` over the WS.
- Server forwards frames as `input_audio_buffer.append` events and streams back `{type: "delta"}` (partial) and `{type: "final"}` (committed on VAD pause).
- Page lives at `/services/stt`. Key is read from `OPENAI_API_KEY` in `.env` — never exposed to the browser.
- This is a productized shortcut so the platform has STT today; the from-scratch speech recognition research (CTC, seq2seq, Whisper fine-tuning) is a separate upcoming stage.

### Interactive Charts (complete — Stage 1)
- Detail page renders interactive Recharts charts with hover tooltips
- Waveform tooltip shows exact time (s) and amplitude at cursor position
- Frequency spectrum tooltip shows exact frequency (Hz) and amplitude at cursor position
- Backend downsamples audio to ~1500 points for efficient JSON transfer
- Listing cards keep static PNG images for performance
- Old recordings (pre-interactive) gracefully fall back to static images

### Frontend Design System
- **Colors:** Cream `#FAF7F2` (background), brown `#2D2016` (text), gold `#C4956A` (accents), white cards with subtle borders `#E8E0D4`
- **Typography:** Instrument Serif for headings, DM Sans for body text (Google Fonts)
- **Patterns:** Rounded cards with hover shadows (`shadow-card` / `shadow-card-hover`), gold icon containers (`bg-gold/10`), status badges (`bg-gold/15`), floating pill navbar, staggered Framer Motion entrance animations
- **Component classes:** `card`, `btn-primary`, `btn-secondary`, `btn-danger` in index.css
- **Shared design system** with portfolio website (`portfoliowebsite/`) — same tailwind config colors, fonts, shadows

## Key Architecture Decisions

### Audio Pipeline
- Browser records in webm (MediaRecorder default), converts to WAV client-side using AudioContext + DataView WAV header writer.
- Backend uses `scipy.io.wavfile.read()` to decode WAV, normalizes to [-1, 1] float64.
- Matplotlib generates waveform and frequency spectrum PNGs with warm gold color scheme (`#C4956A`) on cream background (`#FAF7F2`) matching the UI, saved to PNG bytes → base64.
- Backend also downsamples audio to ~1500 data points (waveform: `{t, a}`, spectrum: `{f, a}`) and stores as JSON in MongoDB for interactive frontend charts.
- Detail page uses Recharts `<AreaChart>` with custom tooltips; listing cards use static base64 PNGs.
- `RecordingResponse` includes both base64 and JSON data; `RecordingListItem` includes only base64 (no JSON chart data in list endpoint).

### CORS
- Currently `allow_origins=["*"]` for development. Tighten for production.

### API Design
- REST endpoints under `/api/v1/recordings` and `/api/v1/predictions`. WebSocket at `/api/v1/stt`.
- Audio upload via multipart form data (`UploadFile`).
- Waveform and spectrum stored as base64 in the MongoDB document (no separate file storage for now). Downsampled JSON chart data stored alongside for interactive rendering.
- Vite dev server proxies `/api` to FastAPI on port 8000 with `ws: true` so WebSocket upgrades pass through (uses `127.0.0.1` to avoid IPv6 resolution issues).

### Frontend Information Architecture
- Three top-level areas in the navbar: **Vision** (`/`), **Services** (`/services/*`), **Learn** (`/learn`).
- Vision is marketing/roadmap — no functional tooling.
- Each research stage ships as its own service page under `/services/<name>`. New modules should follow this pattern: add a page at `client/src/pages/services/<Name>.jsx`, register the route in `App.jsx`, and add a card to `Services.jsx`.

## Conventions

- Backend follows folder-per-feature pattern: each feature gets `routes.py`, `schemas.py`, `utils.py`.
- Frontend follows `api/`, `components/`, `pages/` pattern with barrel-free imports.
- No auth layer for now — all endpoints are public.
- Route paths use empty string (`""`) not `"/"` to avoid redirect_slashes issues.
- Research implementations go in `server/Learning/` organized by day/stage.
- Every new research stage should ship as a user-facing feature in the platform.
