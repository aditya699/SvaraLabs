import { motion, AnimatePresence } from "framer-motion";
import { AudioLines } from "lucide-react";
import WaveformCard from "./WaveformCard";

export default function RecordingList({ recordings, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 flex items-center justify-center">
          <AudioLines className="w-8 h-8 text-gold/50" />
        </div>
        <p className="text-brown-muted text-sm">
          No recordings yet. Hit the mic to get started!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      <AnimatePresence>
        {recordings.map((rec, i) => (
          <WaveformCard key={rec.id} recording={rec} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}
