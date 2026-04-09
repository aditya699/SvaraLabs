import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Hash,
  Trash2,
  Loader2,
  AudioWaveform,
  Activity,
} from "lucide-react";
import { getRecording, deleteRecording } from "../api/recordings";
import InteractiveWaveform from "../components/InteractiveWaveform";
import InteractiveSpectrum from "../components/InteractiveSpectrum";

export default function RecordingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecording(id);
        setRecording(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Recording not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteRecording(id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed");
      setDeleting(false);
    }
  };

  const formatDuration = (s) => {
    if (s < 60) return `${s.toFixed(1)} seconds`;
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="btn-secondary no-underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link to="/" className="btn-secondary text-sm no-underline">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete
        </button>
      </div>

      {/* Waveform card */}
      <div className="bg-card rounded-2xl border border-border p-8 sm:p-10 shadow-card">
        {/* Waveform */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <AudioWaveform className="w-4 h-4 text-gold" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
              Waveform
            </span>
          </div>
          {recording.waveform_data ? (
            <InteractiveWaveform data={recording.waveform_data} />
          ) : (
            <div className="rounded-xl overflow-hidden bg-cream">
              <img
                src={`data:image/png;base64,${recording.waveform_base64}`}
                alt="Waveform"
                className="w-full h-auto block"
              />
            </div>
          )}
        </div>

        {/* Frequency Spectrum */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-gold" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
              Frequency Spectrum
            </span>
          </div>
          {recording.spectrum_data ? (
            <InteractiveSpectrum data={recording.spectrum_data} />
          ) : (
            <div className="rounded-xl overflow-hidden bg-cream">
              <img
                src={`data:image/png;base64,${recording.spectrum_base64}`}
                alt="Frequency Spectrum"
                className="w-full h-auto block"
              />
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif text-brown mb-6">
          Recording Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-cream border border-border">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-brown-muted font-medium">Duration</p>
              <p className="text-sm font-medium text-brown">
                {formatDuration(recording.duration_seconds)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-cream border border-border">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-brown-muted font-medium">
                Sample Rate
              </p>
              <p className="text-sm font-medium text-brown">
                {(recording.sample_rate / 1000).toFixed(1)} kHz
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-cream border border-border">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-brown-muted font-medium">Recorded</p>
              <p className="text-sm font-medium text-brown">
                {formatDate(recording.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
