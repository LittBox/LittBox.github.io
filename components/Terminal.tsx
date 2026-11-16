
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { profile } from "@/data/profile";

type Entry = {
  command: string;
  lines: string[];
};

// 首次加载只显示这一条命令
const initialEntries: Entry[] = [
  {
    command: "woami",
    lines: ["LittBox · Ynu Junior student"],
  },
];

// 底部快捷命令标签
const quickCommands = [
  "help",
  "whoami",
  "research",
  "projects",
  "clear",
];

function response(raw: string): string[] {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");

  switch (cmd) {
    case "help":
      return [
        "Available commands:",
        "  whoami    About me",
        "  research  Research interests",
        "  projects  Featured projects",
        "  skills    Technical skills",
        "  contact   Contact information",
        "  clear     Clear terminal",
      ];

    case "whoami":
    case "woami":
    case "about":
      return [`${profile.name} · ${profile.title}`];

    case "research":
    case "cat focus.txt":
      return [profile.focus.join(" · ")];

    case "skills":
    case "cat stack.txt":
      return [profile.stack.join(" · ")];

    case "projects":
    case "ls":
    case "ls shipped/":
      return profile.projects.map(
        (p, i) =>
          `${String(i + 1).padStart(2, "0")}. ${p.slug}/  ${p.url}`
      );

    case "github":
      return [`github: ${profile.github}`];

    case "contact":
      return profile.email
        ? [`email: ${profile.email}`, `github: ${profile.github}`]
        : [`github: ${profile.github}`];

    case "status":
      return [`● ${profile.status}`];

    default:
      return [
        `command not found: ${raw.trim()}`,
        "Type 'help' to see available commands.",
      ];
  }
}

function Line({ line }: { line: string }) {
  const url = line.match(/https:\/\/[^\s]+/)?.[0];

  if (url) {
    const index = line.indexOf(url);

    return (
      <div className="terminal-output">
        {line.slice(0, index)}
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        {line.slice(index + url.length)}
      </div>
    );
  }

  return <div className="terminal-output">{line}</div>;
}

export default function Terminal() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [input, setInput] = useState("");

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [entries]);

  function runCommand(raw: string) {
    const command = raw.trim();

    if (!command) return;

    if (command.toLowerCase() === "clear") {
      setEntries([]);
    } else {
      setEntries((old) => [
        ...old,
        {
          command,
          lines: response(command),
        },
      ]);
    }

    setCommandHistory((old) => [...old, command]);
    setHistoryIndex(-1);
    setInput("");

    inputRef.current?.focus();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand(input);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();

      const nextIndex =
        historyIndex < 0
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (historyIndex < 0) return;

      const nextIndex = historyIndex + 1;

      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
  }

  return (
    <section
      className="terminal"
      aria-label="Interactive portfolio terminal"
    >
      {/* 顶部窗口栏 */}
      <header className="terminal-header">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <span className="terminal-title">
          {profile.handle}@{profile.hostname}: ~
        </span>
      </header>

      {/* Terminal 内容 */}
      <div className="terminal-body">
        <div className="terminal-content">
          <div className="terminal-history" aria-live="polite">
            {entries.map((entry, index) => (
              <div
                className="terminal-entry"
                key={`${index}-${entry.command}`}
              >
                <div className="terminal-command">
                  <span className="prompt-mark">$</span>
                  <span>{entry.command}</span>
                </div>

                {entry.lines.map((line, lineIndex) => (
                  <Line line={line} key={lineIndex} />
                ))}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 输入框 */}
          <form
            className="terminal-form"
            onSubmit={onSubmit}
            autoComplete="off"
          >
            <label className="prompt-mark" htmlFor="command-input">
              $
            </label>

            <input
              ref={inputRef}
              id="command-input"
              aria-label="Type a terminal command"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="输入 help、whoami、research..."
            />

            <button className="run-button" type="submit">
              运行 ↵
            </button>
          </form>

          {/* 快捷命令按钮 */}
          <nav
            className="quick-commands"
            aria-label="Quick terminal commands"
          >
            {quickCommands.map((cmd) => (
              <button
                className="quick-command"
                key={cmd}
                type="button"
                onClick={() => runCommand(cmd)}
              >
                {cmd}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
