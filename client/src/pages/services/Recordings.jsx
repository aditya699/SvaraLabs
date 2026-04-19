import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import Recorder from "../../components/Recorder";
import RecordingList from "../../components/RecordingList";
import { listRecordings } from "../../api/recordings";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecordings = useCallback(async () => {
    try {
      const data = await listRecordings(0, 30);
      setRecordings(data.recordings);
    } catch (err) {
      console.error("Failed to fetch recordings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleRecorded = (newRecording) => {
    setRecordings((prev) => [newRecording, ...prev]);
  };

  return (
    <motion.div
      className="space-y-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Recorder onRecorded={handleRecorded} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-brown">
              Recent Recordings
            </h2>
          </div>
          {recordings.length > 0 && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
              {recordings.length} recording{recordings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <RecordingList recordings={recordings} loading={loading} />
      </motion.div>
    </motion.div>
  );
}
