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
];

export function getGitHubUrl(notebookPath) {
  return `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${notebookPath}`;
}
