import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LoaderIcon,
} from "lucide-react";
import resumeImagePath from "@assets/Frame_153_1773004120421.png";
import { TextShimmer } from "@/components/ui/text-shimmer";

type ResponseType = "work" | "about" | "experience" | "resume" | "out-of-scope";

type ActivePhase = "loading" | "reasoning" | "streaming" | "done";

interface ConversationEntry {
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
    "Searching through Chirag\u2019s design vault\u2026",
    "Filtering for the most impactful work\u2026",
    "Analysing product decisions and outcomes\u2026",
    "Preparing the best case studies for you\u2026",
  ],
  about: [
    "Opening Chirag\u2019s background file\u2026",
    "Reviewing his journey and design philosophy\u2026",
    "Preparing a quick introduction\u2026",
  ],
  experience: [
    "Scanning Chirag\u2019s professional timeline\u2026",
    "Reviewing roles and responsibilities\u2026",
    "Analyzing product impact across companies\u2026",
    "Preparing the experience overview\u2026",
  ],
  resume: [
    "Searching for Chirag\u2019s latest resume\u2026",
    "Verifying experience and highlights\u2026",
    "Preparing the download\u2026",
  ],
  "out-of-scope": [
    "Processing request\u2026",
    "Searching for matching capabilities\u2026",
    "Generating response\u2026",
  ],
};

interface ResponseBlock {
  type: "paragraph" | "heading" | "numbered-item" | "bullet" | "break" | "experience-role";
  text?: string;
  number?: number;
  subtitle?: string;
  description?: string;
  highlight?: string;
  duration?: string;
  bullets?: string[];
  focusLabel?: string;
}

const responseBlocks: Record<ResponseType, ResponseBlock[]> = {
  work: [
    { type: "paragraph", text: "\u003Cb\u003EHere\u2019s a compilation of Chirag\u2019s work.\u003C/b\u003E It includes projects from Sense, Gistr, and Nudge Lab, focusing on solving complex product problems. Some of his most impactful work includes:" },
    { type: "break" },
    { type: "numbered-item", number: 1, text: "AI Agents for HR Teams", description: "Designing AI agents that help HR Admins and Recruiters configure talent engagement workflows with significantly less effort and time." },
    { type: "numbered-item", number: 2, text: "Reimagining AI Experiences", description: "Simplifying how users interact with AI systems, making learning, discovery, and adoption more intuitive." },
    { type: "numbered-item", number: 3, text: "Interview Scheduling for Talent Acquisition", description: "Streamlining the scheduling process for recruiters and hiring managers to reduce coordination friction." },
    { type: "numbered-item", number: 4, text: "Visual Design Explorations", description: "" },
    { type: "break" },
    { type: "paragraph", text: "Beyond this, Chirag has also worked on simplifying research for legal professionals and establishing the MVP for an AI-powered cybersecurity platform." },
  ],
  about: [
    { type: "heading", text: "About Chirag" },
    { type: "break" },
    { type: "paragraph", text: "Chirag is a Product Designer who thinks beyond screens \u2014 working at the intersection of user experience, product thinking, and business impact. He enjoys turning complex problems (especially in AI and workflow-heavy products) into experiences that feel simple, intuitive, and actually useful." },
    { type: "break" },
    { type: "paragraph", text: "He has worked on AI-driven products, recruiter tools, and emerging tech platforms across companies like Sense, Gistr, and Nudge Lab, focusing on building systems that scale rather than just shipping features." },
    { type: "break" },
    { type: "paragraph", text: "Outside of design, Chirag enjoys cooking \uD83C\uDF73 and swimming \uD83C\uDFCA\u200D\u2642\uFE0F \u2014 one lets him experiment with flavors, the other helps him clear his head when product problems get messy." },
    { type: "break" },
    { type: "paragraph", text: "\u003Cb\u003EIn short:\u003C/b\u003E" },
    { type: "paragraph", text: "He designs thoughtful products, cooks a mean meal, and occasionally escapes to the pool when Figma gets too intense. \u2728" },
  ],
  experience: [
    { type: "heading", text: "Here\u2019s Chirag\u2019s career progression so far." },
    { type: "break" },
    { type: "experience-role", text: "Product Designer", subtitle: "Sense Hq", duration: "2025 \u2014 Present", highlight: "Sense Hq", description: "Currently designing AI-powered recruiter tools that help HR teams create conversational talent workflows and automate engagement.", focusLabel: "Focus areas:", bullets: ["AI agents for recruiters", "Simplifying complex AI workflows", "Scaling interaction patterns for enterprise hiring tools"] },
    { type: "experience-role", text: "Product Designer", subtitle: "Nudge Lab", duration: "2023 \u2014 2025", highlight: "Nudge Lab", description: "Worked across early-stage AI and SaaS products, helping founders turn rough ideas into usable products.", focusLabel: "Focus areas:", bullets: ["Designed AI-powered tools for legal research and cybersecurity", "Improved onboarding and conversion for multiple products", "Built scalable design systems across 100+ screens"] },
    { type: "experience-role", text: "UX Designer", subtitle: "Dank", duration: "2023", highlight: "Dank", description: "First step into product design.", focusLabel: "Worked on:", bullets: ["Messaging and core social features", "Onboarding improvements", "Building the product\u2019s first design system"] },
    { type: "experience-role", text: "Graphic Designer", subtitle: "GreyToYellow", duration: "2022 \u2014 2023", highlight: "GreyToYellow", description: "The origin story. Learned how visual storytelling, branding, and communication influence user perception.", bullets: [], focusLabel: "" },
  ],
  resume: [
    { type: "paragraph", text: "Here you go \u2014 Chirag\u2019s resume is ready for view and download." },
  ],
  "out-of-scope": [
    { type: "paragraph", text: "\u003Cb\u003ESorry! That request is currently out of scope.\u003C/b\u003E" },
    { type: "break" },
    { type: "paragraph", text: "Chirag believes in phase-by-phase development, and this feature didn\u2019t make it into the initial PRD \uD83D\uDE05." },
    { type: "break" },
    { type: "paragraph", text: "For now, this AI can help you with a few things:" },
    { type: "bullet", text: "Learn about Chirag" },
    { type: "bullet", text: "Explore his work" },
    { type: "bullet", text: "See his experience" },
    { type: "bullet", text: "Download his resume" },
    { type: "break" },
    { type: "paragraph", text: "Try one of those prompts \u2014 they\u2019re fully shipped. \uD83D\uDE80" },
  ],
};

function NavPill({
  item,
  onClick,
  disabled,
}: {
  item: (typeof navItems)[number];
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      data-testid={`prompt-${item.id}`}
      onClick={disabled ? undefined : onClick}
      className={`bg-white flex gap-1.5 items-center justify-center px-2 py-1 rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.06)] transition-colors ${disabled ? "opacity-40 cursor-default" : "hover:bg-neutral-50 cursor-pointer"}`}
      style={{ border: "0.5px solid #E0E0E0" }}
      disabled={disabled}
    >
      <img src={item.iconSrc} alt={item.label} className="w-[18px] h-[18px]" />
      <span className="font-['SequelSansBookBody',sans-serif] font-normal text-[#171717] text-sm leading-5 whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
}

function WordStreamingText({
  blocks,
  onComplete,
}: {
  blocks: ResponseBlock[];
  onComplete: () => void;
}) {
  const allWords = useRef<{ word: string; blockIdx: number; wordIdx: number; isFirst: boolean }[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const completedRef = useRef(false);

  if (allWords.current.length === 0) {
    const words: typeof allWords.current = [];
    blocks.forEach((block, bIdx) => {
      if (block.type === "break") {
        words.push({ word: "__BREAK__", blockIdx: bIdx, wordIdx: 0, isFirst: true });
        return;
      }
      const textContent = getBlockPlainText(block);
      const blockWords = textContent.split(/\s+/).filter(Boolean);
      blockWords.forEach((w, wIdx) => {
        words.push({ word: w, blockIdx: bIdx, wordIdx: wIdx, isFirst: wIdx === 0 });
      });
    });
    allWords.current = words;
  }

  useEffect(() => {
    if (wordCount < allWords.current.length) {
      const timer = setTimeout(() => setWordCount((c) => c + 1), 30);
      return () => clearTimeout(timer);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [wordCount, onComplete]);

  const visibleWordsByBlock = new Map<number, number>();
  const reachedBlocks = new Set<number>();
  for (let i = 0; i < wordCount && i < allWords.current.length; i++) {
    const w = allWords.current[i];
    reachedBlocks.add(w.blockIdx);
    if (w.word !== "__BREAK__") {
      visibleWordsByBlock.set(w.blockIdx, (visibleWordsByBlock.get(w.blockIdx) || 0) + 1);
    }
  }

  return (
    <div className="text-[#222222] text-base leading-6 font-['SequelSansBookBody',sans-serif] font-normal" style={{ letterSpacing: 0 }}>
      {blocks.map((block, bIdx) => {
        if (!reachedBlocks.has(bIdx)) return null;
        const visibleWords = visibleWordsByBlock.get(bIdx) || 0;
        if (block.type === "break") return <br key={bIdx} />;
        return <RenderBlock key={bIdx} block={block} visibleWords={visibleWords} />;
      })}
    </div>
  );
}

function getBlockPlainText(block: ResponseBlock): string {
  if (block.type === "break") return "";
  if (block.type === "paragraph" || block.type === "heading") return stripHtml(block.text || "");
  if (block.type === "numbered-item") {
    const numPrefix = block.number ? `${block.number}. ` : "";
    return `${numPrefix}${block.text || ""} ${block.description || ""}`.trim();
  }
  if (block.type === "bullet") return block.text || "";
  if (block.type === "experience-role") {
    const parts = [
      `${block.text} @ ${block.subtitle} ${block.duration}`,
      block.description || "",
      ...(block.focusLabel ? [block.focusLabel] : []),
      ...(block.bullets || []),
    ];
    return parts.join(" ");
  }
  return "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function RenderBlock({ block, visibleWords }: { block: ResponseBlock; visibleWords: number }) {
  if (block.type === "paragraph") {
    const raw = block.text || "";
    const plainWords = stripHtml(raw).split(/\s+/).filter(Boolean);
    const shown = plainWords.slice(0, visibleWords).join(" ");
    const hasBold = raw.includes("<b>");
    if (hasBold) {
      const boldMatch = raw.match(/<b>(.*?)<\/b>/);
      const boldText = boldMatch ? boldMatch[1] : "";
      const afterBold = raw.replace(/<b>.*?<\/b>\s*/, "");
      const boldWords = boldText.split(/\s+/).filter(Boolean);
      if (visibleWords <= boldWords.length) {
        return <p><span className="font-['SequelSansMediumBody',sans-serif] font-normal">{boldWords.slice(0, visibleWords).join(" ")}</span></p>;
      }
      const remainingWords = afterBold.split(/\s+/).filter(Boolean);
      const remainingVisible = visibleWords - boldWords.length;
      return <p><span className="font-['SequelSansMediumBody',sans-serif] font-normal">{boldText}</span> {remainingWords.slice(0, remainingVisible).join(" ")}</p>;
    }
    return <p>{shown}</p>;
  }
  if (block.type === "heading") {
    const words = (block.text || "").split(/\s+/).filter(Boolean);
    return <p className="font-['SequelSansMediumBody',sans-serif] font-normal">{words.slice(0, visibleWords).join(" ")}</p>;
  }
  if (block.type === "numbered-item") {
    const numPrefix = block.number ? `${block.number}. ` : "";
    const fullTitle = `${numPrefix}${block.text || ""}`;
    const titleWords = fullTitle.split(/\s+/).filter(Boolean);
    const descWords = (block.description || "").split(/\s+/).filter(Boolean);
    if (visibleWords <= titleWords.length) {
      return (
        <div className="mb-2">
          <span className="font-['SequelSansMediumBody',sans-serif] font-normal">{titleWords.slice(0, visibleWords).join(" ")}</span>
        </div>
      );
    }
    const descVisible = visibleWords - titleWords.length;
    return (
      <div className="mb-2">
        <span className="font-['SequelSansMediumBody',sans-serif] font-normal">{fullTitle}</span>
        {descWords.length > 0 && <br />}
        {descWords.slice(0, descVisible).join(" ")}
      </div>
    );
  }
  if (block.type === "bullet") {
    const words = (block.text || "").split(/\s+/).filter(Boolean);
    return <p className="ml-4">{"\u2022 "}{words.slice(0, visibleWords).join(" ")}</p>;
  }
  if (block.type === "experience-role") {
    return <ExperienceRoleBlock block={block} visibleWords={visibleWords} />;
  }
  return null;
}

function ExperienceRoleBlock({ block, visibleWords }: { block: ResponseBlock; visibleWords: number }) {
  const headerText = `${block.text} @ ${block.subtitle} ${block.duration}`;
  const headerWords = headerText.split(/\s+/).filter(Boolean);
  const descWords = (block.description || "").split(/\s+/).filter(Boolean);
  const focusLabelWords = (block.focusLabel || "").split(/\s+/).filter(Boolean);
  const bulletTexts = block.bullets || [];
  const allBulletWords = bulletTexts.map(b => b.split(/\s+/).filter(Boolean));

  let remaining = visibleWords;

  const headerVisible = Math.min(remaining, headerWords.length);
  remaining -= headerVisible;

  const descVisible = Math.min(remaining, descWords.length);
  remaining -= descVisible;

  const focusVisible = Math.min(remaining, focusLabelWords.length);
  remaining -= focusVisible;

  const bulletVisibles: number[] = [];
  for (const bw of allBulletWords) {
    const bv = Math.min(remaining, bw.length);
    bulletVisibles.push(bv);
    remaining -= bv;
  }

  const headerShown = headerWords.slice(0, headerVisible).join(" ");

  return (
    <div className="mb-8">
      <div className="flex justify-between items-baseline">
        <p className="font-['SequelSansMediumBody',sans-serif] font-normal">
          {headerVisible >= headerWords.length ? (
            <>
              {block.text} @ {block.subtitle}
            </>
          ) : (
            headerShown
          )}
        </p>
        {headerVisible >= headerWords.length && (
          <span className="font-['SequelSansBookBody',sans-serif] font-normal text-[#7A7A7A] text-base whitespace-nowrap ml-4">{block.duration}</span>
        )}
      </div>
      {descVisible > 0 && (
        <p className="mt-1">{descWords.slice(0, descVisible).join(" ")}</p>
      )}
      {focusVisible > 0 && block.focusLabel && (
        <p className="mt-3 text-[#222222]">{focusLabelWords.slice(0, focusVisible).join(" ")}</p>
      )}
      {bulletVisibles.some(v => v > 0) && (
        <div className="mt-1 space-y-0.5">
          {bulletTexts.map((bt, i) => {
            if (bulletVisibles[i] <= 0) return null;
            const words = bt.split(/\s+/).filter(Boolean);
            return (
              <p key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 flex-shrink-0">{"\u2022"}</span>
                <span>{words.slice(0, bulletVisibles[i]).join(" ")}</span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StaticBlockText({ blocks }: { blocks: ResponseBlock[] }) {
  return (
    <div className="text-[#222222] text-base leading-6 font-['SequelSansBookBody',sans-serif] font-normal" style={{ letterSpacing: 0 }}>
      {blocks.map((block, i) => {
        if (block.type === "break") return <br key={i} />;
        return <RenderBlock key={i} block={block} visibleWords={999} />;
      })}
    </div>
  );
}

function WorkCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-stream-line">
      {[220, 220, 220, 220, 70, 70].map((h, i) => (
        <div
          key={i}
          className="rounded-xl bg-white transition-all duration-200 cursor-pointer"
          style={{
            height: h,
            border: "0.5px solid #f0f0f0",
          }}
          data-testid={`card-work-${i}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = "0.5px solid #d0d0d0";
            e.currentTarget.style.boxShadow = "0px 4px 16px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "0.5px solid #f0f0f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ))}
    </div>
  );
}

function ResumeCard() {
  return (
    <div className="mt-6 animate-stream-line">
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="block rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
        style={{ border: "0.5px solid #e8e8e8" }}
        data-testid="card-resume-preview"
      >
        <img
          src={resumeImagePath}
          alt="Chirag Chhajer's Resume"
          className="w-full h-auto"
        />
      </a>
    </div>
  );
}

function CollapsibleReasoning({
  steps,
  defaultCollapsed,
}: {
  steps: string[];
  defaultCollapsed: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expandKey, setExpandKey] = useState(0);

  const handleToggle = () => {
    if (collapsed) setExpandKey((k) => k + 1);
    setCollapsed((c) => !c);
  };

  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
      <button
        className="flex items-center gap-1.5 mb-3 cursor-pointer"
        onClick={handleToggle}
        data-testid="button-toggle-reasoning"
      >
        <BrainIcon className="w-5 h-5 text-[#a1a1a1]" strokeWidth={1.5} />
        <span className="font-['SequelSansBookBody',sans-serif] text-[#a1a1a1] text-sm leading-5">
          {steps.length} steps completed
        </span>
        {collapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-[#a1a1a1]" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-[#a1a1a1]" />
        )}
      </button>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: collapsed ? 0 : steps.length * 60,
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="space-y-1.5 mb-4 ml-1">
          {steps.map((step, i) => (
            <div
              key={`${expandKey}-${i}`}
              className="flex items-center gap-2 font-['SequelSansBookBody',sans-serif] text-sm"
              style={{
                animation: collapsed ? 'none' : `stepIn 0.3s ease both`,
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-[#e0e0e0] flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a1a1a1]" />
              </div>
              <span className="text-[#a1a1a1]">{step}</span>
            </div>
          ))}
        </div>
      </div>
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
        <span className="font-['SequelSansBookBody',sans-serif] text-[#a1a1a1] text-sm leading-5">
          Chirag's AI is thinking...
        </span>
      </div>
      <div className="space-y-1.5 mb-4 ml-1">
        {steps.slice(0, currentStep + 1).map((step, i) => {
          const isActive = i === currentStep;
          return (
            <div
              key={i}
              className="flex items-center gap-2 font-['SequelSansBookBody',sans-serif] text-sm animate-stream-line"
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

function UserBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-end" style={{ marginTop: 40 }}>
      <div
        className="bg-[#f0f0f0] max-w-[600px]"
        style={{ borderRadius: 12, padding: "8px 16px" }}
      >
        <p
          className="font-['SequelSansBookBody',sans-serif] font-normal text-[#171717] text-base leading-6"
          style={{ letterSpacing: 0 }}
          data-testid="text-user-message"
        >
          {message}
        </p>
      </div>
    </div>
  );
}

function CompletedEntry({ entry }: { entry: ConversationEntry }) {
  const steps = reasoningSteps[entry.responseType];
  const blocks = responseBlocks[entry.responseType];

  return (
    <>
      <UserBubble message={entry.userMessage} />
      <CollapsibleReasoning steps={steps} defaultCollapsed={true} />
      <StaticBlockText blocks={blocks} />
      {entry.responseType === "work" && <WorkCards />}
      {entry.responseType === "resume" && <ResumeCard />}
    </>
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
      className="font-['JetBrains_Mono',monospace] font-normal text-[#b8b8b8] text-[14px] leading-5 whitespace-nowrap uppercase"
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
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [homePhase, setHomePhase] = useState<"idle" | "filling" | "loading">("idle");
  const [activePhase, setActivePhase] = useState<ActivePhase | null>(null);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [pendingQuery, setPendingQuery] = useState("");
  const [pendingType, setPendingType] = useState<ResponseType>("work");
  const [inChatMode, setInChatMode] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [streamComplete, setStreamComplete] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const time = useLiveClock();

  const smoothScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    const content = scrollContentRef.current;
    if (!el || !content) return;
    const observer = new ResizeObserver(() => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distFromBottom < 120) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [inChatMode]);

  function handlePromptChipClick(item: (typeof navItems)[number]) {
    setInputValue(item.query);
    setPendingQuery(item.query);
    setPendingType(item.id);
    setHomePhase("filling");
  }

  useEffect(() => {
    if (homePhase === "filling") {
      const timer = setTimeout(() => setHomePhase("loading"), 600);
      return () => clearTimeout(timer);
    }
    if (homePhase === "loading") {
      const timer = setTimeout(() => {
        setInChatMode(true);
        setHomePhase("idle");
        setActivePhase("reasoning");
        setReasoningStep(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [homePhase]);

  useEffect(() => {
    if (activePhase === "loading") {
      const timer = setTimeout(() => {
        setActivePhase("reasoning");
        setReasoningStep(0);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [activePhase]);

  useEffect(() => {
    if (activePhase === "reasoning") {
      const steps = reasoningSteps[pendingType];
      if (reasoningStep < steps.length - 1) {
        const delay = 600 + Math.random() * 800;
        const timer = setTimeout(() => setReasoningStep((s) => s + 1), delay);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStreamComplete(false);
          setStreamKey((k) => k + 1);
          setActivePhase("streaming");
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [activePhase, reasoningStep, pendingType]);

  function handleManualSubmit(query: string) {
    if (!query.trim()) return;
    const responseType = getResponseType(query);
    setPendingQuery(query);
    setPendingType(responseType);
    setInputValue(query);
    setHomePhase("loading");
  }

  function handleReset() {
    setHistory([]);
    setInputValue("");
    setHomePhase("idle");
    setActivePhase(null);
    setReasoningStep(0);
    setPendingQuery("");
    setInChatMode(false);
    setStreamComplete(false);
  }

  function startNewPrompt(item: (typeof navItems)[number]) {
    const currentEntry: ConversationEntry = {
      userMessage: pendingQuery,
      responseType: pendingType,
    };
    setHistory((h) => [...h, currentEntry]);

    setPendingQuery(item.query);
    setPendingType(item.id);
    setStreamComplete(false);
    setStreamKey((k) => k + 1);
    setReasoningStep(0);
    setActivePhase("loading");
  }

  const handleStreamComplete = useCallback(() => {
    setStreamComplete(true);
    setActivePhase("done");
  }, []);

  useEffect(() => {
    smoothScrollToBottom();
  }, [activePhase, reasoningStep, streamComplete, history]);

  const allUsedTypes: ResponseType[] = [
    ...history.map((e) => e.responseType),
    ...(activePhase ? [pendingType] : []),
  ];
  const suggestedItems = navItems.filter(
    (n) => !allUsedTypes.includes(n.id)
  );

  const showLoader = homePhase === "loading";
  const isHomeScreen = !inChatMode;
  const isChatScreen = inChatMode;

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div
        className="w-full h-full relative overflow-hidden"
        style={{ border: "0.5px solid #e5e5e5" }}
      >
        {isHomeScreen ? (
          <div className="relative w-full h-full overflow-hidden">
            <div
              className="absolute inset-0 animate-gradient-drift"
              style={{
                backgroundImage: "url(/figmaAssets/image-51.png)",
                backgroundSize: "120% 120%",
                backgroundPosition: "center",
              }}
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
              style={{ gap: 0 }}
            >
              <h1
                className="font-['SequelSansBookHead',sans-serif] font-normal text-[#171717] text-center animate-entrance-1 md:whitespace-nowrap"
                style={{
                  letterSpacing: 0,
                  fontSize: "clamp(24px, 4vw, 32px)",
                  lineHeight: "clamp(32px, 5vw, 40px)",
                  marginBottom: 24,
                }}
                data-testid="text-heading"
              >
                Hello! I&apos;m Chirag&apos;s portfolio AI.
              </h1>

              <div
                className="w-full max-w-[720px] bg-white rounded-2xl transition-all duration-200 animate-entrance-2"
                style={{
                  border: `0.5px solid ${isInputHovered ? "#CCCCCC" : "#E5E5E5"}`,
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
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
                      className="flex-1 border-0 shadow-none p-0 h-auto font-['SequelSansBookBody',sans-serif] font-normal text-base leading-6 focus:outline-none bg-transparent text-[#171717] placeholder:text-[#a6a6a6]"
                      style={{ letterSpacing: 0 }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      data-testid="button-submit"
                      onClick={() => handleManualSubmit(inputValue)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${inputValue.trim() ? "bg-[#212121] hover:bg-[#333]" : "bg-[#f5f5f5] hover:bg-neutral-200"}`}
                    >
                      {showLoader ? (
                        <LoaderIcon className={`w-5 h-5 animate-spin ${inputValue.trim() ? "text-white" : "text-[#171717]"}`} />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 16.875V3.125" stroke={inputValue.trim() ? "white" : "#B3B3B3"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4.375 8.75L10 3.125L15.625 8.75" stroke={inputValue.trim() ? "white" : "#B3B3B3"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center flex-wrap justify-center animate-entrance-3"
                style={{ gap: 8, marginTop: 12 }}
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
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
              <button onClick={handleReset} data-testid="button-logo-home">
                <img
                  className="w-[86px] h-[34px]"
                  alt="Logo"
                  src="/figmaAssets/vector-22.svg"
                />
              </button>
              <AnimatedClock time={time} />
            </div>

            <div className="relative flex-1 overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }}
              />
            <div ref={scrollRef} className="h-full overflow-y-auto px-5 pb-8 pt-2">
              <div ref={scrollContentRef} className="max-w-[720px] mx-auto">
                {history.map((entry, i) => (
                  <CompletedEntry key={i} entry={entry} />
                ))}

                <UserBubble message={pendingQuery} />

                {activePhase === "loading" && (
                  <div style={{ marginTop: 20 }}>
                    <div className="flex items-center gap-2">
                      <LoaderIcon className="w-4 h-4 text-[#a1a1a1] animate-spin flex-shrink-0" />
                      <TextShimmer
                        className="font-['SequelSansBookBody',sans-serif] text-sm leading-5"
                        duration={1.6}
                        spread={3}
                      >
                        Chirag&apos;s AI is thinking...
                      </TextShimmer>
                    </div>
                  </div>
                )}

                {activePhase === "reasoning" && (
                  <ActiveReasoning
                    steps={reasoningSteps[pendingType]}
                    currentStep={reasoningStep}
                  />
                )}

                {(activePhase === "streaming" || activePhase === "done") && (
                  <>
                    <CollapsibleReasoning
                      steps={reasoningSteps[pendingType]}
                      defaultCollapsed={true}
                    />

                    <WordStreamingText
                      key={streamKey}
                      blocks={responseBlocks[pendingType]}
                      onComplete={handleStreamComplete}
                    />

                    {pendingType === "work" && streamComplete && (
                      <WorkCards />
                    )}

                    {pendingType === "resume" && streamComplete && (
                      <ResumeCard />
                    )}

                    {streamComplete && suggestedItems.length > 0 && (
                      <div className="animate-stream-line" style={{ marginTop: 40 }}>
                        <p className="font-['SequelSansBookBody',sans-serif] text-[#222222] leading-6" style={{ fontSize: 16, lineHeight: "24px" }}>
                          More Options:
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-3">
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
          </div>
        ) : null}
      </div>
    </div>
  );
};
