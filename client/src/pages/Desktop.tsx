import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrainIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LoaderIcon,
} from "lucide-react";

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
  subtitle?: string;
  description?: string;
  highlight?: string;
  duration?: string;
  bullets?: string[];
}

const responseBlocks: Record<ResponseType, ResponseBlock[]> = {
  work: [
    { type: "paragraph", text: "\u003Cb\u003EHere\u2019s a compilation of Chirag\u2019s work.\u003C/b\u003E It includes projects from Sense, Gistr, and Nudge Lab, focusing on solving complex product problems. Some of his most impactful work includes:" },
    { type: "break" },
    { type: "numbered-item", text: "AI Agents for HR Teams", description: "Designing AI agents that help HR Admins and Recruiters configure talent engagement workflows with significantly less effort and time." },
    { type: "numbered-item", text: "Reimagining AI Experiences", description: "Simplifying how users interact with AI systems, making learning, discovery, and adoption more intuitive." },
    { type: "numbered-item", text: "Interview Scheduling for Talent Acquisition", description: "Streamlining the scheduling process for recruiters and hiring managers to reduce coordination friction." },
    { type: "numbered-item", text: "Visual Design Explorations", description: "" },
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
    { type: "experience-role", text: "Product Designer", subtitle: "Sense", duration: "2022 \u2013 Present", highlight: "Sense", description: "Working on AI-powered HR products, leading design for features like AI Agents, Interview Scheduling, and talent engagement platforms.", bullets: ["Designed end-to-end AI agent workflows for HR Admins and Recruiters", "Led the redesign of Sense\u2019s AI experience to improve usability and adoption", "Shipped Interview Scheduling module used by enterprise recruiting teams", "Collaborated with PMs and Engineers to define product strategy and ship fast"] },
    { type: "experience-role", text: "Product Designer", subtitle: "Gistr", duration: "2021 \u2013 2022", highlight: "Gistr", description: "Designed AI-assisted research tools for legal professionals, establishing the product\u2019s visual language and core UX patterns from the ground up.", bullets: ["Built the MVP design system and interaction patterns for the platform", "Simplified complex legal research workflows into intuitive experiences", "Worked closely with founders to define product direction and user flows"] },
    { type: "experience-role", text: "UX Designer", subtitle: "Nudge Lab", duration: "2020 \u2013 2021", highlight: "Nudge Lab", description: "Worked on an AI-powered cybersecurity platform, helping define the MVP and core user flows.", bullets: ["Designed dashboards and alert systems for security analysts", "Made complex cybersecurity data accessible to non-technical users", "Contributed to product-market fit explorations in early-stage startup environment"] },
  ],
  resume: [
    { type: "paragraph", text: "\u003Cb\u003EChirag\u2019s resume is ready for download.\u003C/b\u003E" },
    { type: "break" },
    { type: "paragraph", text: "It covers his work across AI products, HR Tech, LegalTech, and Cybersecurity \u2014 including case studies, key outcomes, and the tools he works with." },
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
      const timer = setTimeout(() => setWordCount((c) => c + 1), 20);
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
  if (block.type === "numbered-item") return `${block.text || ""} ${block.description || ""}`.trim();
  if (block.type === "bullet") return block.text || "";
  if (block.type === "experience-role") {
    const parts = [
      `${block.text} \u2014 ${block.subtitle} \u00B7 ${block.duration}`,
      block.description || "",
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
        return <p><span className="font-semibold">{boldWords.slice(0, visibleWords).join(" ")}</span></p>;
      }
      const remainingWords = afterBold.split(/\s+/).filter(Boolean);
      const remainingVisible = visibleWords - boldWords.length;
      return <p><span className="font-semibold">{boldText}</span> {remainingWords.slice(0, remainingVisible).join(" ")}</p>;
    }
    return <p>{shown}</p>;
  }
  if (block.type === "heading") {
    const words = (block.text || "").split(/\s+/).filter(Boolean);
    return <p className="font-semibold">{words.slice(0, visibleWords).join(" ")}</p>;
  }
  if (block.type === "numbered-item") {
    const titleWords = (block.text || "").split(/\s+/).filter(Boolean);
    const descWords = (block.description || "").split(/\s+/).filter(Boolean);
    if (visibleWords <= titleWords.length) {
      return (
        <div className="ml-6 mb-1">
          <span className="font-semibold">{titleWords.slice(0, visibleWords).join(" ")}</span>
        </div>
      );
    }
    const descVisible = visibleWords - titleWords.length;
    return (
      <div className="ml-6 mb-1">
        <span className="font-semibold">{block.text}</span>
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
  const headerText = `${block.text} \u2014 ${block.subtitle} \u00B7 ${block.duration}`;
  const headerWords = headerText.split(/\s+/).filter(Boolean);
  const descWords = (block.description || "").split(/\s+/).filter(Boolean);
  const bulletTexts = block.bullets || [];
  const allBulletWords = bulletTexts.map(b => b.split(/\s+/).filter(Boolean));

  let remaining = visibleWords;

  const headerVisible = Math.min(remaining, headerWords.length);
  remaining -= headerVisible;

  const descVisible = Math.min(remaining, descWords.length);
  remaining -= descVisible;

  const bulletVisibles: number[] = [];
  for (const bw of allBulletWords) {
    const bv = Math.min(remaining, bw.length);
    bulletVisibles.push(bv);
    remaining -= bv;
  }

  const headerShown = headerWords.slice(0, headerVisible).join(" ");

  return (
    <div className="mb-8">
      <p className="font-semibold">
        {headerVisible >= headerWords.length ? (
          <>
            {block.text} {"\u2014"} <span style={{ backgroundColor: "#e6f4f7", padding: "0 2px" }}>{block.subtitle}</span>{" "}
            <span className="font-normal text-[#a1a1a1]">{"\u00B7"} {block.duration}</span>
          </>
        ) : (
          headerShown
        )}
      </p>
      {descVisible > 0 && (
        <p className="mt-1">{descWords.slice(0, descVisible).join(" ")}</p>
      )}
      {bulletVisibles.some(v => v > 0) && (
        <ul className="list-disc pl-6 mt-2 space-y-1">
          {bulletTexts.map((bt, i) => {
            if (bulletVisibles[i] <= 0) return null;
            const words = bt.split(/\s+/).filter(Boolean);
            return <li key={i}>{words.slice(0, bulletVisibles[i]).join(" ")}</li>;
          })}
        </ul>
      )}
    </div>
  );
}

function StaticBlockText({ blocks }: { blocks: ResponseBlock[] }) {
  return (
    <div className="text-[#222222] text-base leading-6 font-['Inter',sans-serif] font-normal" style={{ letterSpacing: 0 }}>
      {blocks.map((block, i) => (
        <RenderBlock key={i} block={block} visibleWords={999} />
      ))}
    </div>
  );
}

function WorkCards() {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6 animate-stream-line">
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
      <div
        className="rounded-2xl bg-[#f9f9f9] overflow-hidden"
        style={{ border: "0.5px solid #e8e8e8" }}
        data-testid="card-resume-preview"
      >
        <div className="px-8 pt-8 pb-6 font-['Inter',sans-serif]">
          <h2 className="text-[28px] font-semibold text-[#171717] leading-tight tracking-tight">
            Chirag Chhajer
          </h2>
          <p className="text-sm text-[#6b8cce] mt-1.5 leading-5">
            <a href="mailto:chhajerchirag@gmail.com" className="hover:underline">chhajerchirag@gmail.com</a>
            <span className="text-[#a1a1a1] mx-1.5">{"\u2022"}</span>
            <span className="text-[#a1a1a1]">+91 9038411547</span>
            <span className="text-[#a1a1a1] mx-1.5">{"\u2022"}</span>
            <a href="https://chiragchhajer.designfolio.me" target="_blank" rel="noopener noreferrer" className="hover:underline">chiragchhajer.designfolio.me</a>
            <span className="text-[#a1a1a1] mx-1.5">{"\u2022"}</span>
            <a href="https://linkedin.com/in/chirag-chhajer/" target="_blank" rel="noopener noreferrer" className="hover:underline">linkedin.com/in/chirag-chhajer/</a>
          </p>

          <div className="mt-5">
            <p className="text-xs font-bold text-[#171717] tracking-wide uppercase">Summary</p>
            <div className="h-px bg-[#d4d4d4] mt-1.5 mb-3" />
            <p className="text-[13px] text-[#3a3a3a] leading-5">
              Product Designer with 3+ years of experience designing end-to-end features for AI-powered B2B SaaS and consumer products. Strong in feature-level ownership, systems thinking, and rapid experimentation to drive adoption, engagement, and retention. Experienced partnering cross-functionally with product, engineering, and content from concept to launch. Focused on building simple, scalable, and trustworthy AI-native experiences.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold text-[#171717] tracking-wide uppercase">Experience</p>
            <div className="h-px bg-[#d4d4d4] mt-1.5 mb-3" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] font-semibold text-[#171717]">Product Designer</p>
                <p className="text-[13px] text-[#a1a1a1]">Sense HQ | Talent Engagement Platform</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-[13px] font-semibold text-[#171717]">May 2025 - Present</p>
                <p className="text-[13px] text-[#a1a1a1]">Bengaluru, India, On-site</p>
              </div>
            </div>
            <p className="text-[13px] text-[#3a3a3a] leading-5 mt-1.5 flex items-start gap-1.5">
              <span className="text-[#a1a1a1] mt-0.5 flex-shrink-0">{"\u2022"}</span>
              <span>Own feature-level design for a flagship AI product enabling recruiters to conversationally create chatbots and voice...</span>
            </p>
          </div>
        </div>

        <div
          className="relative h-12"
          style={{
            background: "linear-gradient(to top, #f9f9f9 0%, transparent 100%)",
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <a
          href="#"
          data-testid="button-download-resume"
          className="bg-[#171717] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors font-['Inter',sans-serif]"
          onClick={(e) => e.preventDefault()}
        >
          Download Resume
        </a>
        <span className="text-[#a1a1a1] text-sm font-['Inter',sans-serif]">
          PDF {"\u00B7"} Updated 2025
        </span>
      </div>
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

  return (
    <div style={{ marginTop: 20 }}>
      <button
        className="flex items-center gap-1.5 mb-3 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
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
          maxHeight: collapsed ? 0 : 500,
          opacity: collapsed ? 0 : 1,
          transition: "max-height 0.3s ease, opacity 0.2s ease",
        }}
      >
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
    <div className="flex justify-end mt-6">
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
  const inputRef = useRef<HTMLInputElement>(null);
  const time = useLiveClock();

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
    if (scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
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
                {history.map((entry, i) => (
                  <CompletedEntry key={i} entry={entry} />
                ))}

                <UserBubble message={pendingQuery} />

                {activePhase === "loading" && (
                  <div style={{ marginTop: 20 }}>
                    <div className="flex items-center gap-2">
                      <LoaderIcon className="w-4 h-4 text-[#a1a1a1] animate-spin flex-shrink-0" />
                      <span className="font-['Inter',sans-serif] text-[#a1a1a1] text-sm leading-5">
                        Chirag's AI is thinking...
                      </span>
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
                      <div className="mt-10 animate-stream-line">
                        <p className="font-['Inter',sans-serif] text-[#222222] leading-6" style={{ fontSize: 16, lineHeight: "24px" }}>
                          More Options
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
        ) : null}
      </div>
    </div>
  );
};
