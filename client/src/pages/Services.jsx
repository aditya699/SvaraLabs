import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, AudioLines, Command, Headphones, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const services = [
  {
    to: "/services/recordings",
    title: "Recordings",
    desc: "Capture audio, generate waveforms and frequency spectra, browse a library of clips.",
    icon: Headphones,
    badge: null,
  },
  {
    to: "/services/stt",
    title: "Speech-to-Text",
    desc: "Realtime streaming transcription powered by OpenAI's gpt-4o-transcribe.",
    icon: AudioLines,
    badge: "Live",
  },
  {
    to: "/services/commands",
    title: "Voice Commands",
    desc: "On-device CNN classifier for short spoken keywords.",
    icon: Command,
    badge: null,
  },
];

const upcoming = [
  { title: "Text-to-Speech", desc: "Neural vocoders and controllable synthesis." },
  { title: "Voice Cloning", desc: "3-second voice prompt → zero-shot cloning." },
];

export default function Services() {
  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section variants={itemVariants} className="pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
            <Mic className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-brown">Services</h1>
        </div>
        <p className="text-brown-muted max-w-2xl">
          Every research stage ships as a service you can use right here in the platform.
        </p>
      </motion.section>

      <motion.section variants={itemVariants}>
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.to} variants={itemVariants}>
                <Link
                  to={s.to}
                  className="card block hover:shadow-card-hover transition-shadow no-underline"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    {s.badge && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-xl text-brown mb-1.5">{s.title}</h2>
                  <p className="text-sm text-brown-muted leading-relaxed mb-4">{s.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-accent">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h2 className="text-sm font-medium uppercase tracking-wider text-brown-muted mb-4">
          Coming soon
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {upcoming.map((u) => (
            <div key={u.title} className="card opacity-60">
              <h3 className="font-serif text-lg text-brown mb-1">{u.title}</h3>
              <p className="text-sm text-brown-muted">{u.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
