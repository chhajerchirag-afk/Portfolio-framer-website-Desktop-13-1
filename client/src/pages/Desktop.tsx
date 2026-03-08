import { useState, useEffect, useRef } from "react";
import { BrainIcon, ChevronRightIcon, SendIcon, RotateCcwIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ResponseType = "work" | "about" | "experience" | "resume" | "out-of-scope";

interface ChatState {
  userMessage: string;
  responseType: ResponseType;
}

const navItems = [
  {
    id: "work" as ResponseType,
    label: "Work",
    iconSrc: "/figmaAssets/desktoptower.svg",
    query: "Show me the best work by Chirag",
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
    query: "What's Chirag's experience?",
  },
  {
    id: "resume" as ResponseType,
    label: "Resume",
    iconSrc: "/figmaAssets/readcvlogo.svg",
    query: "Download Chirag's resume",
  },
];

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
      className="bg-white border border-[#e0e0e0] flex gap-1.5 items-center justify-center px-2 py-1 rounded-full shadow-[0px_2px_6px_rgba(0,0,0,0.06)] hover:bg-neutral-50 transition-colors cursor-pointer"
    >
      <img src={item.iconSrc} alt={item.label} className="w-[18px] h-[18px]" />
      <span className="font-['Inter',sans-serif] font-normal text-[#171717] text-sm leading-5 whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
}

function WorkResponse() {
  return (
    <div className="text-[#222] text-base leading-6 font-['Inter',sans-serif]">
      <p>
        <span className="font-semibold">Here's a compilation of Chirag's work.</span>
        {" "}It includes projects from Sense, Gistr, and Nudge Lab, focusing on solving complex product problems. Some of his most impactful work includes:
      </p>
      <br />
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          <span className="font-semibold">AI Agents for HR Teams</span>
          <br />
          Designing AI agents that help HR Admins and Recruiters configure talent engagement workflows with significantly less effort and time.
        </li>
        <li>
          <span className="font-semibold">Reimagining AI Experiences</span>
          <br />
          Simplifying how users interact with AI systems, making learning, discovery, and adoption more intuitive.
        </li>
        <li>
          <span className="font-semibold">Interview Scheduling for Talent Acquisition</span>
          <br />
          Streamlining the scheduling process for recruiters and hiring managers to reduce coordination friction.
        </li>
        <li>
          <span className="font-semibold">Visual Design Explorations</span>
        </li>
      </ol>
      <br />
      <p>Beyond this, Chirag has also worked on:</p>
      <ul className="list-disc pl-6 mt-2">
        <li>
          Simplifying <span className="font-semibold">research for legal professionals</span> and establishing the MVP for an{" "}
          <span className="font-semibold">AI-powered cybersecurity platform.</span>
        </li>
      </ul>
      <br />
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="border-2 border-[#f0f0f0] rounded-xl h-[220px] bg-white" />
        <div className="border-2 border-[#f0f0f0] rounded-xl h-[220px] bg-white" />
        <div className="border-2 border-[#f0f0f0] rounded-xl h-[220px] bg-white" />
        <div className="border-2 border-[#f0f0f0] rounded-xl h-[220px] bg-white" />
        <div className="border-2 border-[#f0f0f0] rounded-xl h-[70px] bg-white" />
        <div className="border-2 border-[#f0f0f0] rounded-xl h-[70px] bg-white" />
      </div>
    </div>
  );
}

function AboutResponse() {
  return (
    <div className="text-[#222] text-base leading-6 font-['Inter',sans-serif]">
      <p>
        <span className="font-semibold">Hey, I'm Chirag Chhajer — a Product Designer.</span>
      </p>
      <br />
      <p>
        I specialize in designing AI-powered products that are intuitive, impactful, and grounded in real user needs. I believe great design is equal parts empathy, craft, and systems thinking.
      </p>
      <br />
      <p>Over the past few years, I've worked on:</p>
      <ul className="list-disc pl-6 mt-2 space-y-2">
        <li>Building end-to-end AI product experiences from 0 to 1</li>
        <li>Designing for complex workflows in HR Tech, LegalTech, and Cybersecurity</li>
        <li>Creating design systems that scale across teams and platforms</li>
        <li>Collaborating closely with PMs and engineers to ship high-quality work</li>
      </ul>
      <br />
      <p>
        When I'm not designing, I'm usually exploring new AI tools, sketching interfaces, or thinking about how to make complex things feel simple.
      </p>
    </div>
  );
}

function ExperienceResponse() {
  return (
    <div className="text-[#222] text-base leading-6 font-['Inter',sans-serif]">
      <p>
        <span className="font-semibold">Here's a summary of Chirag's professional experience.</span>
      </p>
      <br />
      <div className="space-y-6">
        <div>
          <p className="font-semibold">Product Designer — Sense <span className="font-normal text-[#a1a1a1]">· 2022 – Present</span></p>
          <p className="mt-1">
            Leading design for AI-powered HR products including AI Agents, Interview Scheduling, and talent engagement platforms. Driving end-to-end design from research to high-fidelity delivery.
          </p>
        </div>
        <div>
          <p className="font-semibold">Product Designer — Gistr <span className="font-normal text-[#a1a1a1]">· 2021 – 2022</span></p>
          <p className="mt-1">
            Designed AI-assisted research tools for legal professionals. Established the visual language and UX patterns for the platform from the ground up.
          </p>
        </div>
        <div>
          <p className="font-semibold">UX Designer — Nudge Lab <span className="font-normal text-[#a1a1a1]">· 2020 – 2021</span></p>
          <p className="mt-1">
            Worked on an AI-powered cybersecurity platform, helping define the MVP and core user flows. Focused on making complex security data accessible to non-technical users.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResumeResponse() {
  return (
    <div className="text-[#222] text-base leading-6 font-['Inter',sans-serif]">
      <p>
        <span className="font-semibold">Chirag's resume is ready for download.</span>
      </p>
      <br />
      <p>
        It covers his work across AI products, HR Tech, LegalTech, and Cybersecurity — including case studies, key outcomes, and the tools he works with.
      </p>
      <br />
      <div className="border-2 border-[#f0f0f0] rounded-xl p-6 bg-white inline-flex flex-col gap-4 items-start">
        <div>
          <p className="font-semibold text-[#171717]">Chirag Chhajer — Product Designer</p>
          <p className="text-[#a1a1a1] text-sm mt-0.5">PDF · Updated 2025</p>
        </div>
        <a
          href="#"
          data-testid="button-download-resume"
          className="bg-[#171717] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          Download Resume
        </a>
      </div>
      <br />
      <br />
      <p className="text-[#a1a1a1] text-sm">
        Want a specific format? Feel free to reach out directly.
      </p>
    </div>
  );
}

function OutOfScopeResponse() {
  return (
    <div className="text-[#222] text-base leading-6 font-['Inter',sans-serif]">
      <p className="font-semibold">Sorry! That request is currently out of scope.</p>
      <br />
      <p>
        Chirag believes in phase-by-phase development, and this feature didn't make it into the initial PRD 😅.
      </p>
      <br />
      <p>For now, this AI can help you with a few things:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Learn about Chirag</li>
        <li>Explore his work</li>
        <li>See his experience</li>
        <li>Download his resume</li>
      </ul>
      <br />
      <p>Try one of those prompts — they're fully shipped. 🚀</p>
    </div>
  );
}

function getResponseType(input: string): ResponseType {
  const lower = input.toLowerCase();
  if (lower.includes("work") || lower.includes("project") || lower.includes("portfolio") || lower.includes("best")) return "work";
  if (lower.includes("about") || lower.includes("who") || lower.includes("chirag") || lower.includes("tell")) return "about";
  if (lower.includes("experience") || lower.includes("job") || lower.includes("career") || lower.includes("worked")) return "experience";
  if (lower.includes("resume") || lower.includes("cv") || lower.includes("download")) return "resume";
  return "out-of-scope";
}

function getStepsText(responseType: ResponseType): string {
  const steps: Record<ResponseType, string> = {
    work: "4 steps completed",
    about: "3 steps completed",
    experience: "3 steps completed",
    resume: "2 steps completed",
    "out-of-scope": "1 step completed",
  };
  return steps[responseType];
}

function useLiveClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${day} ${date} ${month} ${hours}:${minutes}`;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${day} ${date} ${month} ${hours}:${minutes}`);
    }, 30000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export const Desktop = (): JSX.Element => {
  const [chat, setChat] = useState<ChatState | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const time = useLiveClock();

  function handleSubmit(query: string) {
    if (!query.trim()) return;
    setIsThinking(true);
    const responseType = getResponseType(query);
    setTimeout(() => {
      setChat({ userMessage: query, responseType });
      setIsThinking(false);
      setInputValue("");
    }, 800);
  }

  function handleReset() {
    setChat(null);
    setInputValue("");
    setIsThinking(false);
  }

  useEffect(() => {
    if (chat && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [chat]);

  const suggestedItems = chat
    ? navItems.filter((n) => n.id !== chat.responseType)
    : navItems;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-5">
      <div
        className="w-full max-w-[1400px] relative overflow-hidden rounded-[20px] border-[0.5px] border-neutral-200 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]"
        style={{ minHeight: 984 }}
      >
        {!chat && !isThinking ? (
          /* ── HOME SCREEN ── */
          <div className="relative w-full h-full min-h-[984px]">
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
            <div className="absolute top-4 right-4 font-['JetBrains_Mono',monospace] font-medium text-[#b7b7b7] text-sm tracking-[-0.28px] leading-4 whitespace-nowrap z-10">
              {time}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-8 z-10 w-full px-8">
              <h1 className="font-['Inter',sans-serif] font-normal text-[#171717] text-[32px] tracking-[-0.64px] leading-10 whitespace-nowrap text-center">
                Hey, Welcome to Chirag Chhajer&apos;s Portfolio
              </h1>
              <div
                className="w-full max-w-[720px] bg-white rounded-2xl border-[0.5px] border-neutral-200 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]"
              >
                <div className="p-3 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2.5 w-full">
                    <img src="/figmaAssets/magnifyingglass.svg" alt="search" className="w-5 h-5 flex-shrink-0" />
                    <input
                      data-testid="input-query"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(inputValue)}
                      placeholder="Ask me anything about Chirag..."
                      className="flex-1 border-0 shadow-none p-0 h-auto font-['Inter',sans-serif] font-normal text-[#a5a5a5] text-base focus:outline-none bg-transparent placeholder:text-[#a5a5a5]"
                    />
                  </div>
                  <button
                    data-testid="button-submit"
                    onClick={() => handleSubmit(inputValue)}
                    className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <img src="/figmaAssets/frame-103.svg" alt="send" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {navItems.map((item) => (
                  <NavPill
                    key={item.id}
                    item={item}
                    onClick={() => handleSubmit(item.query)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── CHAT SCREEN ── */
          <div className="relative w-full flex flex-col min-h-[984px] bg-white rounded-[20px]">
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
              <img
                className="w-[86px] h-[34px]"
                alt="Logo"
                src="/figmaAssets/vector-22.svg"
              />
              <div className="font-['JetBrains_Mono',monospace] font-medium text-[#b8b8b8] text-sm tracking-[-0.24px] leading-4 whitespace-nowrap">
                {time}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-8">
              <div className="max-w-[1060px] mx-auto">
                {isThinking ? (
                  <div className="flex justify-end mt-4">
                    <div className="bg-[#f0f0f0] px-4 py-2 rounded-xl max-w-[600px]">
                      <p className="font-['Inter',sans-serif] text-[#171717] text-base leading-6">
                        {inputValue || "..."}
                      </p>
                    </div>
                  </div>
                ) : chat ? (
                  <>
                    <div className="flex justify-end mt-4">
                      <div className="bg-[#f0f0f0] px-4 py-2 rounded-xl max-w-[600px]">
                        <p className="font-['Inter',sans-serif] text-[#171717] text-base leading-6">
                          {chat.userMessage}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center gap-1.5 mb-4">
                        <BrainIcon className="w-5 h-5 text-[#a1a1a1]" />
                        <span className="font-['Inter',sans-serif] text-[#a1a1a1] text-base leading-6">
                          {getStepsText(chat.responseType)}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 text-[#a1a1a1]" />
                      </div>

                      {chat.responseType === "work" && <WorkResponse />}
                      {chat.responseType === "about" && <AboutResponse />}
                      {chat.responseType === "experience" && <ExperienceResponse />}
                      {chat.responseType === "resume" && <ResumeResponse />}
                      {chat.responseType === "out-of-scope" && <OutOfScopeResponse />}
                    </div>

                    <div className="mt-10">
                      <p className="font-['Inter',sans-serif] text-[#222] text-base leading-6 mb-3">
                        Suggested Prompts:
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {suggestedItems.map((item) => (
                          <NavPill
                            key={item.id}
                            item={item}
                            onClick={() => handleSubmit(item.query)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="border-t border-neutral-100 px-5 py-4 flex-shrink-0 bg-white">
              <div className="max-w-[1060px] mx-auto">
                <div className="bg-white rounded-2xl border-[0.5px] border-neutral-200 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
                  <div className="p-3 flex items-center gap-2.5">
                    <img src="/figmaAssets/magnifyingglass.svg" alt="search" className="w-5 h-5 flex-shrink-0" />
                    <input
                      data-testid="input-followup"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(inputValue)}
                      placeholder="Ask me anything about Chirag..."
                      className="flex-1 border-0 shadow-none p-0 h-auto font-['Inter',sans-serif] font-normal text-[#a5a5a5] text-base focus:outline-none bg-transparent placeholder:text-[#a5a5a5]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        data-testid="button-reset"
                        onClick={handleReset}
                        className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                        title="Start over"
                      >
                        <RotateCcwIcon className="w-4 h-4 text-neutral-500" />
                      </button>
                      <button
                        data-testid="button-send"
                        onClick={() => handleSubmit(inputValue)}
                        className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                      >
                        <img src="/figmaAssets/frame-103.svg" alt="send" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
