# CLAUDE.md — Svara Labs

## What is this project?

Svara Labs is an open-source audio AI platform — think of it as a research-driven, open-source ElevenLabs. The goal is to understand audio as a modality from first principles and build every piece of the audio AI stack: from raw waveform physics through signal processing, speech recognition, neural vocoders, text-to-speech, voice cloning, and audio language models.

This is not a wrapper around existing APIs. Every component is built from scratch, trained on real data, and shipped as a usable product. The platform serves as both a learning lab and a production-grade tool — each research milestone becomes a feature users can interact with.

**The North Star:** Give it any voice for 3 seconds and it clones it. Give it any text and it speaks it in that voice. Runs locally. No API keys. No cost. Better than anything open source today.

**Status:** Early development. Stage 1 — audio physics and waveform capture. Voice recording, waveform visualization, and recording CRUD are built. No auth.

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

- **Backend:** Python 3.12+, FastAPI, Motor (async MongoDB), matplotlib, numpy, scipy, PyTorch (coming)
- **Frontend:** React 19, Vite, Tailwind CSS v3, Framer Motion, Lucide React, React Router v7, Axios
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
│   ├── recordings/
│   │   ├── routes.py              # CRUD + waveform generation endpoints
│   │   ├── schemas.py             # Pydantic request/response models
│   │   └── utils.py               # matplotlib waveform chart generation
│   ├── Learning/                  # Research notes & experiments
│   └── requirements.txt           # Python dependencies
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js          # Axios instance (baseURL from env)
│   │   │   └── recordings.js      # Recording CRUD API functions
│   │   ├── components/
│   │   │   ├── Layout.jsx         # App shell (floating pill navbar + footer)
│   │   │   ├── Recorder.jsx       # Voice recorder (MediaRecorder API + webm→wav)
│   │   │   ├── WaveformCard.jsx   # Waveform image + metadata card
│   │   │   └── RecordingList.jsx  # Grid of recording cards
│   │   └── pages/
│   │       ├── Home.jsx           # Recorder + recent recordings grid
│   │       └── RecordingDetail.jsx # Full waveform view + delete
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
- Waveform PNG stored as base64 in MongoDB alongside recording metadata
- Full CRUD: create (upload + plot), list (paginated), get single, delete

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
- Matplotlib generates waveform with warm gold color scheme (`#C4956A`) on cream background (`#FAF7F2`) matching the UI, saved to PNG bytes → base64.

### CORS
- Currently `allow_origins=["*"]` for development. Tighten for production.

### API Design
- All endpoints under `/api/v1/recordings`.
- Audio upload via multipart form data (`UploadFile`).
- Waveform stored as base64 in the MongoDB document (no separate file storage for now).
- Vite dev server proxies `/api` to FastAPI on port 8000 (uses `127.0.0.1` to avoid IPv6 resolution issues).

## Conventions

- Backend follows folder-per-feature pattern: each feature gets `routes.py`, `schemas.py`, `utils.py`.
- Frontend follows `api/`, `components/`, `pages/` pattern with barrel-free imports.
- No auth layer for now — all endpoints are public.
- Route paths use empty string (`""`) not `"/"` to avoid redirect_slashes issues.
- Research implementations go in `server/Learning/` organized by day/stage.
- Every new research stage should ship as a user-facing feature in the platform.
