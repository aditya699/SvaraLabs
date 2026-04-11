import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import NotebookCard from "../components/NotebookCard";
import { NOTEBOOKS } from "../data/notebooks";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Learn() {
  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6 text-gold" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-brown">
          Learn Audio AI
        </h1>
        <p className="text-brown-muted max-w-lg mx-auto leading-relaxed">
          Go from zero to building audio AI models. Each notebook is a
          self-contained lesson — open it in Colab and start learning.
        </p>
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-gold/15 text-brown-accent">
          {NOTEBOOKS.length} notebook{NOTEBOOKS.length !== 1 ? "s" : ""}{" "}
          available
        </span>
      </motion.div>

      {/* Notebook grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {NOTEBOOKS.map((nb, i) => (
          <NotebookCard key={nb.id} notebook={nb} index={i} />
        ))}

        {/* Coming soon teaser */}
        <div className="rounded-2xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
          <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
            <Plus className="w-5 h-5 text-brown-muted" />
          </div>
          <p className="text-sm text-brown-muted">
            More notebooks coming soon — signal processing, spectrograms,
            speech recognition, and beyond.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
