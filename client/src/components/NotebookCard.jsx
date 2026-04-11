import { motion } from "framer-motion";
import { Clock, Code } from "lucide-react";
import { getGitHubUrl } from "../data/notebooks";

const difficultyStyles = {
  beginner: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border border-amber-200",
  advanced: "bg-red-50 text-red-700 border border-red-200",
};

export default function NotebookCard({ notebook, index = 0 }) {
  const { title, description, day, difficulty, topics, notebookPath, estimatedMinutes } =
    notebook;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ scale: 1.02 }}
      className="card flex flex-col"
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gold/15 text-brown-accent">
          Day {day}
        </span>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${difficultyStyles[difficulty]}`}
        >
          {difficulty}
        </span>
        <span className="flex items-center gap-1 text-xs text-brown-muted ml-auto">
          <Clock className="w-3 h-3" />
          ~{estimatedMinutes} min
        </span>
      </div>

      {/* Title & description */}
      <h3 className="font-serif text-xl text-brown mb-2">{title}</h3>
      <p className="text-sm text-brown-muted leading-relaxed mb-4 line-clamp-3">
        {description}
      </p>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {topics.map((topic) => (
          <span
            key={topic}
            className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-brown-accent"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Action button */}
      <div className="mt-auto">
        <a
          href={getGitHubUrl(notebookPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-1.5 text-sm no-underline w-fit"
        >
          <Code className="w-3.5 h-3.5" />
          View on GitHub
        </a>
      </div>
    </motion.div>
  );
}
