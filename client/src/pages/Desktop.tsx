import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  LoaderIcon,
  PanelLeftIcon,
  GlobeIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  XIcon,
  FileTextIcon,
} from "lucide-react";
import resumeImagePath from "@assets/Frame_153_1773004120421.png";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useIsMobile } from "@/hooks/use-mobile";

import sayHelloImg from "@assets/Image_1773518148939.png";
import uiTile1 from "@assets/image_63_1773516807733.png";
import { fireConfettiFromElement } from "@/components/ui/confetti";

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
  type:
    | "paragraph"
    | "heading"
    | "numbered-item"
    | "bullet"
    | "break"
    | "experience-role";
  text?: string;
  number?: number;
  subtitle?: string;
  description?: string;
  highlight?: string;
  duration?: string;
  bullets?: string[];
  focusLabel?: string;
  isNow?: boolean;
}

const responseBlocks: Record<ResponseType, ResponseBlock[]> = {
  work: [
    {
      type: "paragraph",
      text: "\u003Cb\u003EHere\u2019s a compilation of Chirag\u2019s work.\u003C/b\u003E It includes projects from Sense, Gistr, and Nudge Lab, focusing on solving complex product problems.",
    },
  ],
  about: [
    {
      type: "paragraph",
      text: "Chirag is a <b>Product Designer with 3+ years</b> of experience \u2014 started back in the Adobe XD days and has been obsessing over how products think ever since. He works at the intersection of user experience, product strategy, and business impact.",
    },
    { type: "break" },
    {
      type: "paragraph",
      text: 'He\u2019s shipped across <b>AI-driven products</b>, talent engagement platforms, learning tools, legal platforms, and cybersecurity products at <a href="https://www.sensehq.com/" target="_blank" rel="noopener noreferrer">Sense HQ</a>, <a href="https://gistr.so/" target="_blank" rel="noopener noreferrer">Gistr</a>, and <a href="https://nudgelab.co/" target="_blank" rel="noopener noreferrer">Nudge Lab</a>. Nine months into his current role, he was named \u2b50 <b>Star Product Designer</b> \u2014 not for making things pretty, but for making things matter.',
    },
    { type: "break" },
    {
      type: "paragraph",
      text: "Outside work, he\u2019s a cat parent \uD83D\uDC31 navigating the daily chaos of a creature who has zero respect for my Figma \uD83E\uDD23 deadlines. He cooks to experiment \uD83E\uDDD1\u200D\uD83C\uDF73, swims to reset \uD83C\uDFCA, and somehow both feel a lot like design.",
    },
  ],
  experience: [
    {
      type: "heading",
      text: "Here\u2019s Chirag\u2019s career progression so far.",
    },
    { type: "break" },
    {
      type: "experience-role",
      text: "Product Designer",
      subtitle: "Sense",
      duration: "2025",
      highlight: "Sense",
      isNow: true,
      description:
        "Owns end-to-end design for a flagship AI feature \u2014 enabling recruiters to build conversational chatbots and voice flows using AI agents. His focus is on making complex technical systems feel simple and intuitive for enterprise hiring teams. Awarded Star Product Designer of the Year (2025) for his impact on product outcomes and design quality.",
      bullets: [],
      focusLabel: "",
    },
    {
      type: "experience-role",
      text: "Product Designer",
      subtitle: "Nudge Lab",
      duration: "2023 \u2013 2025",
      highlight: "Nudge Lab",
      description:
        "Led design across 5+ products at this product design studio \u2014 improving onboarding, activation, and conversion through iterative design and testing. Designed AI-powered workflows across legal, cybersecurity, and hiring domains. Built and scaled design systems across 100+ screens.",
      bullets: [],
      focusLabel: "",
    },
    {
      type: "experience-role",
      text: "UX Designer",
      subtitle: "Dank",
      duration: "2023",
      highlight: "Dank",
      description:
        "His first step into product design \u2014 a social media app for students. Worked on onboarding, messaging, homepage, and settings, and established the product\u2019s first scalable design system.",
      bullets: [],
      focusLabel: "",
    },
    {
      type: "experience-role",
      text: "Graphic Designer",
      subtitle: "GreyToYellow",
      duration: "2021 \u2013 2022",
      highlight: "GreyToYellow",
      description:
        "The origin story. Designed digital and print campaigns at a marketing agency \u2014 where he learned how visual storytelling and communication shape the way people perceive a product.",
      bullets: [],
      focusLabel: "",
    },
  ],
  resume: [
    {
      type: "paragraph",
      text: "Here you go \u2014 Chirag\u2019s resume is ready for view and download.",
    },
  ],
  "out-of-scope": [
    {
      type: "paragraph",
      text: "\u003Cb\u003ESorry! That request is currently out of scope.\u003C/b\u003E",
    },
    { type: "break" },
    {
      type: "paragraph",
      text: "Chirag believes in phase-by-phase development, and this feature didn\u2019t make it into the initial PRD \uD83D\uDE05.",
    },
    { type: "break" },
    {
      type: "paragraph",
      text: "For now, this AI can help you with a few things:",
    },
    { type: "bullet", text: "Learn about Chirag" },
    { type: "bullet", text: "Explore his work" },
    { type: "bullet", text: "See his experience" },
    { type: "bullet", text: "Download his resume" },
    { type: "break" },
    {
      type: "paragraph",
      text: "Try one of those prompts \u2014 they\u2019re fully shipped. \uD83D\uDE80",
    },
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
  const allWords = useRef<
    { word: string; blockIdx: number; wordIdx: number; isFirst: boolean }[]
  >([]);
  const [wordCount, setWordCount] = useState(0);
  const completedRef = useRef(false);

  if (allWords.current.length === 0) {
    const words: typeof allWords.current = [];
    blocks.forEach((block, bIdx) => {
      if (block.type === "break") {
        words.push({
          word: "__BREAK__",
          blockIdx: bIdx,
          wordIdx: 0,
          isFirst: true,
        });
        return;
      }
      const textContent = getBlockPlainText(block);
      const blockWords = textContent.split(/\s+/).filter(Boolean);
      blockWords.forEach((w, wIdx) => {
        words.push({
          word: w,
          blockIdx: bIdx,
          wordIdx: wIdx,
          isFirst: wIdx === 0,
        });
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
      visibleWordsByBlock.set(
        w.blockIdx,
        (visibleWordsByBlock.get(w.blockIdx) || 0) + 1,
      );
    }
  }

  return (
    <div
      className="text-[#222222] text-base leading-6 font-['Inter',sans-serif] font-normal"
      style={{ letterSpacing: 0 }}
    >
      {blocks.map((block, bIdx) => {
        if (!reachedBlocks.has(bIdx)) return null;
        const visibleWords = visibleWordsByBlock.get(bIdx) || 0;
        if (block.type === "break") return <br key={bIdx} />;
        return (
          <RenderBlock key={bIdx} block={block} visibleWords={visibleWords} />
        );
      })}
    </div>
  );
}

function getBlockPlainText(block: ResponseBlock): string {
  if (block.type === "break") return "";
  if (block.type === "paragraph" || block.type === "heading")
    return stripHtml(block.text || "");
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

function RenderBlock({
  block,
  visibleWords,
}: {
  block: ResponseBlock;
  visibleWords: number;
}) {
  if (block.type === "paragraph") {
    const raw = block.text || "";
    const hasLinks = raw.includes("<a ");
    const hasBold = raw.includes("<b>");
    const plainWords = stripHtml(raw).split(/\s+/).filter(Boolean);
    const totalWords = plainWords.length;

    if ((hasLinks || hasBold) && visibleWords >= totalWords) {
      return (
        <p
          dangerouslySetInnerHTML={{ __html: raw }}
          className="[&_a]:underline [&_a]:text-[#222222] [&_a]:decoration-[#222222] [&_b]:font-medium [&_b]:font-['Inter',sans-serif]"
        />
      );
    }

    const shown = plainWords.slice(0, visibleWords).join(" ");
    if (hasBold && !hasLinks) {
      const boldMatch = raw.match(/<b>(.*?)<\/b>/);
      const boldText = boldMatch ? boldMatch[1] : "";
      const afterBold = raw.replace(/<b>.*?<\/b>\s*/, "");
      const boldWords = boldText.split(/\s+/).filter(Boolean);
      if (visibleWords <= boldWords.length) {
        return (
          <p>
            <span className="font-['Inter',sans-serif] font-medium">
              {boldWords.slice(0, visibleWords).join(" ")}
            </span>
          </p>
        );
      }
      const remainingWords = afterBold.split(/\s+/).filter(Boolean);
      const remainingVisible = visibleWords - boldWords.length;
      return (
        <p>
          <span className="font-['Inter',sans-serif] font-medium">
            {boldText}
          </span>{" "}
          {remainingWords.slice(0, remainingVisible).join(" ")}
        </p>
      );
    }
    return <p>{shown}</p>;
  }
  if (block.type === "heading") {
    const words = (block.text || "").split(/\s+/).filter(Boolean);
    return (
      <p className="font-['Inter',sans-serif] font-medium">
        {words.slice(0, visibleWords).join(" ")}
      </p>
    );
  }
  if (block.type === "numbered-item") {
    const numPrefix = block.number ? `${block.number}. ` : "";
    const fullTitle = `${numPrefix}${block.text || ""}`;
    const titleWords = fullTitle.split(/\s+/).filter(Boolean);
    const descWords = (block.description || "").split(/\s+/).filter(Boolean);
    if (visibleWords <= titleWords.length) {
      return (
        <div className="mb-2">
          <span className="font-['Inter',sans-serif] font-medium">
            {titleWords.slice(0, visibleWords).join(" ")}
          </span>
        </div>
      );
    }
    const descVisible = visibleWords - titleWords.length;
    return (
      <div className="mb-2">
        <span className="font-['Inter',sans-serif] font-medium">
          {fullTitle}
        </span>
        {descWords.length > 0 && <br />}
        {descWords.slice(0, descVisible).join(" ")}
      </div>
    );
  }
  if (block.type === "bullet") {
    const words = (block.text || "").split(/\s+/).filter(Boolean);
    return (
      <p className="ml-4">
        {"\u2022 "}
        {words.slice(0, visibleWords).join(" ")}
      </p>
    );
  }
  if (block.type === "experience-role") {
    return <ExperienceRoleBlock block={block} visibleWords={visibleWords} />;
  }
  return null;
}

const aboutPhotos = [
  {
    src: "/About/1st.jpg",
    alt: "Star Product Designer Award at Sense",
    rotate: "-3deg",
    flex: "1.8 1 0",
    heightPct: "72%",
    zIndex: 1,
  },
  {
    src: "/About/2nd.jpg",
    alt: "Chirag portrait",
    rotate: "2deg",
    flex: "1 1 0",
    heightPct: "100%",
    zIndex: 2,
  },
  {
    src: "/About/3rd.jpg",
    alt: "Cat",
    rotate: "-1.5deg",
    flex: "1 1 0",
    heightPct: "78%",
    zIndex: 5,
  },
  {
    src: "/About/4th.jpg",
    alt: "Landscape",
    rotate: "2.5deg",
    flex: "1 1 0",
    heightPct: "88%",
    zIndex: 3,
  },
];

function AboutImages() {
  return (
    <div className="animate-stream-line" style={{ marginTop: 24 }}>
      <div className="mx-auto w-full md:max-w-[calc(100%-120px)]">
        <div className="flex items-end" style={{ width: "100%", height: 180 }}>
          {aboutPhotos.map((photo, i) => (
            <div
              key={i}
              className="group"
              style={{
                transform: `rotate(${photo.rotate})`,
                flex: photo.flex,
                minWidth: 0,
                height: photo.heightPct,
                marginLeft: i === 0 ? 0 : -20,
                position: "relative",
                zIndex: photo.zIndex,
              }}
            >
              {/* Masking wrapper — clips the zoomed image cleanly */}
              <div
                className="rounded-[8px] md:rounded-[12px] transition-transform duration-200 ease-out md:group-hover:-translate-y-[5px] md:group-hover:scale-[1.03]"
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  border: "3px solid #ffffff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transform: "scale(1.08)",
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const experienceIconMap: Record<string, string> = {
  Sense: "/experience/sense.svg",
  "Nudge Lab": "/experience/nudge-lab.svg",
  Dank: "/experience/dank.svg",
  GreyToYellow: "/experience/greytoyellow.svg",
};

function ExperienceRoleBlock({
  block,
  visibleWords,
}: {
  block: ResponseBlock;
  visibleWords: number;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const nameWords = (block.subtitle || "").split(/\s+/).filter(Boolean);
  const isFullyShown = visibleWords >= nameWords.length;
  const nameShown = nameWords.slice(0, visibleWords).join(" ");
  const iconSrc = experienceIconMap[block.subtitle || ""] || "";

  return (
    <div
      className="mb-7 cursor-pointer select-none"
      onClick={() => isFullyShown && setOpen((o) => !o)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between min-h-[48px]">
        <div className="flex items-center gap-4">
          {iconSrc && isFullyShown && (
            <img
              src={iconSrc}
              alt={block.subtitle}
              style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
            />
          )}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "#14191F",
              }}
            >
              {nameShown}
            </span>
            {isFullyShown && block.isNow && (
              <div className="flex items-center gap-1.5">
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#008BF9",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 400,
                    fontSize: 16,
                    color: "#008BF9",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Now
                </span>
              </div>
            )}
          </div>
        </div>

        {isFullyShown && (
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 400,
                fontSize: 16,
                color: "#7A7A7A",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {block.text}
              <span style={{ margin: "0 6px", color: "#E0E0E0" }}>·</span>
              {block.duration}
            </span>
            <div
              style={{
                opacity: open || hovered ? 1 : 0,
                transition: "opacity 0.15s ease",
              }}
            >
              {open ? (
                <ChevronUpIcon size={16} color="#7A7A7A" />
              ) : (
                <ChevronDownIcon size={16} color="#7A7A7A" />
              )}
            </div>
          </div>
        )}
      </div>

      {open && isFullyShown && block.description && (
        <div style={{ paddingLeft: 64, paddingTop: 12 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: "#424242",
              lineHeight: "24px",
            }}
          >
            {block.description}
          </p>
        </div>
      )}
    </div>
  );
}

function StaticBlockText({ blocks }: { blocks: ResponseBlock[] }) {
  return (
    <div
      className="text-[#222222] text-base leading-6 font-['Inter',sans-serif] font-normal"
      style={{ letterSpacing: 0 }}
    >
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
    label: "Resume",
    href: "https://drive.google.com/file/d/10DmAeSzyfSMQe6tcE00KUpwWLp_69YFN/view?usp=sharing",
    bg: "#111111",
    iconType: "resume",
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
        <path
          d="M2 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Z"
          fill="white"
        />
        <path
          d="M2 6.5l8 5.5 8-5.5"
          stroke="#111111"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  if (type === "person") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3.5" stroke="white" strokeWidth="1.5" />
        <path
          d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === "resume") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="1.5" fill="white" />
        <path
          d="M7 7h6M7 10h6M7 13h4"
          stroke="#111111"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === "linkedin") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
        <path d="M5.077 3C3.929 3 3 3.93 3 5.077c0 1.148.929 2.077 2.077 2.077 1.148 0 2.077-.929 2.077-2.077C7.154 3.93 6.225 3 5.077 3zM3.231 8.154h3.692V17H3.231V8.154zM11.385 8.154H7.692V17h3.693v-4.615c0-2.462 3.077-2.693 3.077 0V17H18v-5.539c0-4.923-5.538-4.769-6.615-2.307v-1z" />
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

  const handleItemClick = (
    item: (typeof menuLinks)[number],
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (item.iconType === "person") {
      fireConfettiFromElement(e.currentTarget);
      return;
    }
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
      onClick={() => {
        if (isMobile) setOpen((o) => !o);
      }}
      style={{
        position: "fixed",
        top: isMobile ? "auto" : 4,
        bottom: isMobile ? 16 : "auto",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: open ? 351 : 54,
        height: open ? 130 : 34,
        background: "#F5F5F5",
        borderRadius: 999,
        border: "1px solid #DEDEDE",
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
        <span
          className="rounded-full"
          style={{ width: 4, height: 4, background: "#8D8D8D" }}
        />
        <span
          className="rounded-full"
          style={{ width: 4, height: 4, background: "#8D8D8D" }}
        />
        <span
          className="rounded-full"
          style={{ width: 4, height: 4, background: "#8D8D8D" }}
        />
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
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item, e);
              }}
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
                (e.currentTarget as HTMLElement).style.transform =
                  "scale(1.08) translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "scale(1) translateY(0)";
              }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: item.bg,
                }}
              >
                <MenuIcon type={item.iconType} />
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

function WorkCards({
  onOpen,
  singleColumn,
  selectedId,
}: {
  onOpen?: (id: string) => void;
  singleColumn?: boolean;
  selectedId?: string | null;
}) {
  const chipRef = useRef<HTMLDivElement>(null);
  const [chipVisible, setChipVisible] = useState(false);
  const [tappedId, setTappedId] = useState<string | null>(null);
  const isTouchDevice = useRef(
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches,
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (chipRef.current) {
      chipRef.current.style.left = `${e.clientX}px`;
      chipRef.current.style.top = `${e.clientY}px`;
    }
  }, []);

  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const handleTouchStart = useCallback((id: string, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    setTappedId(id);
  }, []);

  const handleTouchEnd = useCallback(
    (id: string, e: React.TouchEvent) => {
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
      setTimeout(() => setTappedId(null), 300);
      if (dy < 10 && dx < 10) {
        onOpen?.(id);
      }
    },
    [onOpen],
  );

  return (
    <>
      {/* Custom cursor chip — desktop hover only, hidden on touch devices */}
      {!isTouchDevice.current && (
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
            transition:
              "opacity 0.18s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1)",
            background: "#171717",
            color: "white",
            borderRadius: 999,
            padding: "7px 18px",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            left: "-200px",
            top: "-200px",
          }}
        >
          View Project
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${singleColumn ? "" : "md:grid-cols-2"} mt-6 animate-stream-line`}
        style={{ gap: 20 }}
      >
        {caseStudies.map((study, i) => {
          const isSelected = selectedId === study.id;
          const isTapped = tappedId === study.id;
          const isTouch = isTouchDevice.current;
          return (
            <div
              key={i}
              data-testid={`card-work-${i}`}
              className="group flex flex-col select-none"
              onClick={isTouch ? undefined : () => onOpen?.(study.id)}
              onTouchStart={
                isTouch ? (e) => handleTouchStart(study.id, e) : undefined
              }
              onTouchEnd={
                isTouch ? (e) => handleTouchEnd(study.id, e) : undefined
              }
              style={{
                gap: 10,
                opacity: 0,
                cursor: isTouch ? "pointer" : "none",
                animation: "fadeInTile 0.45s ease forwards",
                animationDelay: `${i * 0.12}s`,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={isTouch ? undefined : () => setChipVisible(true)}
              onMouseLeave={isTouch ? undefined : () => setChipVisible(false)}
              onMouseMove={isTouch ? undefined : handleMouseMove}
            >
              <div
                className="relative overflow-hidden rounded-2xl flex-shrink-0"
                style={{
                  width: "100%",
                  aspectRatio: "350 / 240",
                  outline: isSelected
                    ? "2px solid #171717"
                    : "2px solid transparent",
                  outlineOffset: 2,
                  transition: "outline-color 0.2s ease, opacity 0.2s ease",
                  opacity: 1,
                }}
              >
                <img
                  src={study.thumbnail}
                  alt={study.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  draggable={false}
                />
                {/* Mobile tap feedback label */}
                {isTouch && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.18)",
                      opacity: isTapped ? 1 : 0,
                      transition: "opacity 0.15s ease",
                      borderRadius: "inherit",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        background: "#171717",
                        color: "white",
                        borderRadius: 999,
                        padding: "7px 18px",
                        fontSize: 13,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      View Project
                    </span>
                  </div>
                )}
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
          );
        })}
      </div>
    </>
  );
}

function ResumeCard() {
  return (
    <div className="mt-6 animate-stream-line">
      <a
        href="https://drive.google.com/file/d/10DmAeSzyfSMQe6tcE00KUpwWLp_69YFN/view?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
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
                animation: collapsed ? "none" : `stepIn 0.3s ease both`,
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

function CompletedEntry({
  entry,
  onOpen,
  selectedId,
  singleColumn,
}: {
  entry: ConversationEntry;
  onOpen?: (id: string) => void;
  selectedId?: string | null;
  singleColumn?: boolean;
}) {
  const steps = reasoningSteps[entry.responseType];
  const blocks = responseBlocks[entry.responseType];

  return (
    <>
      <UserBubble message={entry.userMessage} />
      <CollapsibleReasoning steps={steps} defaultCollapsed={true} />
      <StaticBlockText blocks={blocks} />
      {entry.responseType === "work" && (
        <WorkCards
          onOpen={onOpen}
          selectedId={selectedId}
          singleColumn={singleColumn}
        />
      )}
      {entry.responseType === "resume" && <ResumeCard />}
      {entry.responseType === "about" && <AboutImages />}
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

function ClockOrRestart({ time, onRestart, inChatMode = false }: { time: string; onRestart: () => void; inChatMode?: boolean }) {
  const isMobile = useIsMobile();
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    if (isMobile && inChatMode) {
      const t = setTimeout(() => setShowRestart(true), 50);
      return () => clearTimeout(t);
    } else {
      setShowRestart(false);
    }
  }, [isMobile, inChatMode]);

  if (isMobile && inChatMode) {
    return (
      <button
        onClick={onRestart}
        data-testid="button-restart-chat"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "#b8b8b8",
          letterSpacing: "-0.02em",
          padding: 0,
          textTransform: "uppercase",
          opacity: showRestart ? 1 : 0,
          transform: showRestart ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        Restart Chat
      </button>
    );
  }
  return <AnimatedClock time={time} />;
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
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
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
  const isMobile = useIsMobile();
  const inner: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    paddingLeft: 20,
    paddingRight: 20,
  };
  const section = (bg: string, py = 56): React.CSSProperties => ({
    width: "100%",
    background: bg,
    padding: `${py}px 0`,
  });

  const vimeoContainerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<any>(null);
  const v1VideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = v1VideoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    function initPlayer() {
      const iframe = vimeoContainerRef.current?.querySelector("iframe");
      if (!iframe || !(window as any).Vimeo) return;

      const player = new (window as any).Vimeo.Player(iframe);
      vimeoPlayerRef.current = player;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!vimeoPlayerRef.current) return;
            if (entry.isIntersecting) {
              vimeoPlayerRef.current.play().catch(() => {});
            } else {
              vimeoPlayerRef.current.pause().catch(() => {});
            }
          });
        },
        { threshold: 0.25 },
      );

      if (vimeoContainerRef.current) {
        observer.observe(vimeoContainerRef.current);
      }
    }

    if ((window as any).Vimeo) {
      initPlayer();
    } else {
      const existing = document.querySelector(
        'script[src="https://player.vimeo.com/api/player.js"]',
      );
      if (existing) {
        existing.addEventListener("load", initPlayer);
      } else {
        const script = document.createElement("script");
        script.src = "https://player.vimeo.com/api/player.js";
        script.onload = initPlayer;
        document.head.appendChild(script);
      }
    }

    return () => {
      observer?.disconnect();
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.destroy().catch(() => {});
        vimeoPlayerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "Inter, sans-serif",
        color: "#14191F",
      }}
    >
      {/* ── Hero ── */}
      <div style={section("#F6F6F7", 60)}>
        <div style={inner}>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 500,
              lineHeight: "50px",
              letterSpacing: "-0.02em",
              marginBottom: 16,
              color: "#14191F",
            }}
          >
            Redefining hiring at scale{!isMobile && <br />}with AI Agents
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: "24px",
              color: "#14191F",
              marginBottom: 40,
            }}
          >
            Designed a Conversational AI recruiting co-pilot that automates
            {!isMobile && <br />}talent engagement at every stage of the
            recruiting funnel.
          </p>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundImage: "url('/project-1/hero-proj-1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "20px",
            }}
          >
            <img
              src="/project-1/cover.gif"
              alt="AI Agents for HR Teams UI"
              style={{ width: "100%", borderRadius: 10, display: "block" }}
            />
          </div>
        </div>
      </div>

      {/* ── Context ── */}
      <div style={section("#F6F6F7", 0)}>
        <div style={inner}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 14,
              color: "#14191F",
            }}
          >
            Context
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              color: "#14191F",
              marginBottom: 14,
            }}
          >
            Sense is an AI-powered Talent Engagement platform. It's here to
            redefine the recruitment process by seamlessly blending
            personalised, omni-channel candidate experiences with enhanced
            recruiter efficiency.
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              color: "#14191F",
              marginBottom: 40,
            }}
          >
            As communication volume increased across chat, SMS, and voice,
            automation complexity grew. Admins struggled to configure and scale
            agents efficiently. AI was intended to reduce recruiter effort —
            instead, it increased operational overhead.
          </p>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 20,
              color: "#14191F",
            }}
          >
            What Actually Happened?
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ gap: 12, marginBottom: 24 }}
          >
            {[
              {
                number: "38%",
                arrow: "↓",
                label: "Sense AI adoption stagnated at 38%",
              },
              {
                number: "62%",
                arrow: "↑",
                label:
                  "Recruiters spent more time on manual tasks (sourcing, tracking and follow-ups)",
              },
              {
                number: "47%",
                arrow: "↓",
                label: "Hiring outcomes and momentum declined",
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "#EAECED",
                  borderRadius: 12,
                  padding: "20px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: "36px",
                    marginBottom: 10,
                    color: "#7C0505",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{stat.number}</span>
                    <span>{stat.arrow}</span>
                  </span>
                </div>
                <div
                  style={{ fontSize: 16, lineHeight: "22px", color: "#14191F" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 16, lineHeight: "22px", color: "#14191F" }}>
            Automation increased system capability, but decreased usability and
            trust, resulting in stagnating adoption and declining hiring
            momentum.
          </p>
        </div>
      </div>

      {view === "intense" && (
        <>
          {/* ── My Role + Team ── */}
          <div style={section("#F6F6F7")}>
            <div style={inner}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 6,
                  color: "#14191F",
                }}
              >
                My Role
              </h2>
              <ul
                style={{
                  marginBottom: 32,
                  paddingLeft: 20,
                  listStyleType: "disc",
                }}
              >
                {[
                  "Defined end-to-end conversational journeys",
                  "Designed conversation logic, edge cases and fallback states",
                  "Shaped success metrics with PM + Eng",
                ].map((r, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 16,
                      lineHeight: "22px",
                      color: "#14191F",
                      marginBottom: 4,
                    }}
                  >
                    {r}
                  </li>
                ))}
              </ul>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 6,
                  color: "#14191F",
                }}
              >
                Team
              </h2>
              <div>
                {[
                  "1x Product Designer",
                  "1x Lead Product Designer",
                  "2x Product Manager",
                  "4x Engineers",
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 16,
                      lineHeight: "22px",
                      color: "#14191F",
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Problem Statement + Pain Points ── */}
          <div style={section("white")}>
            <div style={inner}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 14,
                  color: "#14191F",
                }}
              >
                Problem Statement
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#14191F",
                  marginBottom: 14,
                }}
              >
                Recruiters/Admins relied on rigid, rule-based workflows that
                were slow to configure, difficult to maintain.
              </p>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#14191F",
                  marginBottom: 14,
                }}
              >
                Chat and voice operated independently, lacked shared context,
                and required manual setup for each use case, preventing true
                multimodal continuity.
              </p>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#14191F",
                  marginBottom: 40,
                }}
              >
                As complexity increased, trust and adoption decreased.
              </p>

              {[
                {
                  label: "Pain Point 1: High Setup Effort",
                  body: "Admins manually built long decision trees. Even minor updates required editing multiple nodes.",
                  stats: [
                    {
                      highlight: "64%",
                      desc: "Recruiters abandoning automation during setup",
                    },
                    {
                      highlight: "Avg 2.4 hrs",
                      desc: "to configure one hiring campaign",
                    },
                  ],
                  img: "/project-1/1.png",
                },
                {
                  label: "Pain Point 2: Channel Silos",
                  body: "Chat and voice were configured separately with no shared state. Conversations could not move seamlessly between modalities.",
                  stats: [
                    {
                      highlight: "39%",
                      desc: "missed follow-ups due to fragmented flows",
                    },
                  ],
                  img: "/project-1/2.png",
                },
                {
                  label: "Pain Point 3: Limited Scalability",
                  body: "Automation could not scale across hiring scenarios, forcing admins to repeatedly rebuild similar journeys.",
                  stats: [],
                  img: "/project-1/3.png",
                },
              ].map((pp, i) => (
                <div key={i} style={{ marginBottom: 40 }}>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      marginBottom: 12,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {pp.label}
                  </h3>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: "22px",
                      color: "#14191F",
                      marginBottom: 12,
                    }}
                  >
                    {pp.body}
                  </p>
                  {pp.stats.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      {pp.stats.map((s, j) => (
                        <div
                          key={j}
                          style={{
                            display: "inline-flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            gap: isMobile ? 4 : 6,
                            background: "#EAECED",
                            borderRadius: 4,
                            padding: "4px 8px",
                            width: isMobile ? "100%" : "fit-content",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#7C0505",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {s.highlight}
                          </span>
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 500,
                              color: "#14191F",
                            }}
                          >
                            {s.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ overflow: "hidden" }}>
                    <img
                      src={pp.img}
                      alt={pp.label}
                      style={{ width: "100%", display: "block" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Research + Insight ── */}
          <div style={section("#F6F6F7", 64)}>
            <div style={inner}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 20,
                  color: "#14191F",
                }}
              >
                What We Need to Learn?
              </h2>
              <div
                className="grid grid-cols-1 md:grid-cols-3"
                style={{ gap: 12, marginBottom: 64 }}
              >
                {[
                  "How do recruiters mentally model hiring work?",
                  "Where does trust break in AI-driven workflows?",
                  "What balance of control vs autonomy drives adoption?",
                ].map((q, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#EAECED",
                      borderRadius: 12,
                      padding: "20px",
                      fontSize: 16,
                      lineHeight: "22px",
                      fontWeight: 500,
                      color: "#14191F",
                      textAlign: "left",
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 12,
                  color: "#14191F",
                }}
              >
                Core Insight
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#7A7A7A",
                  marginBottom: 14,
                }}
              >
                The product required users to think like system designers.
                Recruiters think in hiring outcomes.
              </p>
              {[
                '"Screen faster."',
                '"Move candidates forward."',
                '"Don\'t miss talent."',
              ].map((q, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    color: "#7A7A7A",
                    marginBottom: 4,
                  }}
                >
                  {q}
                </p>
              ))}
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#7A7A7A",
                  marginTop: 12,
                }}
              >
                That mismatch created friction.
              </p>
            </div>
          </div>

          {/* ── Initial Conceptualising ── */}
          <div style={section("#F6F6F7", 0)}>
            <div style={inner}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 16,
                  color: "#14191F",
                }}
              >
                Initial Conceptualising Using Lovable
              </h2>
              <div style={{ overflow: "hidden" }}>
                <img
                  src="/project-1/4.png"
                  alt="Initial Conceptualising"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            </div>
          </div>

          {/* ── Design Iterations V1 + V2 ── */}
          <div style={section("#F6F6F7", 64)}>
            <div style={inner}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 24,
                  color: "#14191F",
                }}
              >
                Design Iterations
              </h2>

              {/* V1 */}
              <div style={{ marginBottom: 64 }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    marginBottom: 12,
                    letterSpacing: "-0.01em",
                  }}
                >
                  V1 — Transparency First
                </h3>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#EAECED",
                    borderRadius: 8,
                    padding: "4px 8px",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 500, color: "#14191F" }}
                  >
                    Precision &gt; Momentum
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: "22px",
                    color: "#14191F",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Hypothesis:</span> If we
                  expose full control, recruiters will trust AI.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#14191F",
                    marginBottom: 8,
                  }}
                >
                  We:
                </p>
                <div style={{ marginBottom: 20 }}>
                  {[
                    "Exposed all controls",
                    "Made decision logic visible",
                    "Enabled deep customization",
                  ].map((w, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 16,
                        color: "#14191F",
                        lineHeight: "1.7",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "#bbb" }}>•</span>
                      {w}
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#14191F",
                    marginBottom: 8,
                  }}
                >
                  Then:
                </p>
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 16,
                      color: "#14191F",
                      lineHeight: "1.7",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "#bbb" }}>•</span>Recruiters will feel
                    safe using AI
                  </div>
                </div>
                <div
                  style={{
                    overflow: "hidden",
                    marginBottom: 24,
                    borderRadius: 12,
                    border: "1px solid #D9D9D9",
                  }}
                >
                  <video
                    ref={v1VideoRef}
                    src="https://kuthq1kled.ufs.sh/f/8W28hiHCl7NX2RkeNcPfKsO79JoINYHeT1ncqijRArazlbBZ"
                    muted
                    loop
                    playsInline
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
                <div
                  style={{
                    background: "#EAECED",
                    borderRadius: 12,
                    padding: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#14191F",
                      marginBottom: 12,
                    }}
                  >
                    V1 revealed an uncomfortable truth:
                  </p>
                  {[
                    "Over-transparency reduced momentum. AI felt like another system to manage.",
                    "Trust improved. Adoption didn't.",
                  ].map((pt, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#14191F",
                        lineHeight: "1.7",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "#bbb" }}>•</span>
                      {pt}
                    </div>
                  ))}
                </div>
              </div>

              {/* V2 */}
              <div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    marginBottom: 12,
                    letterSpacing: "-0.01em",
                  }}
                >
                  V2 — Momentum First
                </h3>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#EAECED",
                    borderRadius: 8,
                    padding: "4px 8px",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 500, color: "#14191F" }}
                  >
                    Momentum &gt; Precision
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: "22px",
                    color: "#14191F",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Hypothesis:</span> If we
                  remove setup and automate by default, recruiters will
                  experience immediate value.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#14191F",
                    marginBottom: 8,
                  }}
                >
                  We:
                </p>
                <div style={{ marginBottom: 20 }}>
                  {[
                    "Removed visible workflows",
                    "Eliminated upfront configuration",
                  ].map((w, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 16,
                        color: "#14191F",
                        lineHeight: "1.7",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "#bbb" }}>•</span>
                      {w}
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#14191F",
                    marginBottom: 8,
                  }}
                >
                  Then:
                </p>
                <div style={{ marginBottom: 24 }}>
                  {[
                    "Recruiters will experience immediate value",
                    "Adoption will increase",
                  ].map((w, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 16,
                        color: "#14191F",
                        lineHeight: "1.7",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: "#bbb" }}>•</span>
                      {w}
                    </div>
                  ))}
                </div>
                <div style={{ overflow: "hidden", marginBottom: 24 }}>
                  <img
                    src="/project-1/6.png"
                    alt="V2 Design"
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
                <div
                  style={{
                    background: "#EAECED",
                    borderRadius: 12,
                    padding: "20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#14191F",
                      marginBottom: 12,
                    }}
                  >
                    Learnings from V2:
                  </p>
                  {[
                    "Speed increased. But trust declined.",
                    'Users experienced "black-box anxiety." They didn\'t know why the AI acted the way it did.',
                    "Momentum improved. Confidence dropped.",
                  ].map((pt, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#14191F",
                        lineHeight: "1.7",
                        display: "flex",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "#bbb" }}>•</span>
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Dark section: V4 + Multimodal + Solution ── */}
          <div
            style={{ width: "100%", background: "#131215", padding: "64px 0" }}
          >
            <div style={inner}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  marginBottom: 12,
                  letterSpacing: "-0.01em",
                  color: "white",
                }}
              >
                V4 — Guided Autonomy
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                {["Momentum > Complexity", "Control > Blind Automation"].map(
                  (tag, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 16,
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "#302F33",
                        color: "#FFFFFF",
                      }}
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "1.7",
                  color: "#D8D8D8",
                  marginBottom: 6,
                }}
              >
                We reframed the problem:
              </p>
              {[
                "AI shouldn't be fully controlled.",
                "AI shouldn't be fully autonomous.",
                "It should be guided.",
              ].map((pt, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 16,
                    color: "#D8D8D8",
                    lineHeight: "1.7",
                    display: "flex",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: "#555" }}>•</span>
                  {pt}
                </div>
              ))}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#555",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: "64px 0 12px",
                }}
              >
                What we exposed:
              </p>
              {[
                {
                  n: "#1",
                  title: "Linear Stages Over Decision Trees",
                  shift:
                    "Replaced complex branching logic with a simple stage-based flow: Greeting → Data Collection → Screening → Scheduling → Matching.",
                  worked:
                    "Admins define what the agent accomplishes at each stage, not how. This aligned with how recruiters naturally think about hiring work.",
                  img: "/project-1/7.png",
                },
                {
                  n: "#2",
                  title: "Contextual Intervention Points",
                  shift:
                    "Added visible 'human handoff triggers' so recruiters know when and how to step in.",
                  worked:
                    "Preserved AI momentum while giving recruiters control at critical moments.",
                  img: "/project-1/8.png",
                },
                {
                  n: "#3",
                  title: "Reusable Module Library",
                  shift:
                    "Built a library of pre-configured modules (screening questions, greetings, scheduling logic) that admins can drag, drop, and customize.",
                  worked:
                    "Eliminated repetitive setup work while maintaining flexibility.",
                  img: "/project-1/9.png",
                },
                {
                  n: "#4",
                  title: "Unified Multimodal Context",
                  shift:
                    "Created shared context across chat, SMS, and voice so conversations continue seamlessly between channels.",
                  worked:
                    "Candidates no longer had to repeat information when switching channels.",
                  img: "/project-1/10.png",
                },
              ].map((point, j) => (
                <div key={j} style={{ marginBottom: 40 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: "white",
                      marginBottom: 8,
                    }}
                  >
                    {point.n}. {point.title}
                  </div>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: "1.7",
                      color: "#D8D8D8",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>The shift: </span>
                    {point.shift}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: "1.7",
                      color: "#D8D8D8",
                      marginBottom: 20,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Why it worked: </span>
                    {point.worked}
                  </p>
                  <div style={{ overflow: "hidden" }}>
                    <img
                      src={point.img}
                      alt={point.title}
                      style={{ width: "100%", display: "block" }}
                    />
                  </div>
                </div>
              ))}
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 24,
                  color: "white",
                }}
              >
                Designing for Multimodal & System Scale
              </h2>
              {[
                {
                  title: "Cross-Platform Consistency",
                  body: "Abstract conversation logic while adapting to channel differences — voice required structured prompts and clear fallbacks; chat supported richer branching and contextual persistence.",
                },
                {
                  title: "Shared State Architecture",
                  body: "Enabled true multimodal continuity through shared conversation memory instead of channel-specific flows, aligning UX with orchestration logic.",
                },
                {
                  title: "Design System Alignment",
                  body: "Extended existing UI patterns to support modular agent configuration, ensuring consistency across workflows while reducing cognitive load.",
                },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 28 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: "white",
                      marginBottom: 8,
                    }}
                  >
                    {item.title}
                  </div>
                  <p
                    style={{
                      fontSize: 16,
                      lineHeight: "1.7",
                      color: "#D8D8D8",
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 12,
                  color: "white",
                  marginTop: 64,
                }}
              >
                Solution
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "1.7",
                  color: "#D8D8D8",
                  marginBottom: 24,
                }}
              >
                The AI Agent Builder enables admins to create goal-driven
                conversational agents without building decision trees. Instead
                of forcing recruiters to think in system logic, we let them
                define hiring outcomes and guide AI execution.
              </p>
              <div
                ref={vimeoContainerRef}
                style={{
                  borderRadius: isMobile ? 12 : 24,
                  border: "1px solid #33322F",
                  overflow: "hidden",
                  position: "relative",
                  paddingTop: "56.25%",
                }}
              >
                <iframe
                  src="https://player.vimeo.com/video/1175506100?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="AI Agent Builder Solution Preview"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Achieved Goals ── */}
      <div style={section("#F6F6F7", 64)}>
        <div style={inner}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 20,
              color: "#14191F",
            }}
          >
            Achieved Goals
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            {[
              { number: "75% - 85%", label: "reduction in average setup time" },
              { number: "1.4X", label: "increase in setup completion rate" },
              {
                number: "Reduced Dependency",
                label: "Dependency on external support has been reduced",
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: "#EAECED",
                  borderRadius: 12,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 24,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "#14191F",
                  }}
                >
                  {stat.number}
                </div>
                <div
                  style={{ fontSize: 16, lineHeight: "22px", color: "#7A7A7A" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {view === "intense" && (
        /* ── Strategic + Closing ── */
        <div style={section("#F6F6F7")}>
          <div style={inner}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 20,
                color: "#14191F",
              }}
            >
              What Changed Strategically?
            </h2>
            <div style={{ marginBottom: 64 }}>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  lineHeight: "28px",
                  color: "#14191F",
                  marginBottom: 8,
                }}
              >
                The product moved from:
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "#7A7A7A",
                  marginBottom: 12,
                }}
              >
                Flow-based automation{" "}
                <strong style={{ color: "#14191F" }}>to</strong> Outcome-driven
                orchestration
              </p>
              <p style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>
                From
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: "22px",
                  color: "#7A7A7A",
                }}
              >
                System-first thinking{" "}
                <strong style={{ color: "#14191F" }}>to</strong> Recruiter
                mental-model alignment
              </p>
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 20,
                color: "#14191F",
              }}
            >
              What I'd Evolve Next
            </h2>
            {[
              {
                n: "#1",
                title: "Measuring Trust, Not Just Adoption",
                body: "We tracked setup completion and time savings, but didn't measure long-term trust signals like: How often do recruiters override AI decisions? Where do they intervene most? I'd design a trust dashboard to surface these patterns and inform future iterations.",
              },
              {
                n: "#2",
                title: "Designing for Exception Handling at Scale",
                body: "As automation grows, edge cases multiply. I would invest in better visibility into failure states and AI recovery patterns.",
              },
              {
                n: "#3",
                title: "Making Autonomy Configurable by Maturity Level",
                body: "Different customers require different levels of control. Future iterations should adapt autonomy dynamically based on user confidence and usage patterns.",
              },
            ].map((point, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 400,
                    lineHeight: "28px",
                    marginBottom: 4,
                    color: "#14191F",
                  }}
                >
                  {point.n} {point.title}
                </p>
                <p
                  style={{ fontSize: 16, lineHeight: "22px", color: "#7A7A7A" }}
                >
                  {point.body}
                </p>
              </div>
            ))}
            <div style={{ marginTop: 64 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 16,
                  color: "#14191F",
                }}
              >
                Closing Reflection
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#14191F",
                  marginBottom: 16,
                }}
              >
                The core challenge wasn't building better automation.
                {!isMobile && <br />}
                It was designing the right balance between AI autonomy and human
                control in a high-stakes domain.
              </p>
              <p style={{ fontSize: 16, lineHeight: "22px", color: "#14191F" }}>
                The breakthrough came when we stopped optimizing workflows and
                started designing for recruiter cognition.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReimaginingAIContent({ view }: { view: "intense" | "overview" }) {
  const isMobile = useIsMobile();
  const inner: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    paddingLeft: 20,
    paddingRight: 20,
  };
  const section = (bg: string, py = 56): React.CSSProperties => ({
    width: "100%",
    background: bg,
    padding: `${py}px 0`,
  });

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "Inter, sans-serif",
        color: "#14191F",
      }}
    >
      {/* #F2F3F4 section: title → hero → Context */}
      <div style={section("#F2F3F4", 60)}>
        <div style={inner}>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 500,
              lineHeight: "50px",
              letterSpacing: "-0.02em",
              marginBottom: 16,
              color: "#14191F",
            }}
          >
            Reimagining the{!isMobile && <br />}AI Experience for Users
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: "24px",
              letterSpacing: "0",
              color: "#14191F",
              marginBottom: 56,
            }}
          >
            I led the end-to-end design of the "Thread Page," from problem
            research to implementation, incorporating continuous team feedback.
            This page serves as a dedicated space where users can store YouTube
            videos for learning and reference.
          </p>
          <div
            style={{ borderRadius: 16, overflow: "hidden", marginBottom: 64 }}
          >
            <img
              src="/project-2/project-2-cover.png"
              alt="Reimagining AI Experience"
              style={{ width: "100%", display: "block", objectFit: "cover" }}
            />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 14,
              letterSpacing: "0",
              color: "#14191F",
            }}
          >
            Context
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              letterSpacing: "0",
              color: "#14191F",
              marginBottom: 20,
            }}
          >
            In the age of information overload, video-based learning has become
            a dominant medium for acquiring knowledge. However, retaining and
            organizing key insights from long-form videos remains a challenge.{" "}
            <span style={{ textDecoration: "underline" }}>Gistr</span>, an
            AI-powered tool, was designed to solve this problem by enabling
            users to clip key moments, generate summaries, take smart notes, and
            extract insights effortlessly.
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              letterSpacing: "0",
              color: "#14191F",
            }}
          >
            While the initial goal was to integrate AI as a support mechanism
            for note-taking and comprehension on{" "}
            <span style={{ textDecoration: "underline" }}>Gistr</span>, user
            behavior told a different story.
          </p>
        </div>
      </div>

      {/* White section: Problem Statement → Understanding the Problems */}
      <div style={section("white", 64)}>
        <div style={inner}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 14,
              letterSpacing: "0",
              color: "#14191F",
            }}
          >
            Problem Statement
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              letterSpacing: "0",
              color: "#14191F",
              marginBottom: 32,
            }}
          >
            During the initial ideation phase, the vision for Gistr was to
            create a YouTube learning tool with note-taking capabilities,
            integrating AI as a support mechanism for comprehension. However,
            user behavior revealed a different set of needs and expectations.
          </p>
          <img
            src="/project-2/2.gif"
            alt="Problem statement"
            style={{
              width: "100%",
              borderRadius: 12,
              display: "block",
              marginBottom: 48,
            }}
          />
          {view === "intense" && (
            <>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: "28px",
                  marginBottom: 12,
                  color: "#14191F",
                }}
              >
                Pain Point 1: Discoverability
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  letterSpacing: "0",
                  color: "#14191F",
                  marginBottom: 48,
                }}
              >
                Users struggled to find and access the Ask AI button due to its
                background color blending in with the interface. Additionally,
                when there was too much content in the background, locating the
                button became even more challenging.
              </p>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  lineHeight: "28px",
                  marginBottom: 12,
                  color: "#14191F",
                }}
              >
                Pain Point 2: Lack of Follow-up Questioning
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  letterSpacing: "0",
                  color: "#14191F",
                  marginBottom: 48,
                }}
              >
                The inability to ask consecutive questions limited AI's
                usability and depth of interaction. In the current
                implementation, users can ask only one question before having to
                either close the input box or manually reveal the AI response to
                their notes.
              </p>
            </>
          )}
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 14,
              letterSpacing: "0",
              color: "#14191F",
            }}
          >
            Understanding the Problems
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              letterSpacing: "0",
              color: "#14191F",
              marginBottom: 0,
            }}
          >
            Our assumption was that users would primarily rely on AI as a
            supplementary tool to enhance their workflow—clipping key moments
            and taking notes for deeper understanding. However, post-launch
            analytics from PostHog session replays and user feedback indicated
            otherwise. Users were looking for a more direct, immediate way to
            extract key insights from videos rather than manually clipping and
            engaging in a structured workflow. This gap between expectation and
            actual user behavior highlighted the need to reimagine the AI
            experience.
          </p>
        </div>
      </div>

      {/* Dark section: Goals + Solution */}
      <div style={section("#131215", 64)}>
        <div style={inner}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 14,
              letterSpacing: "0",
              color: "white",
            }}
          >
            Goals
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              color: "#D8D8D8",
              marginBottom: 28,
            }}
          >
            Our goal was to make AI more accessible and valuable within Gistr,
            allowing users to interact with AI effortlessly, gain quick
            insights, and integrate those insights into their learning process.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 56,
            }}
          >
            {[
              {
                title: "Improve user interaction with AI",
                body: "Ensure a seamless and intuitive experience while engaging with AI-driven insights.",
              },
              {
                title: "Enable users to save AI-generated insights",
                body: "Provide an effortless way for users to store valuable information in their notes.",
              },
              {
                title: "Reduce cognitive load in prompt creation",
                body: "Minimize the time and effort required for users to formulate effective AI prompts.",
              },
              {
                title: "Increase user retention",
                body: "Enhance user satisfaction and engagement to drive higher retention rates within the product.",
              },
            ].map((goal, i) => (
              <div
                key={i}
                style={{
                  background: "#1C1C24",
                  borderRadius: 12,
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "white",
                    marginBottom: 8,
                    lineHeight: "22px",
                  }}
                >
                  {goal.title}
                </p>
                <p
                  style={{ fontSize: 16, lineHeight: "22px", color: "#D8D8D8" }}
                >
                  {goal.body}
                </p>
              </div>
            ))}
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              lineHeight: "32px",
              marginBottom: 14,
              letterSpacing: "0",
              color: "white",
            }}
          >
            Solution
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              color: "#D8D8D8",
              marginBottom: 24,
            }}
          >
            To enhance the AI experience, we introduced a dedicated thread page
            that prioritizes AI-driven insights, allowing users to find relevant
            information more efficiently.
          </p>
          <img
            src="/project-2/3.png"
            alt="Solution"
            style={{
              width: "100%",
              borderRadius: 12,
              display: "block",
              marginBottom: 24,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            {[
              {
                title: "Improved Discoverability",
                body: "Making the Ask AI touchpoint more prominent within the editor to encourage engagement.",
              },
              {
                title: "Predefined Smart and General Prompts",
                body: "Providing users with preset prompt options to simplify their workflow and extract meaningful insights.",
              },
              {
                title: "Follow-up Questions",
                body: "Enabling users to ask consecutive questions for a more interactive and contextual learning experience.",
              },
              {
                title: "Follow-up Questions",
                body: "Enabling users to ask consecutive questions for a more interactive and contextual learning experience.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                style={{
                  background: "#1C1C24",
                  borderRadius: 12,
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "white",
                    marginBottom: 8,
                    lineHeight: "22px",
                  }}
                >
                  {feat.title}
                </p>
                <p
                  style={{ fontSize: 16, lineHeight: "22px", color: "#D8D8D8" }}
                >
                  {feat.body}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{ background: "#1C1C24", borderRadius: 12, padding: "20px" }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "white",
                marginBottom: 8,
                lineHeight: "22px",
              }}
            >
              Chat History
            </p>
            <p style={{ fontSize: 16, lineHeight: "22px", color: "#D8D8D8" }}>
              Allowing users to revisit past interactions with AI for reference
              and continuity.
            </p>
          </div>
        </div>
      </div>

      {/* Intense-only: Research → Takeaways */}
      {view === "intense" && (
        <div style={section("white", 64)}>
          <div style={{ ...inner, paddingBottom: 24 }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 14,
                letterSpacing: "0",
                color: "#14191F",
              }}
            >
              Research
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 32,
              }}
            >
              To validate our hypothesis, we conducted an in-depth analysis of
              user behavior to set the foundation for reimagining how AI could
              enhance the user experience within Gistr.
            </p>
            {[
              {
                n: "#1. Session Replays & Analytics",
                body: "PostHog data revealed that more than 20+ users were not engaging with Ask AI as expected. Instead of using it for deeper analysis, they sought quick insights from videos.",
              },
              {
                n: "#2. Competitor Benchmarking",
                body: "A review of 10 to 15 similar AI-powered tools highlighted the importance of an intuitive discovery experience and the ability to ask follow-up questions dynamically.",
              },
              {
                n: "#3. User Feedback & Interviews",
                body: "Conversations with 3 early adopters reinforced the insight that users wanted a more seamless and accessible AI experience.",
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: "22px",
                    marginBottom: 6,
                    color: "#14191F",
                  }}
                >
                  {item.n}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: "22px",
                    letterSpacing: "0",
                    color: "#14191F",
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
            <div style={{ marginTop: 48 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 14,
                  letterSpacing: "0",
                  color: "#14191F",
                }}
              >
                Feature Prioritization
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  letterSpacing: "0",
                  color: "#14191F",
                  marginBottom: 48,
                }}
              >
                After discussions with the team—including the founder,
                engineers, and designers, we decided to first implement Smart &
                General Prompts, as the AI/ML team had an existing technical
                solution that only required a design and frontend
                implementation. This feature had the potential for immediate
                high impact. Meanwhile, other teams began working on the next
                set of proposed solutions.
              </p>
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 24,
                letterSpacing: "0",
                color: "#14191F",
              }}
            >
              Design Decisions
            </h2>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: "28px",
                marginBottom: 12,
                color: "#14191F",
              }}
            >
              Redesigned Ask AI Button for Better Discoverability
            </h3>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 24,
              }}
            >
              Instead of a small button, we introduced a wide input field to
              make the feature more prominent and intuitive. This change
              increased engagement by making it immediately clear where users
              could ask AI-related queries.
            </p>
            <img
              src="/project-2/4.png"
              alt="Design decision - Ask AI button"
              style={{
                width: "100%",
                borderRadius: 12,
                display: "block",
                marginBottom: 48,
              }}
            />
            <h3
              style={{
                fontSize: 20,
                fontWeight: 500,
                lineHeight: "28px",
                marginBottom: 12,
                color: "#14191F",
              }}
            >
              Introduced Tabs for User Notes and Ask AI
            </h3>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 24,
              }}
            >
              To create a more structured experience, we introduced separate
              tabs—one for user-generated notes and another dedicated to AI
              interactions. This separation reduced cognitive overload and
              allowed users to efficiently manage both their notes and
              AI-generated insights.
            </p>
            <img
              src="/project-2/5.png"
              alt="Tabs for user notes and Ask AI"
              style={{
                width: "100%",
                borderRadius: 12,
                display: "block",
                marginBottom: 64,
              }}
            />
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 16,
                letterSpacing: "0",
                color: "#14191F",
              }}
            >
              Final Design
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 24,
              }}
            >
              Now, users can easily locate the Ask AI feature within the notes
              tab, click on it to view all available general and smart prompts,
              select one, or type in their own prompt. They receive quick
              responses, which they can add to their notes or use as a starting
              point for follow-up questions, enabling deeper understanding of
              the topic.
            </p>
            <img
              src="/project-2/6.gif"
              alt="Final design"
              style={{
                width: "100%",
                borderRadius: 12,
                display: "block",
                marginBottom: 32,
              }}
            />
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 24,
              }}
            >
              For users who prefer passive learning over active note-taking, the
              Ask AI tab serves as the ideal solution, allowing them to consume
              AI-generated content effortlessly. Additionally, it enables users
              to quickly browse through key insights without manually searching
              through the video. The ability to revisit past conversations and
              insights further enhances knowledge retention, ensuring a more
              efficient learning experience.
            </p>
            <img
              src="/project-2/7.gif"
              alt="Final design continued"
              style={{
                width: "100%",
                borderRadius: 12,
                display: "block",
                marginBottom: 64,
              }}
            />
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 16,
                letterSpacing: "0",
                color: "#14191F",
              }}
            >
              Outcome
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 20,
              }}
            >
              After deploying the Smart and General Prompts feature, we received
              highly positive feedback from early adopters. Users found it
              easier to interact with AI, leading to an increase in engagement
              with suggested prompts and a noticeable improvement in user
              retention.
            </p>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
                marginBottom: 48,
              }}
            >
              The other proposed features, including follow-up questions and
              chat history, are currently in development. However, initial user
              research and usability testing have already indicated positive
              responses, reinforcing the need for these enhancements in future
              updates.
            </p>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: "32px",
                marginBottom: 16,
                letterSpacing: "0",
                color: "#14191F",
              }}
            >
              Takeaways
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: "22px",
                letterSpacing: "0",
                color: "#14191F",
              }}
            >
              This case study highlights the importance of relying on user data
              rather than assumptions. While hypotheses can guide initial design
              decisions, true insights come from observing actual user behavior.
              By prioritizing user intent and continuously iterating based on
              feedback, we can create more effective and intuitive AI
              experiences that genuinely enhance user workflows.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function VimeoAutoplayEmbed({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sendMessage = (method: string) => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ method }),
        "https://player.vimeo.com",
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sendMessage("play");
        } else {
          sendMessage("pause");
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: isMobile ? 12 : 24,
        border: "1px solid #D9D9D9",
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&loop=1&muted=1&autoplay=0`}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ display: "block", width: "100%", height: "100%" }}
        title="AI Powered Video Interview"
      />
    </div>
  );
}

function MVPVideoAIContent({ view: _view }: { view: "intense" | "overview" }) {
  const phStyle = (h: number, mt = 32, mb = 0): React.CSSProperties => ({
    background: "#E8E8EA",
    borderRadius: 14,
    height: h,
    marginTop: mt,
    marginBottom: mb,
  });

  const senderBubble = (
    initials: string,
    role: string,
    children: React.ReactNode,
    key?: number,
    bubbleStyle?: React.CSSProperties,
  ) => (
    <div
      key={key}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#171717",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {initials}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#A1A1A1",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          • {role}
        </span>
      </div>
      <div
        style={{
          background: "white",
          border: "1px solid #D9D9D9",
          borderRadius: "12px 12px 12px 4px",
          padding: "8px 16px",
          maxWidth: 480,
          fontSize: 14,
          lineHeight: "20px",
          color: "#14191F",
          fontFamily: "Inter, sans-serif",
          boxShadow: "0px 2px 12px rgba(0,0,0,0.08)",
          ...bubbleStyle,
        }}
      >
        {children}
      </div>
    </div>
  );

  const myBubble = (children: React.ReactNode, key?: number) => (
    <div
      key={key}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#171717",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Me
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#A1A1A1",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          • Product Designer
        </span>
      </div>
      <div
        style={{
          background: "#0F87FF",
          borderRadius: "12px 4px 12px 12px",
          padding: "8px 16px",
          maxWidth: 480,
          fontSize: 14,
          lineHeight: "20px",
          color: "white",
          fontFamily: "Inter, sans-serif",
          boxShadow:
            "inset 0px 1px 2px rgba(255,255,255,0.5), 0px 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );

  const divider = (label: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "32px 0",
        color: "#9B9B9B",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#E0E0E0" }} />
      <span
        style={{
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: "nowrap",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#E0E0E0" }} />
    </div>
  );

  const avatarRow = (label: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        margin: "64px 0",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#D9D9D9" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {[
            "/project-3/Avatar 01.png",
            "/project-3/Avatar 02.png",
            "/project-3/Avatar 03.png",
            "/project-3/Avatar 04.png",
          ].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Participant ${i + 1}`}
              className="cs3-avatar"
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: i }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#14191F",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: "#D9D9D9" }} />
    </div>
  );

  const inner: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    paddingLeft: 20,
    paddingRight: 20,
  };
  const section = (bg: string, py = 56): React.CSSProperties => ({
    width: "100%",
    background: bg,
    padding: `${py}px 0`,
  });

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "Inter, sans-serif",
        color: "#14191F",
      }}
    >
      <div style={section("white", 60)}>
        <div style={inner}>
          {/* Title */}
          <h1
            style={{
              fontSize: 40,
              fontWeight: 500,
              lineHeight: "50px",
              letterSpacing: "-0.02em",
              marginBottom: 56,
              color: "#14191F",
            }}
          >
            Defining the MVP for an AI-Powered Candidate Video Experience
          </h1>

          {/* Meeting kickoff */}
          {avatarRow("+4 Joined the Meeting")}

          {senderBubble(
            "SD",
            "Managing Director",
            "Hey everyone! We're running a 2-week AI hackathon and looking for innovative solutions that can be designed and built within that timeframe using AI tools. Think V1 — lean, essential features only.",
          )}

          {senderBubble(
            "SD",
            "Managing Director",
            <div>
              <p style={{ marginBottom: 10 }}>Here are your topic:</p>
              <ul
                style={{
                  paddingLeft: 18,
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  listStyleType: "disc",
                }}
              >
                <li style={{ display: "list-item" }}>AI Notetaker - Team A</li>
                <li style={{ display: "list-item" }}>
                  AI Receptionist - Team B
                </li>
                <li style={{ display: "list-item" }}>
                  Video AI - Team C [🧑‍💻 Me]
                </li>
                <li style={{ display: "list-item" }}>
                  AI Powered Career Sites - Team D
                </li>
                <li style={{ display: "list-item" }}>ROI Agent - Team E</li>
              </ul>
              <p>
                The best project wins a cash prize. Good luck, and thanks for
                joining!
              </p>
            </div>,
          )}

          {myBubble("Thank you")}

          {divider("Meeting Ended")}

          {senderBubble(
            "AG",
            "Product Manger",
            "Let's keep this interesting but realistic and something we can actually ship in two weeks.",
          )}

          {myBubble(
            "Agreed. Let's start with a competitor analysis to map out the possible features, then narrow down to what's achievable.",
          )}

          {senderBubble(
            "AG",
            "Product Manger",
            "Sounds good. Let's connect tomorrow.",
          )}

          {divider("Next Day")}

          {myBubble(
            "Hey AG! I've been looking into a few competitors like Alex AI and a few others, and explored their design patterns.",
          )}

          {senderBubble(
            "AG",
            "Product Manger",
            "Same here. I checked out Alex AI and a couple of others. I'm thinking we focus on two core problems and a dynamic AI powered screening flow and fraud detection.",
          )}

          {senderBubble(
            "AG",
            "Product Manger",
            "A lot of competitors have failed because they couldn't crack fraud detection and proctoring. We need to get that right. I'm putting together a one-pager PRD for approval and in the meantime, go ahead and work on the candidate experience flow based on your understanding. We can sync up and align our ideas after.",
          )}

          {myBubble("Sure!")}

          {divider("3 hours later")}

          {avatarRow("Meeting Started")}

          {myBubble(
            <div>
              <p
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                  marginBottom: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.02em",
                }}
              >
                Presented the demo built on v0
              </p>
              <p>
                Quick demo time — I put this together on v0. It covers the full
                candidate experience.
              </p>
            </div>,
          )}

          {senderBubble(
            "DP",
            "Director or Product Management",
            "This looks great! A couple of things — add initial verification, and think through how we surface fraud detection findings post-analysis. Full fraud detection in two weeks is ambitious, but we could incorporate it into the candidate evaluation report using a third-party vendor for analysis. Let's focus on that angle.",
          )}

          {myBubble(
            "Got it! I'll add that and work on the final version in Lovable.",
          )}

          {divider("Meeting Ended")}

          {senderBubble(
            "AG",
            "Product Manger",
            <a
              href="https://drive.google.com/file/d/1sIKUCuvxRnVCNzspn6NBzyButYne7Omo/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "12px 16px",
                textDecoration: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#828282",
                  letterSpacing: "-0.01em",
                }}
              >
                Product Requirement Document
              </span>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#2B2B2B",
                  lineHeight: "22px",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                AI Video Interview Agent Automated Screening Interview
              </p>
              <div
                style={{ height: 1, background: "#E8E8E8", margin: "2px 0" }}
              />
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: "#2B2B2B",
                  lineHeight: "18px",
                  margin: 0,
                }}
              >
                Description: What it is?
              </p>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 300,
                  color: "#8C8C8C",
                  lineHeight: "17px",
                  margin: 0,
                }}
              >
                Build an AI Video Interview Agent that automates first-round
                screening interviews for recruiters across ...
              </p>
            </a>,
            undefined,
            {
              padding: 0,
              border: "1px solid #D9D9D9",
              boxShadow: "0px 2px 12px rgba(0,0,0,0.08)",
              background: "white",
              borderRadius: 12,
              overflow: "hidden",
            },
          )}

          {senderBubble(
            "AG",
            "Product Manger",
            "Chirag, here's the final PRD. Let me know if you have any questions!",
          )}

          {myBubble("Thanks, will go through it!")}

          {divider("Prototype Delivered")}

          <p
            style={{
              fontSize: 16,
              lineHeight: "22px",
              color: "#14191F",
              marginBottom: 16,
            }}
          >
            Here is the initial prototype I created for the hackathon using
            Lovable.
          </p>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
          <VimeoAutoplayEmbed videoId="1175522753" />
        </div>
      </div>
    </div>
  );
}

function InterviewSchedulingContent({
  view,
}: {
  view: "intense" | "overview";
}) {
  const isMobile = useIsMobile();
  const phStyle = (h: number, mb = 48): React.CSSProperties => ({
    background: "#E0E0E3",
    borderRadius: 14,
    height: h,
    marginBottom: mb,
  });
  const phDark = (h: number, mb = 32): React.CSSProperties => ({
    background: "#1C1C24",
    borderRadius: 14,
    height: h,
    marginBottom: mb,
  });
  const h2Style: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 500,
    lineHeight: "32px",
    marginBottom: 14,
    letterSpacing: "0",
    color: "#14191F",
  };
  const h3Style: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 500,
    lineHeight: "28px",
    marginBottom: 12,
    color: "#14191F",
  };
  const bodyStyle: React.CSSProperties = {
    fontSize: 16,
    lineHeight: "22px",
    letterSpacing: "0",
    color: "#14191F",
  };
  const inner: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    paddingLeft: 20,
    paddingRight: 20,
  };
  const section = (bg: string, py = 56): React.CSSProperties => ({
    width: "100%",
    background: bg,
    padding: `${py}px 0`,
  });

  return (
    <div
      style={{
        width: "100%",
        fontFamily: "Inter, sans-serif",
        color: "#14191F",
      }}
    >
      {/* ── Section 1: Title + Hero + Note — bg #F2F3F4 ── */}
      <div style={section("#F2F3F4", 60)}>
        <div style={inner}>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 500,
              lineHeight: "50px",
              letterSpacing: "-0.02em",
              marginBottom: 16,
              color: "#14191F",
            }}
          >
            Streamlining interview scheduling for{!isMobile && <br />}talent
            acquisition and HR managers.
          </h1>
          <p style={{ ...bodyStyle, lineHeight: "24px", marginBottom: 56 }}>
            Hyreo is an advanced talent relationship management solution that
            anticipates the needs of every stakeholder in the recruitment
            process before they even arise. As a candidate relationship
            management platform, Hyreo provides recruiters with exceptional
            insights, ensuring they remain informed and engaged throughout the
            recruitment journey.
          </p>

          {/* Hero */}
          <div
            style={{ borderRadius: 16, overflow: "hidden", marginBottom: 64 }}
          >
            <img
              src="/project-4/proj-4-cover.png"
              alt="Interview Scheduling"
              style={{ width: "100%", display: "block" }}
            />
          </div>

          {/* Note */}
          <h2 style={{ ...h2Style, marginBottom: 12 }}>Note</h2>
          <p
            style={{
              ...bodyStyle,
              fontStyle: "italic",
              marginBottom: 0,
              color: "#55595E",
            }}
          >
            My work spans the entire platform, affecting how users interact with
            features from creating job requisitions to scheduling interviews and
            onboarding candidates. I notably led the design and solution for the
            interview scheduling module, incorporating ongoing feedback from my
            lead. (
            <span style={{ textDecoration: "underline" }}>Arun Antony</span>).
          </p>
        </div>
      </div>

      {/* ── Section 2: Problem Statement → Constraint Note — bg #ffffff ── */}
      <div style={section("#ffffff", 56)}>
        <div style={inner}>
          <h2 style={{ ...h2Style }}>Problem Statement</h2>
          <p style={{ ...bodyStyle, marginBottom: 16 }}>
            Before we initiated work on the product, the interview creation
            feature was quite basic:
          </p>
          <ul
            style={{
              ...bodyStyle,
              paddingLeft: 24,
              marginBottom: 16,
              listStyleType: "disc",
            }}
          >
            <li style={{ marginBottom: 8 }}>
              Users could only select the type of interview, name it, set start
              and end dates, specify the number of rounds, and assign panelists.
            </li>
            <li style={{ marginBottom: 8 }}>
              Interviews was inefficient and lacked effective process
              management.
            </li>
            <li>
              Regular users, mainly recruiters and hiring managers, had to rely
              on other tools for conducting interviews.
            </li>
          </ul>
          <p style={{ ...bodyStyle, marginBottom: 32 }}>
            Due to numerous client requests received by Hyreo's sales team, the
            decision was made to enhance this feature, despite initially not
            knowing the best solution.
          </p>
          <img
            src="/project-4/1.webp"
            alt="Problem statement"
            style={{
              width: "100%",
              borderRadius: 14,
              display: "block",
              marginBottom: 48,
            }}
          />

          {/* User Stories */}
          <h2 style={{ ...h2Style }}>
            User Stories Shared by the Stakeholders
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {[
              "View all the the ongoing interview events along with key details.",
              "See the candidates and panelist details who are participating in the interview process.",
              "See the number of rounds and its details.",
              "Schedule interview for each candidate individually",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  background: "#F4F6F7",
                  borderRadius: 12,
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#14191F",
                    marginBottom: 6,
                  }}
                >
                  User wants to
                </p>
                <p
                  style={{ fontSize: 14, lineHeight: "20px", color: "#14191F" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "#F4F6F7",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#14191F",
                marginBottom: 6,
              }}
            >
              User wants to
            </p>
            <p style={{ fontSize: 14, lineHeight: "20px", color: "#14191F" }}>
              See the candidate status and progress in the interview event.
            </p>
          </div>

          {/* Constraint Note */}
          <div style={{ marginBottom: 0 }}>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
                color: "#14191F",
              }}
            >
              Note
            </p>
            <ol
              style={{
                fontSize: 16,
                lineHeight: "22px",
                color: "#55595E",
                paddingLeft: 24,
                listStyleType: "decimal",
                fontStyle: "italic",
              }}
            >
              <li style={{ marginBottom: 10 }}>
                Creation and editing of an interview event are currently not
                possible due to technical issues. Therefore, the interview event
                will be created and edited within the job requisition module.
                Hence each interview event should be connected with a job
                requisition.
              </li>
              <li style={{ marginBottom: 10 }}>
                Only candidates whose statuses have been changed to "interview"
                under a job requisition will be displayed in this module.
              </li>
              <li>Interviews are called as events.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── Section 3: Goals — bg #F2F3F4 ── */}
      <div style={section("#F2F3F4", 56)}>
        <div style={inner}>
          <h2 style={{ ...h2Style }}>Goals</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 0,
            }}
          >
            {[
              "Easier, faster and more flexible ways to manage interviews",
              "Making search and filtering candidates simple to schedule interview's quickly",
            ].map((g, i) => (
              <div
                key={i}
                style={{
                  background: "#EAECED",
                  borderRadius: 12,
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    lineHeight: "22px",
                    color: "#14191F",
                  }}
                >
                  {g}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {view === "intense" && (
        <>
          {/* ── Section 4: Research + Wireframe + Solution — bg #131215 ── */}
          <div style={section("#131215", 64)}>
            <div style={inner}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 24,
                  letterSpacing: "0",
                  color: "white",
                }}
              >
                Research
              </h2>
              <img
                src="/project-4/2.webp"
                alt="Research 1"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  display: "block",
                  marginBottom: 16,
                }}
              />
              <img
                src="/project-4/3.webp"
                alt="Research 2"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  display: "block",
                  marginBottom: 48,
                }}
              />

              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 24,
                  letterSpacing: "0",
                  color: "white",
                }}
              >
                Wireframe
              </h2>
              <img
                src="/project-4/4.gif"
                alt="Wireframe"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  display: "block",
                  marginBottom: 48,
                }}
              />

              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: "32px",
                  marginBottom: 14,
                  letterSpacing: "0",
                  color: "white",
                }}
              >
                Solution
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#F8F8F1",
                  marginBottom: 24,
                }}
              >
                The solution features simplified navigation, a clear visual
                hierarchy, and scalability, achieved using an in-house design
                system I created.
              </p>
              <img
                src="/project-4/5.webp"
                alt="Solution"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  display: "block",
                  marginBottom: 24,
                }}
              />
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#F8F8F1",
                  marginBottom: 16,
                }}
              >
                Introducing the home screen of the Interview Control Center.
                This page includes key event metrics, a table that provides an
                overview of all events with various statuses, and options for
                search and filter to find the events quickly.
              </p>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#F8F8F1",
                  marginBottom: 10,
                }}
              >
                Through this table, users gain insights into:
              </p>
              <ul
                style={{
                  fontSize: 16,
                  lineHeight: "22px",
                  color: "#F8F8F1",
                  paddingLeft: 24,
                  listStyleType: "disc",
                  marginBottom: 16,
                }}
              >
                <li style={{ marginBottom: 6 }}>
                  Interviews, including start and end dates
                </li>
                <li style={{ marginBottom: 6 }}>
                  Displays names of the primary recruiter and hiring manager
                </li>
                <li style={{ marginBottom: 6 }}>
                  Shows the number of panelists and candidates
                </li>
                <li>Provides an option to download reports</li>
              </ul>
              <p style={{ fontSize: 16, lineHeight: "22px", color: "#F8F8F1" }}>
                This helps in managing multiple interview events simultaneously.
              </p>
            </div>
          </div>

          {/* ── Section 5: Monitoring → End — bg #F2F3F4 ── */}
          <div style={section("#F2F3F4", 64)}>
            <div style={{ ...inner, paddingBottom: 24 }}>
              {/* Monitoring and Managing Interviews */}
              <h2 style={{ ...h2Style }}>Monitoring and Managing Interviews</h2>
              <p style={{ ...bodyStyle, marginBottom: 24 }}>
                After discussion with the developers and my head, I understood
                the technical limitations as well as different possible edge
                cases around the Kanban approach. Hence, I adjusted my initial
                plan from a Kanban approach to an accordion approach, as I
                realized that the Kanban approach wasn't the optimal solution.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 32 }}>
                Then, I brainstormed possible solutions that would help the end
                users monitor, manage and schedule interviews seamlessly. Also
                validated the solution and ultimately designed the final
                approach.
              </p>
              <img
                src="/project-4/6.webp"
                alt="Monitoring and managing interviews"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 64,
                  border: "1px solid #DADADB",
                }}
              />

              {/* Functionalities */}
              <h2 style={{ ...h2Style }}>Functionalities</h2>
              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                This is a full-page modal with options to switch between
                different events using the up and down buttons, followed by the
                number of events at the top. The header includes the job
                requisition name and ID, followed by key details of the event.
                It also has an option to email candidates and panelists who are
                part of this event, eliminating the need for other mailing
                tools.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 12 }}>
                I have seperated the bottom section into three tabs:
              </p>
              <ol
                style={{
                  ...bodyStyle,
                  paddingLeft: 24,
                  marginBottom: 32,
                  listStyleType: "decimal",
                }}
              >
                <li style={{ marginBottom: 6 }}>
                  Control panel tab: Used to manage interviews
                </li>
                <li style={{ marginBottom: 6 }}>
                  Candidate tab: See all candidate details participating in the
                  interview event
                </li>
                <li>
                  Panelist tab: See all panelist details participating in the
                  interview event
                </li>
              </ol>
              <img
                src="/project-4/7.webp"
                alt="Functionalities"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 64,
                  border: "1px solid #DADADB",
                }}
              />

              {/* Different Views */}
              <h2 style={{ ...h2Style }}>
                Different Views of the Control Center
              </h2>
              <p style={{ ...bodyStyle, marginBottom: 28 }}>
                The control center had 2 types of view:
              </p>

              <h3 style={{ ...h3Style }}>Group by Rounds</h3>
              <p style={{ ...bodyStyle, marginBottom: 20 }}>
                In this view, the accordions have the round names and details.
                This view highlights the name of the panelist assigned to the
                round and the number of scheduled interviews for each panelist.
              </p>
              <img
                src="/project-4/8.webp"
                alt="Group by rounds"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 48,
                  border: "1px solid #DADADB",
                }}
              />

              <h3 style={{ ...h3Style }}>Group by Panelist</h3>
              <p style={{ ...bodyStyle, marginBottom: 20 }}>
                In this view, the accordions change from showing round names to
                displaying panelist names. This view highlights the rounds each
                panelist is assigned to and the number of scheduled interviews
                for each panelist.
              </p>
              <img
                src="/project-4/9.webp"
                alt="Group by panelist"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 64,
                  border: "1px solid #DADADB",
                }}
              />

              {/* Scheduling Interview */}
              <h2 style={{ ...h2Style }}>Scheduling Interview</h2>
              <p style={{ ...bodyStyle, marginBottom: 24 }}>
                This is the key part of the entire module. There are multiple
                options to schedule interview:
              </p>

              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                1. By clicking on the 'Add candidate' button on the accordion.
                For example, if the user clicks on the 'Add candidate' option in
                round 1 accordion, all the candidates who are eligible for
                'round 1' and whose interviews have not been scheduled will be
                displayed.
              </p>
              <img
                src="/project-4/10.webp"
                alt="Scheduling interview - add candidate"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 32,
                  border: "1px solid #DADADB",
                }}
              />

              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                2. By clicking on the 'Manage candidates' button all the
                candidate with different interview statuses will be displayed.
              </p>
              <img
                src="/project-4/11.webp"
                alt="Scheduling interview - manage candidates"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 32,
                  border: "1px solid #DADADB",
                }}
              />

              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                3. By dragging and dropping candidates to rounds or panelist
                accordion
              </p>
              <img
                src="/project-4/12.webp"
                alt="Scheduling interview - drag and drop"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 32,
                  border: "1px solid #DADADB",
                }}
              />

              <h3 style={{ ...h3Style }}>Challenge</h3>
              <p style={{ ...bodyStyle, marginBottom: 24 }}>
                The slot allocation for the candidate interview round will
                depend on the availability of the panelists, not the
                availability of the candidate.
              </p>

              <h3 style={{ ...h3Style }}>Solution</h3>
              <p style={{ ...bodyStyle, marginBottom: 48 }}>
                To address this challenge, the drawer component was selected as
                the ideal solution for slot selection and scheduling. This
                approach allows users to see all selected fields at once, rather
                than using a stepper approach. Prioritizing panelist selection
                is crucial since the calendar and timeslot sections are affected
                by the availability of the panelists.
              </p>

              {/* Candidate Interview Cards */}
              <h2 style={{ ...h2Style }}>Candidate Interview Cards</h2>
              <p style={{ ...bodyStyle, marginBottom: 20 }}>
                These custom cards allow end users to live track the interview
                progress of each candidate. These different cards are to
                represent different interview statuses.
              </p>
              <img
                src="/project-4/13.webp"
                alt="Candidate interview cards"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 64,
                  border: "1px solid #DADADB",
                }}
              />

              {/* Viewing Candidate Details */}
              <h2 style={{ ...h2Style }}>
                Viewing Candidate Details, Rescheduling and Cancelling
                Interviews
              </h2>
              <p style={{ ...bodyStyle, marginBottom: 20 }}>
                This drawer is very important for view the candidate details, it
                helps the users make decisions and perform actions such as
                rescheduling interviews or cancel if the candidate or panelist
                is not available or for other reasons.
              </p>
              <img
                src="/project-4/14.webp"
                alt="Viewing candidate details, rescheduling and cancelling"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 64,
                  border: "1px solid #DADADB",
                }}
              />

              {/* Candidate Tab */}
              <h2 style={{ ...h2Style }}>Candidate tab</h2>
              <p style={{ ...bodyStyle, marginBottom: 20 }}>
                This displays all the candidates who are participating in this
                interview event.
              </p>
              <img
                src="/project-4/15.webp"
                alt="Candidate tab"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  display: "block",
                  marginBottom: 64,
                  border: "1px solid #DADADB",
                }}
              />

              {/* Last Notes */}
              <h2 style={{ ...h2Style }}>Last notes</h2>
              <p style={{ ...bodyStyle }}>
                The entire solution has been built over several iterations and
                versions. With continuous feedback from my head and the
                stakeholders, we crafted a simple yet efficient solution that
                fulfills all user needs. Our collective efforts enabled us to
                better advocate for the users and create a solution that truly
                caters to their requirements.
              </p>
            </div>
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
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 16,
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 15, color: "#888", lineHeight: "1.6" }}>
        Full case study coming soon.
      </p>
    </div>
  );
}

function CaseStudyBrowser({
  studyId,
  fullscreen,
  onToggleFullscreen,
  onClose,
  view,
  onViewChange,
  onNavigate,
}: {
  studyId: string;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose?: () => void;
  view: "intense" | "overview";
  onViewChange: (v: "intense" | "overview") => void;
  onNavigate: (id: string) => void;
}) {
  const [urlOpen, setUrlOpen] = useState(false);
  const urlRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const study = caseStudies.find((s) => s.id === studyId)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (urlRef.current && !urlRef.current.contains(e.target as Node))
        setUrlOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [studyId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#F6F6F7",
        borderRadius: 16,
        border: "0.5px solid #d9d9d9",
        overflow: "hidden",
        marginRight: 8,
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
          borderBottom: "0.5px solid #d9d9d9",
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
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#F5F5F5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <PanelLeftIcon size={16} />
        </button>

        {/* Center: URL pill */}
        <div
          ref={urlRef}
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "max-content",
              maxWidth: 500,
            }}
          >
            <button
              data-testid="button-case-study-url"
              onClick={() => setUrlOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0px 12px",
                height: 28,
                width: "100%",
                borderRadius: 999,
                border: "0.5px solid #E0E0E0",
                background: urlOpen ? "white" : "#F5F5F5",
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                lineHeight: "16px",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!urlOpen)
                  (e.currentTarget as HTMLElement).style.background = "white";
              }}
              onMouseLeave={(e) => {
                if (!urlOpen)
                  (e.currentTarget as HTMLElement).style.background = "#F5F5F5";
              }}
            >
              <GlobeIcon size={13} color="#7A7A7A" style={{ flexShrink: 0 }} />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                <span style={{ color: "#212121" }}>chirag.design</span>
                <span style={{ color: "#B8B8B8" }}>/</span>
                <span style={{ color: "#B8B8B8" }}>work</span>
                <span style={{ color: "#B8B8B8" }}>/</span>
                <span
                  style={{
                    color: "#B8B8B8",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {study.fullTitle}
                </span>
              </span>
              <ChevronsUpDownIcon
                size={14}
                color="#7A7A7A"
                style={{ flexShrink: 0 }}
              />
            </button>

            {urlOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  width: "100%",
                  background: "white",
                  border: "0.5px solid #E5E5E5",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
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
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "-0.02em",
                      color: s.id === studyId ? "#171717" : "#888",
                      fontWeight: s.id === studyId ? 600 : 400,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#F7F7F7";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }}
                  >
                    {s.fullTitle}
                    {s.id === studyId && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#171717",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: close button */}
        {onClose && (
          <button
            onClick={onClose}
            data-testid="button-case-study-close"
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
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#F5F5F5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        ref={contentScrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#F6F6F7",
        }}
        className="hide-scrollbar"
      >
        {studyId === "ai-agents-hr" ? (
          <AIAgentsHRContent view={view} />
        ) : studyId === "reimagining-ai" ? (
          <ReimaginingAIContent view={view} />
        ) : studyId === "mvp-video-ai" ? (
          <MVPVideoAIContent view={view} />
        ) : studyId === "interview-scheduling" ? (
          <InterviewSchedulingContent view={view} />
        ) : (
          <CaseStudyPlaceholder title={study.fullTitle} />
        )}
      </div>
    </div>
  );
}

function CaseStudyBottomSheet({
  studyId,
  view,
  onClose,
}: {
  studyId: string;
  view: "intense" | "overview";
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const study = caseStudies.find((s) => s.id === studyId)!;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          transition: "opacity 0.32s ease",
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: "relative",
          height: "80vh",
          background: "white",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Sheet header */}
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px 10px",
            borderBottom: "0.5px solid #EFEFEF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: 28 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 99,
                background: "#E0E0E0",
              }}
            />
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#555",
                fontFamily: "Inter, sans-serif",
                margin: 0,
              }}
            >
              {study.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            data-testid="button-case-study-close"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "none",
              background: "#F2F2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="#555"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {/* Scrollable content */}
        <div
          className="hide-scrollbar"
          style={{ flex: 1, overflowY: "auto", background: "#F2F3F4" }}
        >
          {studyId === "ai-agents-hr" ? (
            <AIAgentsHRContent view={view} />
          ) : studyId === "reimagining-ai" ? (
            <ReimaginingAIContent view={view} />
          ) : studyId === "mvp-video-ai" ? (
            <MVPVideoAIContent view={view} />
          ) : studyId === "interview-scheduling" ? (
            <InterviewSchedulingContent view={view} />
          ) : (
            <CaseStudyPlaceholder title={study.fullTitle} />
          )}
        </div>
      </div>
    </div>
  );
}

export const Desktop = (): JSX.Element => {
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [homePhase, setHomePhase] = useState<"idle" | "filling" | "loading">(
    "idle",
  );
  const [activePhase, setActivePhase] = useState<ActivePhase | null>(null);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [pendingQuery, setPendingQuery] = useState("");
  const [pendingType, setPendingType] = useState<ResponseType>("work");
  const [inChatMode, setInChatMode] = useState(false);
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState<string | null>(null);
  const [caseStudyFullscreen, setCaseStudyFullscreen] = useState(false);
  const [caseStudyView, setCaseStudyView] = useState<"intense" | "overview">(
    "intense",
  );
  const sessionId = useRef(Math.random().toString(36).slice(2, 18));
  const [streamComplete, setStreamComplete] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const time = useLiveClock();
  const isMobile = useIsMobile();
  const [streamedPlaceholder, setStreamedPlaceholder] = useState("");

  useEffect(() => {
    const full = "Ask me anything about Chirag...";
    let i = 0;
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setStreamedPlaceholder(full.slice(0, i));
        if (i >= full.length) clearInterval(interval);
      }, 38);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(startDelay);
  }, []);

  const smoothScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    const content = scrollContentRef.current;
    if (!el || !content) return;
    const observer = new ResizeObserver(() => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distFromBottom < 120) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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
    setActiveCaseStudy(null);
    setCaseStudyFullscreen(false);

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
    setTimeout(() => smoothScrollToBottom(), 80);
  }, []);

  useEffect(() => {
    smoothScrollToBottom();
  }, [activePhase, reasoningStep, streamComplete, history]);

  const allUsedTypes: ResponseType[] = [
    ...history.map((e) => e.responseType),
    ...(activePhase ? [pendingType] : []),
  ];
  const suggestedItems = navItems.filter((n) => !allUsedTypes.includes(n.id));

  const showLoader = homePhase === "loading";
  const isHomeScreen = !inChatMode;
  const isChatScreen = inChatMode;

  return (
    <div className="flex items-center justify-center h-dvh bg-white">
      {isMobile && <ThreeDotsMenu />}
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
            <button
              onClick={handleReset}
              data-testid="button-logo-home"
              style={{
                cursor: "pointer",
                position: "absolute",
                top: 19,
                left: 19,
                zIndex: 10,
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <img
                className="w-[64px] h-[26px] md:w-[86px] md:h-[34px]"
                alt="Logo"
                src="/figmaAssets/vector-22.svg"
              />
            </button>
            {!isMobile && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <ThreeDotsMenu />
              </div>
            )}
            <div className="absolute top-4 right-5 z-10">
              <ClockOrRestart time={time} onRestart={handleReset} inChatMode={false} />
            </div>

            <div
              className="absolute inset-0 flex flex-col items-center z-10 w-full px-5 hide-scrollbar"
              style={{
                gap: 0,
                overflowY: "scroll",
                WebkitOverflowScrolling: "touch" as any,
              }}
            >
              <div
                className="flex flex-col items-center w-full my-auto py-16"
                style={{
                  paddingBottom:
                    "calc(4rem + env(safe-area-inset-bottom, 0px))",
                }}
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
                  <span
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <span className="animate-hello-dark">Hello!</span>
                    <span className="animate-hello-overlay" aria-hidden="true">
                      Hello!
                    </span>
                  </span>{" "}
                  I&apos;m Chirag&apos;s portfolio AI.
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
                  <div
                    className="p-3 flex flex-col gap-2"
                    style={{ minHeight: 84 }}
                  >
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
                        placeholder={streamedPlaceholder}
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
                          <LoaderIcon
                            className={`w-5 h-5 animate-spin ${inputValue.trim() ? "text-white" : "text-[#171717]"}`}
                          />
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 16.875V3.125"
                              stroke={inputValue.trim() ? "white" : "#B3B3B3"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4.375 8.75L10 3.125L15.625 8.75"
                              stroke={inputValue.trim() ? "white" : "#B3B3B3"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center flex-wrap justify-center animate-entrance-3"
                  style={{ gap: 8, marginTop: 16 }}
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
          </div>
        ) : isChatScreen ? (
          isMobile ? (
            /* ── Mobile: normal chat + bottom sheet overlay ── */
            <div className="relative w-full h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
                <button
                  onClick={handleReset}
                  data-testid="button-logo-home"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="w-[64px] h-[26px] md:w-[86px] md:h-[34px]"
                    alt="Logo"
                    src="/figmaAssets/vector-22.svg"
                  />
                </button>
                {!isMobile && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-4">
                    <ThreeDotsMenu />
                  </div>
                )}
                <ClockOrRestart time={time} onRestart={handleReset} inChatMode={true} />
              </div>
              <div className="relative flex-1 overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, white 0%, transparent 100%)",
                  }}
                />
                <div
                  ref={scrollRef}
                  className="h-full overflow-y-auto pt-2 hide-scrollbar"
                  style={{
                    width: "100%",
                    maxWidth: "min(720px, calc(100% - 40px))",
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingBottom: 80,
                  }}
                >
                  <div ref={scrollContentRef}>
                    {history.map((entry, i) => (
                      <CompletedEntry
                        key={i}
                        entry={entry}
                        onOpen={(id) => setActiveCaseStudy(id)}
                      />
                    ))}
                    <UserBubble message={pendingQuery} />
                    {activePhase === "reasoning" && (
                      <ActiveReasoning
                        steps={reasoningSteps[pendingType]}
                        currentStep={reasoningStep}
                      />
                    )}
                    {(activePhase === "streaming" ||
                      activePhase === "done") && (
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
                          <WorkCards onOpen={(id) => setActiveCaseStudy(id)} />
                        )}
                        {pendingType === "resume" && streamComplete && (
                          <ResumeCard />
                        )}
                        {pendingType === "about" && streamComplete && (
                          <AboutImages />
                        )}
                        {streamComplete && suggestedItems.length > 0 && (
                          <div
                            className="animate-stream-line"
                            style={{ marginTop: 40 }}
                          >
                            <p
                              className="font-['Inter',sans-serif] text-[#222222] leading-6"
                              style={{ fontSize: 16 }}
                            >
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
              {activeCaseStudy && (
                <CaseStudyBottomSheet
                  studyId={activeCaseStudy}
                  view={caseStudyView}
                  onClose={() => setActiveCaseStudy(null)}
                />
              )}
            </div>
          ) : activeCaseStudy && caseStudyFullscreen ? (
            /* ── Full-screen case study ── */
            <div className="relative w-full h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
                <button
                  onClick={handleReset}
                  data-testid="button-logo-home"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="w-[64px] h-[26px] md:w-[86px] md:h-[34px]"
                    alt="Logo"
                    src="/figmaAssets/vector-22.svg"
                  />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-4">
                  <ThreeDotsMenu />
                </div>
                <ClockOrRestart time={time} onRestart={handleReset} />
              </div>
              <div
                className="flex-1 overflow-hidden"
                style={{ padding: "0 8px 8px" }}
              >
                <CaseStudyBrowser
                  studyId={activeCaseStudy}
                  fullscreen={true}
                  onToggleFullscreen={() => setCaseStudyFullscreen(false)}
                  view={caseStudyView}
                  onViewChange={setCaseStudyView}
                  onNavigate={setActiveCaseStudy}
                />
              </div>
            </div>
          ) : (
            /* ── Unified chat view (animates into 30/70 split when case study opens) ── */
            <div className="relative w-full h-full flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 relative z-20">
                <button
                  onClick={handleReset}
                  data-testid="button-logo-home"
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="w-[64px] h-[26px] md:w-[86px] md:h-[34px]"
                    alt="Logo"
                    src="/figmaAssets/vector-22.svg"
                  />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-4">
                  <ThreeDotsMenu />
                </div>
                <ClockOrRestart time={time} onRestart={handleReset} />
              </div>
              <div
                className="flex-1 overflow-hidden"
                style={{ minHeight: 0, position: "relative" }}
              >
                {/* Left: chat panel */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: activeCaseStudy ? "30%" : "100%",
                    transition: "width 0.38s ease-out",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, white 0%, transparent 100%)",
                    }}
                  />
                  <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto hide-scrollbar"
                    style={
                      activeCaseStudy
                        ? {
                            paddingLeft: 40,
                            paddingRight: 24,
                            paddingTop: 4,
                            paddingBottom: 80,
                          }
                        : {
                            width: "100%",
                            maxWidth: "min(720px, calc(100% - 40px))",
                            marginLeft: "auto",
                            marginRight: "auto",
                            paddingTop: 8,
                            paddingBottom: 80,
                          }
                    }
                  >
                    <div ref={scrollContentRef}>
                      {history.map((entry, i) => (
                        <CompletedEntry
                          key={i}
                          entry={entry}
                          onOpen={(id) => {
                            setActiveCaseStudy(id);
                            setCaseStudyFullscreen(false);
                          }}
                          selectedId={activeCaseStudy}
                          singleColumn={!!activeCaseStudy}
                        />
                      ))}

                      <UserBubble message={pendingQuery} />

                      {activePhase === "reasoning" && (
                        <ActiveReasoning
                          steps={reasoningSteps[pendingType]}
                          currentStep={reasoningStep}
                        />
                      )}

                      {(activePhase === "streaming" ||
                        activePhase === "done") && (
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
                            <WorkCards
                              singleColumn={!!activeCaseStudy}
                              selectedId={activeCaseStudy}
                              onOpen={(id) => {
                                setActiveCaseStudy(id);
                                setCaseStudyFullscreen(false);
                              }}
                            />
                          )}

                          {pendingType === "resume" && streamComplete && (
                            <ResumeCard />
                          )}

                          {pendingType === "about" && streamComplete && (
                            <AboutImages />
                          )}

                          {streamComplete && suggestedItems.length > 0 && (
                            <div
                              className="animate-stream-line"
                              style={{ marginTop: 40 }}
                            >
                              <p
                                className="font-['Inter',sans-serif] text-[#222222] leading-6"
                                style={{ fontSize: 16, lineHeight: "24px" }}
                              >
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

                {/* Right: browser panel — slides in with transform (GPU-accelerated, no reflow) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "70%",
                    transform: activeCaseStudy
                      ? "translateX(0)"
                      : "translateX(100%)",
                    transition: "transform 0.38s ease-out",
                    overflow: "hidden",
                    willChange: "transform",
                  }}
                >
                  <CaseStudyBrowser
                    studyId={activeCaseStudy ?? caseStudies[0].id}
                    fullscreen={false}
                    onToggleFullscreen={() => setCaseStudyFullscreen(true)}
                    onClose={() => setActiveCaseStudy(null)}
                    view={caseStudyView}
                    onViewChange={setCaseStudyView}
                    onNavigate={setActiveCaseStudy}
                  />
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};
