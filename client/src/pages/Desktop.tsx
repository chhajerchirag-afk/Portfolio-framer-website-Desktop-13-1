import {
  ArrowUpIcon,
  BriefcaseIcon,
  FileTextIcon,
  MonitorIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const navigationItems = [
  {
    icon: MonitorIcon,
    label: "Work",
  },
  {
    icon: UserIcon,
    label: "About",
  },
  {
    icon: BriefcaseIcon,
    label: "Experience",
  },
  {
    icon: FileTextIcon,
    label: "Resume",
  },
];

export const Desktop = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-5">
      <Card className="w-full max-w-[1400px] h-[984px] relative overflow-hidden rounded-[20px] border-[0.5px] border-neutral-200 shadow-[0px_2px_8px_#00000014] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[20px] before:[background:linear-gradient(180deg,rgba(240,240,240,1)_0%,rgba(229,229,229,0)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
        <CardContent className="p-0 h-full relative">
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

          <div className="absolute top-4 right-4 [font-family:'JetBrains_Mono',Helvetica] font-medium text-[#b7b7b7] text-sm tracking-[-0.28px] leading-4 whitespace-nowrap z-10">
            Mon 23 FEB 23:45
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-8 z-10">
            <h1 className="[font-family:'Inter',Helvetica] font-normal text-neutral-900 text-[32px] tracking-[-0.64px] leading-10 whitespace-nowrap">
              Hey, Welcome to Chirag Chhajer&apos;s Portfolio
            </h1>

            <Card className="w-[720px] bg-white rounded-2xl border-[0.5px] border-neutral-200 shadow-[0px_2px_8px_#00000014]">
              <CardContent className="p-3 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2.5 w-full">
                  <SearchIcon className="w-5 h-5 text-[#a5a5a5]" />
                  <Input
                    placeholder="Ask me anything about Chirag..."
                    className="flex-1 border-0 shadow-none p-0 h-auto [font-family:'Inter',Helvetica] font-normal text-[#a5a5a5] text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-auto w-auto p-1 rounded-full hover:bg-neutral-100"
                >
                  <ArrowUpIcon className="w-4 h-4 text-neutral-600" />
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto inline-flex items-center justify-center gap-1.5 px-2 py-1 bg-white rounded-[999px] border-[0.5px] border-[#e0e0e0] shadow-[0px_2px_6px_#0000000f] hover:bg-neutral-50"
                  >
                    <IconComponent className="w-[18px] h-[18px]" />
                    <span className="[font-family:'Inter',Helvetica] font-normal text-neutral-900 text-sm tracking-[0] leading-5 whitespace-nowrap">
                      {item.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
