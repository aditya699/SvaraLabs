import { motion } from "framer-motion";
import CommandRecorder from "../../components/CommandRecorder";

export default function Commands() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <CommandRecorder />
    </motion.div>
  );
}
