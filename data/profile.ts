// Edit this file to customize your portfolio content.
export const profile = {
  handle: "littbox",
  hostname: "localhost",
  name: "LittBox",
  title: "researcher · developer",
  focus: ["AI in Healthcare", "ai systems"],
  stack: ["python", "typescript", "next.js", "react"],
  projects: [
    { slug: "bci-research", name: "BCI research", url: "https://github.com/LittBox" },
    { slug: "eeg-experiments", name: "EEG experiments", url: "https://github.com/LittBox" },
    { slug: "ai-projects", name: "AI projects", url: "https://github.com/LittBox" },
  ],
  status: "open to collaboration",
  github: "https://github.com/LittBox",
  email: "", // e.g. "hello@example.com"; keep empty until you want it public
} as const;
