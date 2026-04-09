import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, AudioWaveform } from "lucide-react";
import { uploadRecording } from "../api/recordings";

export default function Recorder({ onRecorded }) {
  const [state, setState] = useState("idle"); // idle | recording | uploading
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
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

        setState("uploading");
        try {
          const wavBlob = await convertToWav(webmBlob);
          const result = await uploadRecording(wavBlob, "recording.wav");
          onRecorded?.(result);
          setState("idle");
        } catch (err) {
          setError(
            err.response?.data?.detail || err.message || "Upload failed"
          );
          setState("idle");
        }
      };

      recorder.start(100);
      setState("recording");
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access.");
      setState("idle");
    }
  }, [onRecorded]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card flex flex-col items-center gap-6 py-10 sm:py-12">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
          <AudioWaveform className="w-5 h-5 text-gold" />
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
          Voice Capture
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-serif text-brown text-center">
        Record Your Voice
      </h2>
      <p className="text-sm text-brown-muted max-w-md text-center">
        Tap the microphone to start. Your audio will be analyzed and a waveform
        chart will be generated instantly.
      </p>

      {/* Mic button */}
      <div className="relative mt-2">
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
          onClick={state === "recording" ? stopRecording : startRecording}
          disabled={state === "uploading"}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            state === "recording"
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
              : state === "uploading"
              ? "bg-cream text-brown-muted cursor-not-allowed border border-border"
              : "bg-brown-accent hover:bg-brown-hover text-white shadow-card-hover"
          }`}
        >
          {state === "uploading" ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : state === "recording" ? (
            <Square className="w-7 h-7 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <div className="h-6 flex items-center">
        {state === "recording" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-red-500 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording {formatTime(duration)}
          </motion.span>
        )}
        {state === "uploading" && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gold"
          >
            Generating waveform...
          </motion.span>
        )}
        {state === "idle" && !error && (
          <span className="text-xs text-brown-muted">
            Tap to record &middot; Tap again to stop
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

/**
 * Convert a webm audio blob to WAV using the Web Audio API.
 */
async function convertToWav(webmBlob) {
  const audioCtx = new AudioContext();
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);

  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  audioCtx.close();
  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
