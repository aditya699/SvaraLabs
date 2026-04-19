# Svara Labs

An open-source audio AI platform built from first principles. Understanding audio as a modality — from raw waveform physics to voice cloning and audio language models. Research-driven, every component implemented from scratch, every milestone shipped as a user-facing feature.

**The North Star:** Understand the audio AI research space fully — every layer of the stack, from waveform physics to audio language models, built and reasoned about from first principles. Shippable products (voice cloning, TTS, STT) are downstream artifacts of that understanding.

## What We're Building

Svara Labs grows through research — each layer of the audio AI stack becomes a feature:

| Layer | What | Status |
|-------|------|--------|
| Audio physics | Waveform capture, time-vs-amplitude visualization, interactive hover tooltips | Built |
| Frequency analysis | FFT-based frequency spectrum with interactive visualization | Built |
| Signal processing | STFT, mel spectrograms, MFCCs | Coming |
| Deep audio models | CNNs/RNNs on spectrograms, phoneme classification | In Progress |
| Speech-to-text | Realtime streaming transcription (OpenAI Realtime / gpt-4o-transcribe) | Built |
| Speech recognition (from scratch) | CTC, seq2seq, Whisper fine-tuning | Coming |
| Neural vocoders | HiFi-GAN, spectrogram-to-speech | Coming |
| Text-to-speech | FastSpeech, controllable synthesis | Coming |
| Audio codecs | EnCodec, RVQ, audio tokenization | Coming |
| Voice cloning | Speaker encoders, zero-shot cloning | Coming |
| Audio LMs | AudioLM, VoiceBox-style architectures | Coming |

## Tech Stack

- **Backend:** Python 3.12+, FastAPI, Motor (async MongoDB), matplotlib, numpy, scipy
- **Frontend:** React 19, Vite, Tailwind CSS v3, Framer Motion, Recharts, Lucide React, React Router v7, Axios
- **Database:** MongoDB (Atlas or self-hosted)
- **ML (coming):** PyTorch, torchaudio, HuggingFace

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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/recordings` | Upload audio, get waveform + spectrum |
| `GET` | `/api/v1/recordings` | List recordings (paginated) |
| `GET` | `/api/v1/recordings/{id}` | Get single recording |
| `DELETE` | `/api/v1/recordings/{id}` | Delete recording |
| `POST` | `/api/v1/predictions` | Classify a short spoken command |
| `WS` | `/api/v1/stt` | Realtime speech-to-text WebSocket proxy to OpenAI Realtime |

### Realtime STT

The `/api/v1/stt` WebSocket accepts `{type: "audio", data: <base64 PCM16 mono @ 16 kHz>}` frames and streams back `{type: "delta", text}` (partial) and `{type: "final", text}` (committed on server VAD). Set `OPENAI_API_KEY` in `.env`. The browser client lives at `/services/stt` and handles mic capture, downsampling, and rendering.

## Learn

Svara Labs includes a built-in learning hub at `/learn` with Jupyter notebooks that teach audio AI from scratch. Each notebook is a self-contained lesson you can clone and run locally.

| Notebook | Topics | Difficulty |
|----------|--------|------------|
| [Day 1 — Audio AI Fundamentals](DL/Day1/day1.ipynb) | PyTorch setup, Speech Commands dataset, mel spectrograms, CNN audio classifier, training loop | Beginner |

More notebooks coming soon covering signal processing, spectrograms, speech recognition, and beyond.

## Project Structure

```
SvaraLabs/
├── server/                        # FastAPI backend
│   ├── main.py                    # App factory, CORS, lifespan, router mount
│   ├── core/                      # Config, settings
│   ├── db/                        # MongoDB connection
│   ├── recordings/                # Voice recording CRUD + waveform generation
│   ├── predictions/               # CNN command classifier
│   ├── stt/                       # Realtime speech-to-text WebSocket proxy
│   ├── Learning/                  # Research notes & experiments
│   └── requirements.txt
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios client + API functions (recordings, predictions, stt WebSocket)
│   │   ├── components/            # Layout, Recorder, LiveTranscriber, WaveformCard, NotebookCard, InteractiveWaveform, InteractiveSpectrum, RecordingList
│   │   ├── data/                  # Static data (notebook metadata)
│   │   └── pages/
│   │       ├── Vision.jsx         # / — landing, mission, research roadmap
│   │       ├── Services.jsx       # /services — services index
│   │       ├── services/          # /services/{recordings,commands,stt}
│   │       ├── Learn.jsx          # /learn
│   │       └── RecordingDetail.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
├── DL/                            # Jupyter notebooks for learning
│   └── Day1/
│       └── day1.ipynb             # Audio AI fundamentals (CNN classifier)
├── .env.sample                    # Template for .env
└── .gitignore
```

## Contributing

This is a research project that ships code. If you're interested in audio AI, signal processing, or building open-source voice technology — contributions welcome.

## License

MIT
