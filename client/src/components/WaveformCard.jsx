import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Calendar } from "lucide-react";

export default function WaveformCard({ recording, index = 0 }) {
  const { id, filename, duration_seconds, created_at, waveform_base64, spectrum_base64 } =
    recording;

  const formatDuration = (s) => {
    if (s < 60) return `${s.toFixed(1)}s`;
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Link
        to={`/recordings/${id}`}
        className="block bg-card rounded-xl border border-border p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 no-underline"
      >
        {/* Charts */}
        <div className="grid grid-cols-2 gap-2 -mx-1 mb-4">
          <div className="rounded-xl overflow-hidden bg-cream">
            <img
              src={`data:image/png;base64,${waveform_base64}`}
              alt={`Waveform for ${filename}`}
              className="w-full h-auto block"
            />
          </div>
          {spectrum_base64 && (
            <div className="rounded-xl overflow-hidden bg-cream">
              <img
                src={`data:image/png;base64,${spectrum_base64}`}
                alt={`Spectrum for ${filename}`}
                className="w-full h-auto block"
              />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-brown-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gold/10 flex items-center justify-center">
              <Clock className="w-3 h-3 text-gold" />
            </div>
            <span>{formatDuration(duration_seconds)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gold/10 flex items-center justify-center">
              <Calendar className="w-3 h-3 text-gold" />
            </div>
            <span>{formatDate(created_at)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
