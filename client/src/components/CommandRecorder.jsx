import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, RotateCcw, Brain } from "lucide-react";
import { predictCommand } from "../api/predictions";
import { convertToWav } from "../utils/audio";

const AUTO_STOP_MS = 1500;

export default function CommandRecorder() {
  const [state, setState] = useState("idle"); // idle | recording | predicting | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const streamRef = useRef(null);
  const autoStopTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopAndPredict = useCallback(async () => {
    if (autoStopTimer.current) {
      clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const webmBlob = new Blob(chunks.current, { type: "audio/webm" });

        setState("predicting");
        try {
          const wavBlob = await convertToWav(webmBlob);
          const prediction = await predictCommand(wavBlob);
          setResult(prediction);
          setState("result");
        } catch (err) {
          setError(
            err.response?.data?.detail || err.message || "Prediction failed"
          );
          setState("idle");
        }
      };

      recorder.start(100);
      setState("recording");

      // auto-stop after 1.5s
      autoStopTimer.current = setTimeout(() => {
        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
          mediaRecorder.current.stop();
        }
      }, AUTO_STOP_MS);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
      setState("idle");
    }
  }, []);

  const reset = () => {
    setResult(null);
    setError(null);
    setState("idle");
  };

  return (
    <div className="card flex flex-col items-center gap-6 py-10 sm:py-12">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-gold" />
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
          Speech Command
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-serif text-brown text-center">
        Predict a Command
      </h2>
      <p className="text-sm text-brown-muted max-w-md text-center">
        Say a single word like &ldquo;yes&rdquo;, &ldquo;stop&rdquo;, or
        &ldquo;go&rdquo;. The CNN will identify it from 35 known commands.
      </p>

      {/* Mic / result area */}
      <AnimatePresence mode="wait">
        {state === "result" && result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4 mt-2"
          >
            <span className="text-4xl sm:text-5xl font-serif text-brown capitalize">
              {result.label}
            </span>
            <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-gold/15 text-brown-accent">
              {(result.confidence * 100).toFixed(1)}% confidence
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={reset}
              className="mt-2 flex items-center gap-2 text-sm font-medium text-brown-muted hover:text-brown transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mt-2"
          >
            <AnimatePresence>
              {state === "recording" && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400"
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-400"
                    initial={{ scale: 1, opacity: 0.2 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={state === "idle" ? startRecording : stopAndPredict}
              disabled={state === "predicting"}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                state === "recording"
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  : state === "predicting"
                  ? "bg-cream text-brown-muted cursor-not-allowed border border-border"
                  : "bg-brown-accent hover:bg-brown-hover text-white shadow-card-hover"
              }`}
            >
              {state === "predicting" ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text */}
      <div className="h-6 flex items-center">
        {state === "recording" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-red-500 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening...
          </motion.span>
        )}
        {state === "predicting" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gold"
          >
            Analyzing...
          </motion.span>
        )}
        {state === "idle" && !error && (
          <span className="text-xs text-brown-muted">
            Tap to record &middot; Auto-stops after 1.5s
          </span>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-full"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
