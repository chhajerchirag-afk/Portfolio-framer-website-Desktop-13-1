import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LoaderIcon,
  PanelLeftIcon,
  SlidersHorizontalIcon,
  CheckIcon,
} from "lucide-react";
import resumeImagePath from "@assets/Frame_153_1773004120421.png";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useIsMobile } from "@/hooks/use-mobile";

import sayHelloImg from "@assets/Image_1773518148939.png";
import uiTile1 from "@assets/image_63_1773516807733.png";

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
    { type: "paragraph", text: "\u003Cb\u003EHere\u2019s a compilation of Chirag\u2019s work.\u003C/b\u003E It includes projects from Sense, Gistr, and Nudge Lab, focusing on solving complex product problems." },
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
      <span className="font-['Inter',sans-serif] font-normal text-[#171717] text-sm leading-5 whitespace-nowrap">
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
    <div className="text-[#222222] text-base leading-6 font-['Inter',sans-serif] font-normal" style={{ letterSpacing: 0 }}>
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
        return <p><span className="font-['Inter',sans-serif] font-medium">{boldWords.slice(0, visibleWords).join(" ")}</span></p>;
      }
      const remainingWords = afterBold.split(/\s+/).filter(Boolean);
      const remainingVisible = visibleWords - boldWords.length;
      return <p><span className="font-['Inter',sans-serif] font-medium">{boldText}</span> {remainingWords.slice(0, remainingVisible).join(" ")}</p>;
    }
    return <p>{shown}</p>;
  }
  if (block.type === "heading") {
    const words = (block.text || "").split(/\s+/).filter(Boolean);
    return <p className="font-['Inter',sans-serif] font-medium">{words.slice(0, visibleWords).join(" ")}</p>;
  }
  if (block.type === "numbered-item") {
    const numPrefix = block.number ? `${block.number}. ` : "";
    const fullTitle = `${numPrefix}${block.text || ""}`;
    const titleWords = fullTitle.split(/\s+/).filter(Boolean);
    const descWords = (block.description || "").split(/\s+/).filter(Boolean);
    if (visibleWords <= titleWords.length) {
      return (
        <div className="mb-2">
          <span className="font-['Inter',sans-serif] font-medium">{titleWords.slice(0, visibleWords).join(" ")}</span>
        </div>
      );
    }
    const descVisible = visibleWords - titleWords.length;
    return (
      <div className="mb-2">
        <span className="font-['Inter',sans-serif] font-medium">{fullTitle}</span>
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
        <p className="font-['Inter',sans-serif] font-medium">
          {headerVisible >= headerWords.length ? (
            <>
              {block.text} @ {block.subtitle}
            </>
          ) : (
            headerShown
          )}
        </p>
        {headerVisible >= headerWords.length && (
          <span className="font-['Inter',sans-serif] font-normal text-[#7A7A7A] text-base whitespace-nowrap ml-4">{block.duration}</span>
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
    <div className="text-[#222222] text-base leading-6 font-['Inter',sans-serif] font-normal" style={{ letterSpacing: 0 }}>
      {blocks.map((block, i) => {
        if (block.type === "break") return <br key={i} />;
        return <RenderBlock key={i} block={block} visibleWords={999} />;
      })}
    </div>
  );
}

const menuLinks = [
  {
    label: "Reach Out",
    href: "mailto:chhajerchirag@gmail.com",
    bg: "#111111",
    iconType: "mail",
  },
  {
    label: "Say Hello!",
    href: null,
    bg: "#3d2a6e",
    iconType: "person",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/chirag-chhajer/",
    bg: "#0A66C2",
    iconType: "linkedin",
  },
];

function MenuIcon({ type }: { type: string }) {
  if (type === "mail") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
        <path d="M2 7L10 12L18 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === "person") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.5"/>
        <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === "linkedin") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
        <path d="M5.077 3C3.929 3 3 3.93 3 5.077c0 1.148.929 2.077 2.077 2.077 1.148 0 2.077-.929 2.077-2.077C7.154 3.93 6.225 3 5.077 3zM3.231 8.154h3.692V17H3.231V8.154zM11.385 8.154H7.692V17h3.693v-4.615c0-2.462 3.077-2.693 3.077 0V17H18v-5.539c0-4.923-5.538-4.769-6.615-2.307v-1z"/>
      </svg>
    );
  }
  return null;
}

function ThreeDotsMenu() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const pillRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isMobile) return;
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  const handleItemClick = (item: (typeof menuLinks)[number]) => {
    if (!item.href) return;
    window.open(item.href, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div
      ref={pillRef}
      data-testid="button-three-dots-menu"
      aria-label="Open menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => { if (isMobile) setOpen((o) => !o); }}
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: open ? 351 : 54,
        height: open ? 130 : 34,
        background: "#F5F5F5",
        borderRadius: 999,
        overflow: "hidden",
        cursor: open ? "default" : "pointer",
        transition: [
          "width 0.42s cubic-bezier(0.22,1,0.36,1)",
          "height 0.38s cubic-bezier(0.22,1,0.36,1)",
        ].join(", "),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Three dots — visible when closed */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          gap: 4,
          opacity: open ? 0 : 1,
          transition: open ? "opacity 0.08s ease" : "opacity 0.12s ease 0.18s",
          pointerEvents: "none",
        }}
      >
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#8D8D8D" }} />
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#8D8D8D" }} />
        <span className="rounded-full" style={{ width: 4, height: 4, background: "#8D8D8D" }} />
      </div>

      {/* Expanded menu content — visible when open */}
      <div
        style={{
          position: "absolute",
          opacity: open ? 1 : 0,
          transition: open ? "opacity 0.18s ease 0.18s" : "opacity 0.08s ease",
          pointerEvents: open ? "auto" : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "20px 48px 12px",
          width: 351,
        }}
      >
        <div className="flex items-start" style={{ gap: 20 }}>
          {menuLinks.map((item, i) => (
            <button
              key={i}
              data-testid={`menu-item-${i}`}
              onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
              className="flex flex-col items-center transition-all duration-200"
              style={{
                cursor: "pointer",
                width: 72,
                gap: 4,
                background: "none",
                border: "none",
                transform: "scale(1) translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (!item.href) return;
                (e.currentTarget as HTMLElement).style.transform = "scale(1.08) translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (!item.href) return;
                (e.currentTarget as HTMLElement).style.transform = "scale(1) translateY(0)";
              }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: item.iconType === "person" ? "transparent" : item.bg,
                }}
              >
                {item.iconType === "person" ? (
                  <img
                    src={sayHelloImg}
                    alt="Say Hello"
                    className="w-full h-full object-cover"
                    style={{ borderRadius: "50%" }}
                  />
                ) : (
                  <MenuIcon type={item.iconType} />
                )}
              </span>
              <span
                className="font-['Inter',sans-serif] text-center whitespace-nowrap"
                style={{ fontSize: 14, lineHeight: "20px", color: "#212121" }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
        <p
          className="font-['Inter',sans-serif] text-center"
          style={{ fontSize: 11, color: "#8D8D8D", lineHeight: "14px" }}
        >
          Made Using Vibe Coding
        </p>
      </div>
    </div>
  );
}

const caseStudies = [
  {
    id: "ai-agents-hr",
    title: "AI Agents for HR Teams",
    fullTitle: "Redefining Hiring at Scale with AI Agents",
    thumbnail: "/project1.png",
  },
  {
    id: "reimagining-ai",
    title: "Reimagining AI Experiences for Users",
    fullTitle: "Reimagining AI Experiences for Users",
    thumbnail: "/project2.png",
  },
  {
    id: "mvp-video-ai",
    title: "Establishing MVP for Video AI",
    fullTitle: "Defining MVP for Video AI",
    thumbnail: "/project3.png",
  },
  {
    id: "interview-scheduling",
    title: "Streamlining Interview Scheduling",
    fullTitle: "Streamlining Interview Scheduling",
    thumbnail: "/project4.png",
  },
];

function WorkCards({ onOpen, singleColumn, selectedId }: { onOpen?: (id: string) => void; singleColumn?: boolean; selectedId?: string | null }) {
  const chipRef = useRef<HTMLDivElement>(null);
  const [chipVisible, setChipVisible] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (chipRef.current) {
      chipRef.current.style.left = `${e.clientX}px`;
      chipRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  return (
    <>
      {/* Custom cursor chip — follows mouse, portal-style via fixed positioning */}
      <div
        ref={chipRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 99999,
          transform: chipVisible
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.72)",
          opacity: chipVisible ? 1 : 0,
          transition: "opacity 0.18s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1)",
          background: "#171717",
          color: "white",
          borderRadius: 999,
          padding: "7px 18px",
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          left: 0,
          top: 0,
        }}
      >
        View Project
      </div>

      <div className={`grid grid-cols-1 ${singleColumn ? "" : "md:grid-cols-2"} mt-6 animate-stream-line`} style={{ gap: 20 }}>
        {caseStudies.map((study, i) => {
          const isSelected = selectedId === study.id;
          const isDimmed = selectedId != null && !isSelected;
          return (
          <div
            key={i}
            data-testid={`card-work-${i}`}
            className="group flex flex-col select-none"
            onClick={() => onOpen?.(study.id)}
            style={{
              gap: 10,
              opacity: 0,
              cursor: "none",
              animation: "fadeInTile 0.45s ease forwards",
              animationDelay: `${i * 0.12}s`,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={() => setChipVisible(true)}
            onMouseLeave={() => setChipVisible(false)}
            onMouseMove={handleMouseMove}
          >
            <div
              className="relative overflow-hidden rounded-2xl flex-shrink-0"
              style={{
                width: "100%",
                maxWidth: 350,
                height: 240,
                outline: isSelected ? "2px solid #171717" : "2px solid transparent",
                outlineOffset: 2,
                transition: "outline-color 0.2s ease, opacity 0.2s ease",
                opacity: isDimmed ? 0.4 : 1,
              }}
            >
              <img
                src={study.thumbnail}
                alt={study.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06]"
                style={{ transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)" }}
                draggable={false}
              />
            </div>
            <p
              className="font-['Inter',sans-serif] text-[#222222]"
              style={{
                fontSize: 16,
                lineHeight: "24px",
              }}
            >
              {study.title}
            </p>
          </div>
        ); })}
      </div>
    </>
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
    <div style={{ marginTop: 16, marginBottom: 8 }} className="mt-[24px]">
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
        <span className="font-['Inter',sans-serif] text-[#a1a1a1] text-sm leading-5">
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
              className="flex items-center gap-2 font-['Inter',sans-serif] text-sm"
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

function UserBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-end" style={{ marginTop: 40 }}>
      <div
        className="bg-[#f0f0f0] max-w-[600px]"
        style={{ borderRadius: 12, padding: "8px 16px" }}
      >
        <p
          className="font-['Inter',sans-serif] font-normal text-[#171717] text-base leading-6"
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
      className="font-['JetBrains_Mono',monospace] font-normal text-[#b8b8b8] text-[12px] md:text-[14px] leading-5 whitespace-nowrap uppercase"
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

function AIAgentsHRContent({ view }: { view: "intense" | "overview" }) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "60px 40px 80px",
        fontFamily: "Inter, sans-serif",
        color: "#171717",
      }}
    >
      <h1
        style={{
          fontSize: 40,
          fontWeight: 700,
          lineHeight: "1.15",
          letterSpacing: "-0.02em",
          textAlign: "center",
          marginBottom: 20,
        }}
        className="font-medium text-[40px] text-center">
        Redefining Hiring at Scale with AI Agents
      </h1>
      <p
        style={{
          fontSize: 16,
          lineHeight: "1.6",
          color: "#666",
          textAlign: "center",
          maxWidth: 560,
          margin: "0 auto 48px",
        }}
      >
        Designed a Conversational AI recruiting co-pilot that automates talent engagement at every stage of the recruiting funnel.
      </p>
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #e5e5e5",
          marginBottom: 56,
          background: "#f3f3f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 32px",
        }}
      >
        <img
          src={uiTile1}
          alt="AI Agents for HR Teams UI"
          style={{ width: "100%", maxWidth: 500, borderRadius: 12, display: "block" }}
        />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>
        Context
      </h2>
      <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 16 }}>
        Sense is an AI-powered Talent Engagement platform. It's here to redefine the recruitment process by seamlessly blending personalised, omni-channel candidate experiences with enhanced recruiter efficiency.
      </p>
      <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 40 }}>
        As communication volume increased across chat, SMS, and voice, automation complexity grew. Admins struggled to configure and scale agents efficiently. AI was intended to reduce recruiter effort — instead, it increased operational overhead.
      </p>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
        What Actually Happened?
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          padding: "28px",
          background: "#F7F7F7",
          borderRadius: 14,
          marginBottom: 48,
        }}
      >
        {[
          { number: "38%", label: "Sense AI adoption stagnated at 38%" },
          { number: "62%", label: "Recruiters spent more time on manual tasks (sourcing, tracking and follow-ups)" },
          { number: "47%", label: "Hiring outcomes and momentum declined" },
        ].map((stat, i) => (
          <div key={i}>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{stat.number}</div>
            <div style={{ fontSize: 13, lineHeight: "1.5", color: "#555" }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 48 }}>
        Automation increased system capability, but decreased usability and trust, resulting in stagnating adoption and declining hiring momentum.
      </p>
      {view === "intense" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
            <div style={{ background: "#F7F7F7", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>My Role</h3>
              {["Defined end-to-end conversational journeys", "Designed conversation logic, edge cases and fallback states", "Shaped success metrics with PM + Eng"].map((r, i) => (
                <div key={i} style={{ fontSize: 14, lineHeight: "1.6", color: "#333", marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ color: "#aaa" }}>—</span> {r}
                </div>
              ))}
            </div>
            <div style={{ background: "#F7F7F7", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>Team</h3>
              {["1× Product Designer", "1× Lead Product Designer", "2× Product Manager", "4× Engineers"].map((r, i) => (
                <div key={i} style={{ fontSize: 14, lineHeight: "1.6", color: "#333", marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ color: "#aaa" }}>—</span> {r}
                </div>
              ))}
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>Problem Statement</h2>
          <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 16 }}>
            Recruiters/Admins relied on rigid, rule-based workflows that were slow to configure, difficult to maintain.
          </p>
          <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 16 }}>
            Chat and voice operated independently, lacked shared context, and required manual setup for each use case, preventing true multimodal continuity.
          </p>
          <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 40 }}>
            As complexity increased, trust and adoption decreased.
          </p>

          {[
            { label: "Pain Point 1: High Setup Effort", body: "Admins manually built long decision trees. Even minor updates required editing multiple nodes.", stats: ["64% Recruiters abandoning automation during setup", "Avg 2.4 hrs to configure one hiring campaign"] },
            { label: "Pain Point 2: Channel Silos", body: "Chat and voice were configured separately with no shared state. Conversations could not move seamlessly between modalities.", stats: ["39% missed follow-ups due to fragmented flows"] },
            { label: "Pain Point 3: Limited Scalability", body: "Automation could not scale across hiring scenarios, forcing admins to repeatedly rebuild similar journeys.", stats: [] },
          ].map((pp, i) => (
            <div key={i} style={{ background: "#F7F7F7", borderRadius: 14, padding: 24, marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{pp.label}</h3>
              <p style={{ fontSize: 14, lineHeight: "1.7", color: "#444", marginBottom: pp.stats.length ? 12 : 0 }}>{pp.body}</p>
              {pp.stats.map((s, j) => (
                <div key={j} style={{ fontSize: 13, fontWeight: 600, color: "#171717", background: "white", borderRadius: 8, padding: "6px 12px", display: "inline-block", marginRight: 8, marginTop: 4 }}>{s}</div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: 40, marginBottom: 48 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>What We Need to Learn?</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {[
                "How do recruiters mentally model hiring work?",
                "Where does trust break in AI-driven workflows?",
                "What balance of control vs autonomy drives adoption?",
              ].map((q, i) => (
                <div key={i} style={{ background: "#F7F7F7", borderRadius: 14, padding: "20px 16px", fontSize: 14, lineHeight: "1.6", color: "#333" }}>{q}</div>
              ))}
            </div>
          </div>

          <div style={{ background: "#F7F7F7", borderRadius: 14, padding: 28, marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>Core Insight</h2>
            <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 16 }}>
              The product required users to think like system designers. Recruiters think in hiring outcomes.
            </p>
            {['"Screen faster."', '"Move candidates forward."', '"Don\'t miss talent."'].map((q, i) => (
              <p key={i} style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "#171717", marginBottom: 6 }}>{q}</p>
            ))}
            <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginTop: 16 }}>That mismatch created friction.</p>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.01em" }}>Design Iterations</h2>
          {[
            { version: "V1 — Transparency First", tagline: "Precision > Momentum", hypothesis: "If we expose full control, recruiters will trust AI.", what: ["Exposed all controls", "Made decision logic visible", "Enabled deep customization"], then: "Recruiters will feel safe using AI", learning: "Over-transparency reduced momentum. AI felt like another system to manage. Trust improved. Adoption didn't." },
            { version: "V2 — Momentum First", tagline: "Momentum > Precision", hypothesis: "If we remove setup and automate by default, recruiters will experience immediate value.", what: ["Removed visible workflows", "Eliminated upfront configuration"], then: "Adoption will increase", learning: "Speed increased. But trust declined. Users experienced 'black-box anxiety.' Momentum improved. Confidence dropped." },
            { version: "V4 — Guided Autonomy", tagline: "Momentum > Complexity · Control > Blind Automation", hypothesis: null, what: [], then: null, learning: null },
          ].map((v, i) => (
            <div key={i} style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{v.tagline}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{v.version}</h3>
              {v.hypothesis && <p style={{ fontSize: 14, lineHeight: "1.6", color: "#555", marginBottom: 12 }}><strong>Hypothesis:</strong> {v.hypothesis}</p>}
              {v.what.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {v.what.map((w, j) => (
                    <div key={j} style={{ fontSize: 14, color: "#333", marginBottom: 4, display: "flex", gap: 8 }}>
                      <span style={{ color: "#aaa" }}>·</span> {w}
                    </div>
                  ))}
                </div>
              )}
              {v.learning && (
                <div style={{ background: "#F7F7F7", borderRadius: 10, padding: "12px 16px", fontSize: 14, lineHeight: "1.6", color: "#444" }}>
                  <strong>Learning:</strong> {v.learning}
                </div>
              )}
              {v.version.includes("V4") && (
                <div>
                  <p style={{ fontSize: 14, lineHeight: "1.7", color: "#333", marginBottom: 16 }}>We reframed the problem: AI shouldn't be fully controlled. AI shouldn't be fully autonomous. It should be guided.</p>
                  {[
                    { n: "#1", title: "Linear Stages Over Decision Trees", body: "Replaced complex branching logic with a simple stage-based flow: Greeting → Data Collection → Screening → Scheduling → Matching. Admins define what the agent accomplishes at each stage, not how." },
                    { n: "#2", title: "Contextual Intervention Points", body: "Added visible 'human handoff triggers' so recruiters know when and how to step in. Preserved AI momentum while giving recruiters control at critical moments." },
                    { n: "#3", title: "Reusable Module Library", body: "Built a library of pre-configured modules that admins can drag, drop, and customize. Eliminated repetitive setup work while maintaining flexibility." },
                    { n: "#4", title: "Unified Multimodal Context", body: "Created shared context across chat, SMS, and voice so conversations continue seamlessly between channels." },
                  ].map((point, j) => (
                    <div key={j} style={{ marginBottom: 16, paddingLeft: 16, borderLeft: "3px solid #E5E5E5" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.06em", marginBottom: 4 }}>{point.n}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{point.title}</div>
                      <div style={{ fontSize: 14, lineHeight: "1.7", color: "#444" }}>{point.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
      <div style={{ marginTop: 48, marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>Solution</h2>
        <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 16 }}>
          The AI Agent Builder enables admins to create goal-driven conversational agents without building decision trees. Instead of forcing recruiters to think in system logic, we let them define hiring outcomes and guide AI execution.
        </p>
        <div style={{ background: "#F7F7F7", borderRadius: 14, padding: 20, fontSize: 14, lineHeight: "1.7", color: "#333" }}>
          <strong>Example:</strong> "Create an agent to screen candidates who have already applied to open roles and assess their suitability"
          <br /><br />
          Admins define the outcome. The system orchestrates execution across reusable modules. Conversations move seamlessly across chat, SMS, and voice while preserving context.
        </div>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Achieved Goals</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          padding: "28px",
          background: "#F7F7F7",
          borderRadius: 14,
          marginBottom: 48,
        }}
      >
        {[
          { number: "75–85%", label: "Reduction in average setup time" },
          { number: "1.4×", label: "Increase in setup completion rate" },
          { number: "↓ Dependency", label: "Dependency on external support has been reduced" },
        ].map((stat, i) => (
          <div key={i}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>{stat.number}</div>
            <div style={{ fontSize: 13, lineHeight: "1.5", color: "#555" }}>{stat.label}</div>
          </div>
        ))}
      </div>
      {view === "intense" && (
        <>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>What Changed Strategically?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
            {[
              { from: "Flow-based automation", to: "Outcome-driven orchestration" },
              { from: "System-first thinking", to: "Recruiter mental-model alignment" },
            ].map((c, i) => (
              <div key={i} style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>From</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{c.from}</div>
                <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>To</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.to}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.01em" }}>What I'd Evolve Next</h2>
          {[
            { n: "#1", title: "Measuring Trust, Not Just Adoption", body: "We tracked setup completion and time savings, but didn't measure long-term trust signals like: How often do recruiters override AI decisions? Where do they intervene most? I'd design a trust dashboard to surface these patterns." },
            { n: "#2", title: "Designing for Exception Handling at Scale", body: "As automation grows, edge cases multiply. I would invest in better visibility into failure states and AI recovery patterns." },
            { n: "#3", title: "Making Autonomy Configurable by Maturity Level", body: "Different customers require different levels of control. Future iterations should adapt autonomy dynamically based on user confidence and usage patterns." },
          ].map((point, i) => (
            <div key={i} style={{ marginBottom: 16, paddingLeft: 16, borderLeft: "3px solid #e5e5e5" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.06em", marginBottom: 4 }}>{point.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{point.title}</div>
              <div style={{ fontSize: 14, lineHeight: "1.7", color: "#444" }}>{point.body}</div>
            </div>
          ))}

          <div style={{ background: "#F7F7F7", borderRadius: 14, padding: 28, marginTop: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>Closing Reflection</h2>
            <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333", marginBottom: 12 }}>
              The core challenge wasn't building better automation. It was designing the right balance between AI autonomy and human control in a high-stakes domain.
            </p>
            <p style={{ fontSize: 15, lineHeight: "1.7", color: "#333" }}>
              The breakthrough came when we stopped optimizing workflows and started designing for recruiter cognition.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CaseStudyPlaceholder({ title }: { title: string }) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 40px",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>{title}</h1>
      <p style={{ fontSize: 15, color: "#888", lineHeight: "1.6" }}>Full case study coming soon.</p>
    </div>
  );
}

function CaseStudyBrowser({
  studyId,
  fullscreen,
  onToggleFullscreen,
  view,
  onViewChange,
  onNavigate,
}: {
  studyId: string;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  view: "intense" | "overview";
  onViewChange: (v: "intense" | "overview") => void;
  onNavigate: (id: string) => void;
}) {
  const [urlOpen, setUrlOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const urlRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const study = caseStudies.find((s) => s.id === studyId)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (urlRef.current && !urlRef.current.contains(e.target as Node)) setUrlOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "white",
        borderRadius: 16,
        border: "0.5px solid #E5E5E5",
        overflow: "hidden",
        marginRight: fullscreen ? 8 : 0,
      }}
    >
      {/* Browser header */}
      <div
        style={{
          height: 40,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: "0.5px solid #E5E5E5",
          background: "white",
          gap: 12,
        }}
      >
        {/* Left: toggle sidebar */}
        <button
          onClick={onToggleFullscreen}
          data-testid="button-case-study-panel-toggle"
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#888",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <PanelLeftIcon size={16} />
        </button>

        {/* Center: URL pill */}
        <div ref={urlRef} style={{ position: "relative", flex: 1, display: "flex", justifyContent: "center" }}>
          <button
            data-testid="button-case-study-url"
            onClick={() => { setUrlOpen((o) => !o); setViewOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 14px",
              borderRadius: 999,
              border: "0.5px solid #E0E0E0",
              background: urlOpen ? "#F5F5F5" : "transparent",
              cursor: "pointer",
              fontSize: 12,
              color: "#555",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
              maxWidth: 420,
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!urlOpen) (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
            onMouseLeave={(e) => { if (!urlOpen) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ color: "#999", fontWeight: 500 }}>chirag.design</span>
            <span style={{ color: "#ccc" }}>/</span>
            <span style={{ color: "#bbb" }}>work</span>
            <span style={{ color: "#ccc" }}>/</span>
            <span style={{ color: "#444", fontWeight: 500 }}>{study.fullTitle}</span>
          </button>

          {urlOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                border: "0.5px solid #E5E5E5",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                minWidth: 300,
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {caseStudies.map((s) => (
                <button
                  key={s.id}
                  data-testid={`button-nav-study-${s.id}`}
                  onClick={() => {
                    onNavigate(s.id);
                    setUrlOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    color: s.id === studyId ? "#171717" : "#555",
                    fontWeight: s.id === studyId ? 600 : 400,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F7F7F7"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {s.fullTitle}
                  {s.id === studyId && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#171717", flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: view toggle */}
        <div ref={viewRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            data-testid="button-case-study-view-toggle"
            onClick={() => { setViewOpen((o) => !o); setUrlOpen(false); }}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "none",
              background: viewOpen ? "#F5F5F5" : "transparent",
              cursor: "pointer",
              color: "#888",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!viewOpen) (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; }}
            onMouseLeave={(e) => { if (!viewOpen) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <SlidersHorizontalIcon size={15} />
          </button>

          {viewOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "white",
                border: "0.5px solid #E5E5E5",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                minWidth: 180,
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {([
                { id: "intense", label: "Intense Mode" },
                { id: "overview", label: "Overview Mode" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  data-testid={`button-view-mode-${opt.id}`}
                  onClick={() => {
                    onViewChange(opt.id);
                    setViewOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    color: opt.id === view ? "#171717" : "#555",
                    fontWeight: opt.id === view ? 600 : 400,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F7F7F7"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {opt.label}
                  {opt.id === view && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#171717", flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#F2F3F4",
        }}
        className="hide-scrollbar"
      >
        {studyId === "ai-agents-hr" ? (
          <AIAgentsHRContent view={view} />
        ) : (
          <CaseStudyPlaceholder title={study.fullTitle} />
        )}
      </div>
    </div>
  );
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
  const [activeCaseStudy, setActiveCaseStudy] = useState<string | null>(null);
  const [caseStudyFullscreen, setCaseStudyFullscreen] = useState(false);
  const [caseStudyView, setCaseStudyView] = useState<"intense" | "overview">("intense");
  const sessionId = useRef(Math.random().toString(36).slice(2, 18));
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
    setActiveCaseStudy(null);
    setCaseStudyFullscreen(false);
    setCaseStudyView("intense");
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <ThreeDotsMenu />
            </div>
            <div className="absolute top-4 right-5 z-10">
              <AnimatedClock time={time} />
            </div>

            <div
              className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full px-5 overflow-y-auto hide-scrollbar py-16"
              style={{ gap: 0 }}
            >
              <h1
                className="font-['Inter',sans-serif] font-normal text-[#171717] text-center animate-entrance-1 md:whitespace-nowrap"
                style={{
                  letterSpacing: "-0.01em",
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
                      className="flex-1 border-0 shadow-none p-0 h-auto font-['Inter',sans-serif] font-normal text-base leading-6 focus:outline-none bg-transparent text-[#171717] placeholder:text-[#a6a6a6]"
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
          activeCaseStudy && caseStudyFullscreen ? (
            /* ── Full-screen case study ── */
            (<div className="relative w-full h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
                <button onClick={handleReset} data-testid="button-logo-home">
                  <img className="w-[86px] h-[34px]" alt="Logo" src="/figmaAssets/vector-22.svg" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-4"><ThreeDotsMenu /></div>
                <AnimatedClock time={time} />
              </div>
              <div className="flex-1 overflow-hidden" style={{ padding: "0 8px 8px" }}>
                <CaseStudyBrowser
                  studyId={activeCaseStudy}
                  fullscreen={true}
                  onToggleFullscreen={() => setCaseStudyFullscreen(false)}
                  view={caseStudyView}
                  onViewChange={setCaseStudyView}
                  onNavigate={setActiveCaseStudy}
                />
              </div>
            </div>)
          ) : activeCaseStudy ? (
            /* ── Split view: 30% chat + 70% browser ── */
            (<div className="relative w-full h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
                <button onClick={handleReset} data-testid="button-logo-home">
                  <img className="w-[86px] h-[34px]" alt="Logo" src="/figmaAssets/vector-22.svg" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-4"><ThreeDotsMenu /></div>
                <AnimatedClock time={time} />
              </div>
              <div
                className="flex-1 overflow-hidden"
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 7fr",
                  paddingLeft: 40,
                  paddingRight: 0,
                  gap: 40,
                  paddingBottom: 8,
                }}
              >
                {/* Left: conversation panel */}
                <div className="h-full overflow-y-auto hide-scrollbar" style={{ paddingTop: 4 }}>
                  <p style={{ fontSize: 11, color: "#D0D0D0", fontFamily: "monospace", marginBottom: 20, letterSpacing: "0.04em" }}>
                    {sessionId.current}
                  </p>
                  {history.map((entry, i) => (
                    <CompletedEntry key={i} entry={entry} />
                  ))}
                  {pendingQuery && <UserBubble message={pendingQuery} />}
                  {activePhase === "reasoning" && (
                    <ActiveReasoning steps={reasoningSteps[pendingType]} currentStep={reasoningStep} />
                  )}
                  {(activePhase === "streaming" || activePhase === "done") && (
                    <>
                      <CollapsibleReasoning steps={reasoningSteps[pendingType]} defaultCollapsed={true} />
                      <WordStreamingText key={streamKey} blocks={responseBlocks[pendingType]} onComplete={handleStreamComplete} />
                      {pendingType === "work" && streamComplete && (
                        <WorkCards singleColumn selectedId={activeCaseStudy} onOpen={(id) => { setActiveCaseStudy(id); setCaseStudyFullscreen(false); }} />
                      )}
                      {pendingType === "resume" && streamComplete && <ResumeCard />}
                    </>
                  )}
                </div>
                {/* Right: browser panel */}
                <CaseStudyBrowser
                  studyId={activeCaseStudy}
                  fullscreen={false}
                  onToggleFullscreen={() => setCaseStudyFullscreen(true)}
                  view={caseStudyView}
                  onViewChange={setCaseStudyView}
                  onNavigate={setActiveCaseStudy}
                />
              </div>
            </div>)
          ) : (
            /* ── Normal chat view ── */
            (<div className="relative w-full h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
                <button onClick={handleReset} data-testid="button-logo-home">
                  <img className="w-[86px] h-[34px]" alt="Logo" src="/figmaAssets/vector-22.svg" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-4"><ThreeDotsMenu /></div>
                <AnimatedClock time={time} />
              </div>
              <div className="relative flex-1 overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }}
                />
                <div
                  ref={scrollRef}
                  className="h-full overflow-y-auto pb-8 pt-2 hide-scrollbar"
                  style={{
                    width: "100%",
                    maxWidth: "min(720px, calc(100% - 40px))",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <div ref={scrollContentRef}>
                    {history.map((entry, i) => (
                      <CompletedEntry key={i} entry={entry} />
                    ))}

                    <UserBubble message={pendingQuery} />

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
                          <WorkCards onOpen={(id) => { setActiveCaseStudy(id); setCaseStudyFullscreen(false); }} />
                        )}

                        {pendingType === "resume" && streamComplete && (
                          <ResumeCard />
                        )}

                        {streamComplete && suggestedItems.length > 0 && (
                          <div className="animate-stream-line" style={{ marginTop: 40 }}>
                            <p className="font-['Inter',sans-serif] text-[#222222] leading-6" style={{ fontSize: 16, lineHeight: "24px" }}>
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
            </div>)
          )
        ) : null}
      </div>
    </div>
  );
};
