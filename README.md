# Svara Labs

An open-source audio AI platform built from first principles. Understanding audio as a modality — from raw waveform physics to voice cloning and audio language models. Research-driven, every component implemented from scratch, every milestone shipped as a user-facing feature.

**The goal:** Build an open-source ElevenLabs. Give it any voice for 3 seconds and it clones it. Give it any text and it speaks it in that voice. Runs locally. No API keys. No cost.

## What We're Building

Svara Labs grows through research — each layer of the audio AI stack becomes a feature:

| Layer | What | Status |
|-------|------|--------|
| Audio physics | Waveform capture, time-vs-amplitude visualization, interactive hover tooltips | Built |
| Frequency analysis | FFT-based frequency spectrum with interactive visualization | Built |
| Signal processing | STFT, mel spectrograms, MFCCs | Coming |
| Deep audio models | CNNs/RNNs on spectrograms, phoneme classification | Coming |
| Speech recognition | CTC, seq2seq, Whisper fine-tuning | Coming |
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

## Project Structure

```
SvaraLabs/
├── server/                        # FastAPI backend
│   ├── main.py                    # App factory, CORS, lifespan, router mount
│   ├── core/                      # Config, settings
│   ├── db/                        # MongoDB connection
│   ├── recordings/                # Voice recording CRUD + waveform generation
│   ├── Learning/                  # Research notes & experiments
│   └── requirements.txt
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/                   # Axios client + API functions
│   │   ├── components/            # Layout, Recorder, WaveformCard, InteractiveWaveform, InteractiveSpectrum, RecordingList
│   │   └── pages/                 # Home, RecordingDetail
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.sample                    # Template for .env
└── .gitignore
```

## Contributing

This is a research project that ships code. If you're interested in audio AI, signal processing, or building open-source voice technology — contributions welcome.

## License

MIT
