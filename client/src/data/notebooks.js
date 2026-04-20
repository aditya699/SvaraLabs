export const GITHUB_REPO = "aditya699/SvaraLabs";
export const GITHUB_BRANCH = "main";

export const NOTEBOOKS = [
  {
    id: "day1",
    title: "Audio AI Fundamentals",
    description:
      "Build your first audio classifier from scratch. Load the Speech Commands dataset, extract mel spectrograms, design a CNN, and train it end-to-end with PyTorch.",
    day: 1,
    difficulty: "beginner",
    topics: [
      "PyTorch & CUDA Setup",
      "Speech Commands Dataset",
      "Mel Spectrograms",
      "CNN Architecture",
      "Training Loop",
    ],
    notebookPath: "DL/Day1/day1.ipynb",
    estimatedMinutes: 45,
  },
  {
    id: "day3",
    title: "Your First Speech-to-Text Model",
    description:
      "Train your first end-to-end speech recognizer. Learn CTC loss, align audio frames to characters without per-frame labels, and decode model outputs into text.",
    day: 3,
    difficulty: "intermediate",
    topics: [
      "CTC Loss",
      "Character-level ASR",
      "Sequence Alignment",
      "Greedy Decoding",
      "PyTorch",
    ],
    notebookPath: "DL/Day3/ctc_loss.ipynb",
    estimatedMinutes: 60,
  },
  {
    id: "rnn",
    title: "RNNs for Audio",
    description:
      "Understand recurrent neural networks from first principles and apply them to sequential audio data. A stepping stone toward sequence-to-sequence speech recognition.",
    day: 4,
    difficulty: "intermediate",
    workInProgress: true,
    topics: [
      "RNN Fundamentals",
      "Sequence Modeling",
      "Hidden States",
      "BPTT",
      "PyTorch",
    ],
    notebookPath: "DL/RNN/RNN_WIP.ipynb",
    estimatedMinutes: 60,
  },
];

export function getGitHubUrl(notebookPath) {
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${notebookPath}`;
}
