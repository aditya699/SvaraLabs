import { motion } from "framer-motion";
import LiveTranscriber from "../../components/LiveTranscriber";

export default function STT() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif text-brown mb-2">Speech-to-Text</h1>
        <p className="text-brown-muted max-w-2xl">
          Streaming transcription over a WebSocket proxy to OpenAI Realtime. Partial results
          update as you speak; finals commit on pause (server VAD).
        </p>
      </div>
      <LiveTranscriber />
    </motion.div>
  );
}
