import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LoaderIcon,
} from "lucide-react";

type ResponseType = "work" | "about" | "experience" | "resume" | "out-of-scope";

type AppPhase =
  | "home"
  | "filling"
  | "loading"
  | "transitioning"
  | "reasoning"
  | "streaming"
  | "done";

interface ChatState {
  userMessage: string;
  responseType: ResponseType;
}

const navItems = [
  {
    id: "work" as ResponseType,
    label: "Work",
    iconSrc: "/figmaAssets/desktoptower.svg",
    query: "Show me the best work of Chirag",
  },
  {
    id: "about" as ResponseType,
    label: "About",
    iconSrc: "/figmaAssets/user.svg",
    query: "Tell me about Chirag",
  },
  {
    id: "experience" as ResponseType,
    label: "Experience",
    iconSrc: "/figmaAssets/briefcase.svg",
    query: "Show me Chirag's career ladder",
  },
  {
    id: "resume" as ResponseType,
    label: "Resume",
    iconSrc: "/figmaAssets/readcvlogo.svg",
    query: "Show me Chirag's resume",
  },
];

const reasoningSteps: Record<ResponseType, string[]> = {
  work: [
    "Searching through Chirag's design vault...",
    "Filtering for the most impactful work...",
    "Analysing product decisions and outcomes...",
    "Preparing the best case studies for you...",
  ],
  about: [
    "Opening Chirag's background file...",
    "Reviewing his journey and design philosophy...",
    "Preparing a quick introduction...",
  ],
  experience: [
    "Scanning Chirag's professional timeline...",
    "Reviewing roles and responsibilities...",
    "Analyzing product impact across companies...",
    "Preparing the experience overview...",
  ],
  resume: [
    "Searching for Chirag's latest resume...",
    "Verifying experience and highlights...",
    "Preparing the download...",
  ],
  "out-of-scope": [
    "Processing request through intent classifier...",
    "No matching capability found in current scope...",
    "Generating fallback response...",
  ],
};

const responseTexts: Record<ResponseType, string[]> = {
  work: [
    "Here's a compilation of Chirag's work.",
    "",
    "It includes projects from Sense, Gistr, and Nudge Lab, focusing on solving complex product problems. Some of his most impactful work includes:",
    "",
    "1. AI Agents for HR Teams",
    "Designing AI agents that help HR Admins and Recruiters configure talent engagement workflows with significantly less effort and time.",
    "",
    "2. Reimagining AI Experiences",
    "Simplifying how users interact with AI systems, making learning, discovery, and adoption more intuitive.",
    "",
    "3. Interview Scheduling for Talent Acquisition",
    "Streamlining the scheduling process for recruiters and hiring managers to reduce coordination friction.",
    "",
    "4. Visual Design Explorations",
    "",
    "Beyond this, Chirag has also worked on simplifying research for legal professionals and establishing the MVP for an AI-powered cybersecurity platform.",
  ],
  about: [
    "About Chirag",
    "",
    "Chirag is a Product Designer who thinks beyond screens \u2014 working at the intersection of user experience, product thinking, and business impact. He enjoys turning complex problems (especially in AI and workflow-heavy products) into experiences that feel simple, intuitive, and actually useful.",
    "",
    "He has worked on AI-driven products, recruiter tools, and emerging tech platforms across companies like Sense, Gistr, and Nudge Lab, focusing on building systems that scale rather than just shipping features.",
    "",
    "Outside of design, Chirag enjoys cooking and swimming \u2014 one lets him experiment with flavors, the other helps him clear his head when product problems get messy.",
    "",
    "In short:",
    "He designs thoughtful products, cooks a mean meal, and occasionally escapes to the pool when Figma gets too intense.",
  ],
  experience: [
    "Here's a summary of Chirag's professional experience.",
    "",
    "Product Designer \u2014 Sense \u00B7 2022 \u2013 Present",
    "Leading design for AI-powered HR products including AI Agents, Interview Scheduling, and talent engagement platforms. Driving end-to-end design from research to high-fidelity delivery.",
    "",
    "Product Designer \u2014 Gistr \u00B7 2021 \u2013 2022",
    "Designed AI-assisted research tools for legal professionals. Established the visual language and UX patterns for the platform from the ground up.",
    "",
    "UX Designer \u2014 Nudge Lab \u00B7 2020 \u2013 2021",
    "Worked on an AI-powered cybersecurity platform, helping define the MVP and core user flows. Focused on making complex security data accessible to non-technical users.",
  ],
  resume: [
    "Chirag's resume is ready for download.",
    "",
    "It covers his work across AI products, HR Tech, LegalTech, and Cybersecurity \u2014 including case studies, key outcomes, and the tools he works with.",
  ],
  "out-of-scope": [
    "Sorry! That request is currently out of scope.",
    "",
    "Chirag believes in phase-by-phase development, and this feature didn't make it into the initial PRD.",
    "",
    "For now, this AI can help you with a few things:",
    "\u2022 Learn about Chirag",
    "\u2022 Explore his work",
    "\u2022 See his experience",
    "\u2022 Download his resume",
    "",
    "Try one of those prompts \u2014 they're fully shipped.",
  ],
};

function NavPill({
  item,
  onClick,
}: {
  item: (typeof navItems)[number];
  onClick: () => void;
}) {
  return (
    <button
      data-testid={`prompt-${item.id}`}
      onClick={onClick}
      className="bg-white flex gap-1.5 items-center justify-center px-2 py-1 rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.06)] hover:bg-neutral-50 transition-colors cursor-pointer"
      style={{ border: "0.5px solid #E0E0E0" }}
    >
      <img src={item.iconSrc} alt={item.label} className="w-[18px] h-[18px]" />
      <span className="font-['Inter',sans-serif] font-normal text-[#171717] text-sm leading-5 whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
}

function StreamingText({
  lines,
  onComplete,
}: {
  lines: string[];
  onComplete: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const delay = lines[visibleLines] === "" ? 40 : 30 + Math.min(lines[visibleLines].length * 0.5, 60);
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), delay);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [visibleLines, lines, onComplete]);

  return (
    <div
      className="text-[#222] text-base leading-6 font-['Inter',sans-serif] font-normal"
      style={{ letterSpacing: 0 }}
    >
      {lines.slice(0, visibleLines).map((line, i) => {
        if (line === "") return <br key={i} />;
        const isTitle =
          i === 0 ||
          line.startsWith("1.") ||
          line.startsWith("2.") ||
          line.startsWith("3.") ||
          line.startsWith("4.") ||
          line.match(/^Product Designer/) ||
          line.match(/^UX Designer/) ||
          line === "In short:";
        return (
          <p
            key={i}
            className={`animate-stream-line ${isTitle ? "font-semibold" : ""}`}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

function WorkCards() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6 animate-stream-line">
      <div className="rounded-xl h-[220px] bg-white" style={{ border: "0.5px solid #f0f0f0" }} />
      <div className="rounded-xl h-[220px] bg-white" style={{ border: "0.5px solid #f0f0f0" }} />
      <div className="rounded-xl h-[220px] bg-white" style={{ border: "0.5px solid #f0f0f0" }} />
      <div className="rounded-xl h-[220px] bg-white" style={{ border: "0.5px solid #f0f0f0" }} />
      <div className="rounded-xl h-[70px] bg-white" style={{ border: "0.5px solid #f0f0f0" }} />
      <div className="rounded-xl h-[70px] bg-white" style={{ border: "0.5px solid #f0f0f0" }} />
    </div>
  );
}

function ResumeCard() {
  return (
    <div className="mt-4 animate-stream-line">
      <div
        className="rounded-xl p-6 bg-white inline-flex flex-col gap-4 items-start"
        style={{ border: "0.5px solid #f0f0f0" }}
      >
        <div>
          <p className="font-semibold text-[#171717] font-['Inter',sans-serif] text-base">
            Chirag Chhajer — Product Designer
          </p>
          <p className="text-[#a1a1a1] text-sm mt-0.5 font-['Inter',sans-serif]">
            PDF · Updated 2025
          </p>
        </div>
        <a
          href="#"
          data-testid="button-download-resume"
          className="bg-[#171717] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors font-['Inter',sans-serif]"
          onClick={(e) => e.preventDefault()}
        >
          Download Resume
        </a>
      </div>
    </div>
  );
}

function CollapsibleReasoning({
  steps,
  isCollapsed,
}: {
  steps: string[];
  isCollapsed: boolean;
}) {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  useEffect(() => {
    if (isCollapsed) setCollapsed(true);
  }, [isCollapsed]);

  return (
    <div style={{ marginTop: 20 }}>
      <button
        className="flex items-center gap-1.5 mb-3 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
        data-testid="button-toggle-reasoning"
      >
        <BrainIcon className="w-5 h-5 text-[#a1a1a1]" />
        <span className="font-['Inter',sans-serif] text-[#a1a1a1] text-sm leading-5">
          {steps.length} steps completed
        </span>
        {collapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-[#a1a1a1]" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-[#a1a1a1]" />
        )}
      </button>
      {!collapsed && (
        <div className="space-y-1.5 mb-4 ml-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 font-['Inter',sans-serif] text-sm"
            >
              <div className="w-3 h-3 rounded-full bg-[#e0e0e0] flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1a1]" />
              </div>
              <span className="text-[#a1a1a1]">{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveReasoning({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <div className="flex items-center gap-2 mb-4">
        <LoaderIcon className="w-4 h-4 text-[#a1a1a1] animate-spin flex-shrink-0" />
        <span className="font-['Inter',sans-serif] text-[#a1a1a1] text-sm leading-5">
          Chirag's AI is thinking...
        </span>
      </div>
      <div className="space-y-1.5 mb-4 ml-1">
        {steps.slice(0, currentStep + 1).map((step, i) => {
          const isActive = i === currentStep;
          return (
            <div
              key={i}
              className="flex items-center gap-2 font-['Inter',sans-serif] text-sm animate-stream-line"
            >
              {isActive ? (
                <LoaderIcon className="w-3 h-3 text-[#a1a1a1] animate-spin flex-shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-[#e0e0e0] flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1a1]" />
                </div>
              )}
              <span className={isActive ? "text-[#171717]" : "text-[#a1a1a1]"}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getResponseType(input: string): ResponseType {
  const lower = input.toLowerCase();
  if (
    lower.includes("work") ||
    lower.includes("project") ||
    lower.includes("portfolio") ||
    lower.includes("best")
  )
    return "work";
  if (
    lower.includes("about") ||
    lower.includes("who") ||
    lower.includes("tell me about")
  )
    return "about";
  if (
    lower.includes("experience") ||
    lower.includes("career") ||
    lower.includes("ladder")
  )
    return "experience";
  if (lower.includes("resume") || lower.includes("cv")) return "resume";
  return "out-of-scope";
}

function AnimatedClock({ time }: { time: string }) {
  const [displayTime, setDisplayTime] = useState(time);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTimeRef = useRef(time);

  useEffect(() => {
    if (time !== prevTimeRef.current) {
      prevTimeRef.current = time;
      setIsAnimating(true);
      const t = setTimeout(() => {
        setDisplayTime(time);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [time]);

  return (
    <p
      className="font-['JetBrains_Mono',monospace] font-medium text-[#b8b8b8] text-[14px] leading-5 whitespace-nowrap uppercase"
      style={{
        letterSpacing: "-0.02em",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? "translateY(-4px)" : "translateY(0)",
      }}
      data-testid="text-clock"
    >
      {displayTime}
    </p>
  );
}

function useLiveClock() {
  const formatTime = useCallback(() => {
    const now = new Date();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];
    const day = days[now.getDay()];
    const date = String(now.getDate()).padStart(2, "0");
    const month = months[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${day} ${date} ${month} ${hours}:${minutes}`;
  }, []);

  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(id);
  }, [formatTime]);

  return time;
}

export const Desktop = (): JSX.Element => {
  const [chat, setChat] = useState<ChatState | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [phase, setPhase] = useState<AppPhase>("home");
  const [reasoningStep, setReasoningStep] = useState(0);
  const [pendingQuery, setPendingQuery] = useState("");
  const [pendingType, setPendingType] = useState<ResponseType>("work");
  const [inChatMode, setInChatMode] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [streamComplete, setStreamComplete] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const time = useLiveClock();

  function handlePromptChipClick(item: (typeof navItems)[number]) {
    setInputValue(item.query);
    setPendingQuery(item.query);
    setPendingType(item.id);
    setPhase("filling");
  }

  useEffect(() => {
    if (phase === "filling") {
      const timer = setTimeout(() => setPhase("loading"), 600);
      return () => clearTimeout(timer);
    }
    if (phase === "loading") {
      const timer = setTimeout(() => setPhase("transitioning"), 1500);
      return () => clearTimeout(timer);
    }
    if (phase === "transitioning") {
      setInChatMode(true);
      setPhase("reasoning");
      setReasoningStep(0);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "reasoning") {
      const steps = reasoningSteps[pendingType];
      if (reasoningStep < steps.length - 1) {
        const delay = 600 + Math.random() * 800;
        const timer = setTimeout(() => setReasoningStep((s) => s + 1), delay);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setChat({ userMessage: pendingQuery, responseType: pendingType });
          setInputValue("");
          setStreamComplete(false);
          setStreamKey((k) => k + 1);
          setPhase("streaming");
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, reasoningStep, pendingQuery, pendingType]);

  function handleManualSubmit(query: string) {
    if (!query.trim()) return;
    const responseType = getResponseType(query);
    setPendingQuery(query);
    setPendingType(responseType);
    setPhase("loading");
  }

  function handleReset() {
    setChat(null);
    setInputValue("");
    setPhase("home");
    setReasoningStep(0);
    setPendingQuery("");
    setInChatMode(false);
    setStreamComplete(false);
  }

  function startNewPrompt(item: (typeof navItems)[number]) {
    setChat(null);
    setStreamComplete(false);
    setStreamKey((k) => k + 1);
    setPendingQuery(item.query);
    setPendingType(item.id);
    setInputValue(item.query);
    setReasoningStep(0);
    setInChatMode(true);
    setPhase("loading");
  }

  const currentStreamKey = useRef(streamKey);
  currentStreamKey.current = streamKey;

  const handleStreamComplete = useCallback(() => {
    setStreamComplete(true);
    setPhase("done");
  }, []);

  useEffect(() => {
    if ((phase === "streaming" || phase === "done") && scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [phase, streamComplete]);

  const suggestedItems = chat
    ? navItems.filter((n) => n.id !== chat.responseType)
    : navItems;

  const showLoader = phase === "loading";
  const isHomeScreen = !inChatMode && (phase === "home" || phase === "filling" || phase === "loading");
  const isChatScreen = inChatMode || phase === "transitioning" || phase === "reasoning" || phase === "streaming" || phase === "done";

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ border: "0.5px solid #e5e5e5" }}
      >
        {isHomeScreen ? (
          <div className="relative w-full h-full">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              alt="Background gradient"
              src="/figmaAssets/image-51.png"
            />
            <img
              className="absolute top-[19px] left-[19px] w-[86px] h-[34px] z-10"
              alt="Logo"
              src="/figmaAssets/vector-22.svg"
            />
            <div className="absolute top-4 right-5 z-10">
              <AnimatedClock time={time} />
            </div>

            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 w-full px-5"
              style={{ gap: 12 }}
            >
              <h1
                className="font-['Inter',sans-serif] font-normal text-[#171717] text-center animate-entrance-1 md:whitespace-nowrap"
                style={{
                  letterSpacing: "-0.02em",
                  fontSize: "clamp(24px, 4vw, 32px)",
                  lineHeight: "clamp(32px, 5vw, 40px)",
                }}
                data-testid="text-heading"
              >
                Hola! I&apos;m Chirag&apos;s portfolio AI.
              </h1>

              <div
                className="w-full max-w-[720px] bg-white rounded-2xl transition-colors duration-200 animate-entrance-2"
                style={{
                  border: `0.5px solid ${isInputHovered ? "#CCCCCC" : "#E5E5E5"}`,
                }}
                onMouseEnter={() => setIsInputHovered(true)}
                onMouseLeave={() => setIsInputHovered(false)}
              >
                <div className="p-3 flex flex-col gap-2" style={{ minHeight: 84 }}>
                  <div className="flex items-start gap-2.5 w-full flex-1">
                    <img
                      src="/figmaAssets/magnifyingglass.svg"
                      alt="search"
                      className="w-5 h-5 flex-shrink-0 mt-[2px]"
                    />
                    <input
                      ref={inputRef}
                      data-testid="input-query"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleManualSubmit(inputValue)
                      }
                      placeholder="Ask me anything about Chirag..."
                      className="flex-1 border-0 shadow-none p-0 h-auto font-['Inter',sans-serif] font-normal text-base leading-6 focus:outline-none bg-transparent text-[#171717] placeholder:text-[#a6a6a6]"
                      style={{ letterSpacing: 0 }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      data-testid="button-submit"
                      onClick={() => handleManualSubmit(inputValue)}
                      className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    >
                      {showLoader ? (
                        <LoaderIcon className="w-5 h-5 text-[#171717] animate-spin" />
                      ) : (
                        <img
                          src="/figmaAssets/frame-103.svg"
                          alt="send"
                          className="w-5 h-5"
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center flex-wrap justify-center animate-entrance-3"
                style={{ gap: 8 }}
              >
                {navItems.map((item) => (
                  <NavPill
                    key={item.id}
                    item={item}
                    onClick={() => handlePromptChipClick(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : isChatScreen ? (
          <div className="relative w-full h-full flex flex-col bg-white">
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
              <button onClick={handleReset} data-testid="button-logo-home">
                <img
                  className="w-[86px] h-[34px]"
                  alt="Logo"
                  src="/figmaAssets/vector-22.svg"
                />
              </button>
              <AnimatedClock time={time} />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-8">
              <div className="max-w-[720px] mx-auto">
                <div className="flex justify-end mt-4">
                  <div
                    className="bg-[#f0f0f0] max-w-[600px]"
                    style={{ borderRadius: 12, padding: "8px 16px" }}
                  >
                    <p
                      className="font-['Inter',sans-serif] font-normal text-[#171717] text-base leading-6"
                      style={{ letterSpacing: 0 }}
                      data-testid="text-user-message"
                    >
                      {pendingQuery}
                    </p>
                  </div>
                </div>

                {(phase === "reasoning" || phase === "transitioning") && (
                  <ActiveReasoning
                    steps={reasoningSteps[pendingType]}
                    currentStep={reasoningStep}
                  />
                )}

                {(phase === "streaming" || phase === "done") && chat && (
                  <>
                    <CollapsibleReasoning
                      steps={reasoningSteps[chat.responseType]}
                      isCollapsed={true}
                    />

                    <StreamingText
                      key={streamKey}
                      lines={responseTexts[chat.responseType]}
                      onComplete={handleStreamComplete}
                    />

                    {chat.responseType === "work" && streamComplete && (
                      <WorkCards />
                    )}

                    {chat.responseType === "resume" && streamComplete && (
                      <ResumeCard />
                    )}

                    {streamComplete && (
                      <div className="mt-10 animate-stream-line">
                        <p className="font-['Inter',sans-serif] text-[#222] text-base leading-6 mb-3">
                          Suggested Prompts:
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {suggestedItems.map((item) => (
                            <NavPill
                              key={item.id}
                              item={item}
                              onClick={() => startNewPrompt(item)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
