import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, Circle, Loader2 } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const stages = [
  { title: "Audio fundamentals", desc: "Waveform capture, frequency analysis, DFT/FFT from scratch.", status: "done" },
  { title: "Signal processing", desc: "STFT, mel spectrograms, MFCCs — all in numpy.", status: "in-progress" },
  { title: "Deep learning on audio", desc: "CNNs and RNNs on spectrograms, phoneme classification.", status: "in-progress" },
  { title: "Speech recognition", desc: "CTC loss, seq2seq, Whisper fine-tuning.", status: "in-progress" },
  { title: "Self-supervised representations", desc: "Wav2Vec, HuBERT-style audio embeddings.", status: "upcoming" },
  { title: "Neural vocoders", desc: "WaveNet, HiFi-GAN, spectrogram-to-speech.", status: "upcoming" },
  { title: "Text-to-speech", desc: "Tacotron, FastSpeech, controllable synthesis.", status: "upcoming" },
  { title: "Neural audio codecs", desc: "EnCodec, RVQ, audio-to-discrete-tokens.", status: "upcoming" },
  { title: "Voice cloning", desc: "Speaker encoders, zero-shot cloning, XTTS-style systems.", status: "upcoming" },
  { title: "Audio language models", desc: "AudioLM, VoiceBox, Moshi-style architectures.", status: "upcoming" },
  { title: "Emotion & prosody", desc: "Paralinguistic analysis, expressive synthesis.", status: "upcoming" },
];

const statusMeta = {
  done: { icon: CheckCircle2, label: "Shipped", cls: "text-emerald-600" },
  "in-progress": { icon: Loader2, label: "In progress", cls: "text-gold" },
  upcoming: { icon: Circle, label: "Upcoming", cls: "text-brown-muted" },
};

export default function Vision() {
  return (
    <motion.div
      className="space-y-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.section variants={itemVariants} className="pt-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          Open-source audio AI
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif text-brown leading-tight mb-5">
          Audio AI, built from first principles.
        </h1>
        <p className="text-lg text-brown-muted max-w-2xl leading-relaxed mb-7">
          Svara Labs is a research-driven audio AI platform. Every layer — from raw waveform
          physics to neural vocoders, TTS, and voice cloning — is built from scratch, trained on
          real data, and shipped as a usable service.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/services" className="btn-primary inline-flex items-center gap-2">
            Explore services <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/learn" className="btn-secondary inline-flex items-center gap-2">
            The Learn notebooks
          </Link>
        </div>
      </motion.section>

      {/* North star */}
      <motion.section variants={itemVariants} className="card">
        <h2 className="text-sm font-medium uppercase tracking-wider text-brown-muted mb-2">
          The North Star
        </h2>
        <p className="font-serif text-2xl sm:text-3xl text-brown leading-snug">
          Understand the audio AI research space fully — every layer of the stack, from waveform
          physics to audio language models, built and reasoned about from first principles.
          Shippable products are downstream artifacts of that understanding.
        </p>
      </motion.section>

      {/* Roadmap */}
      <motion.section variants={itemVariants}>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-brown">Research roadmap</h2>
          <p className="text-sm text-brown-muted mt-1">
            Each stage ships as a feature. Ordering is dynamic — we reorder based on what we learn.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {stages.map((s, idx) => {
            const meta = statusMeta[s.status];
            const Icon = meta.icon;
            return (
              <motion.div key={s.title} variants={itemVariants} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-gold">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg text-brown">{s.title}</h3>
                    </div>
                    <p className="text-sm text-brown-muted leading-relaxed">{s.desc}</p>
                    <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium ${meta.cls}`}>
                      <Icon className={`w-3.5 h-3.5 ${s.status === "in-progress" ? "animate-spin" : ""}`} />
                      {meta.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}
