import { InProgressState } from "@/components/features/InProgressState";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

export default function InProgressPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <MarketingHeader />
      <main className="mx-auto flex w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-12 lg:py-24">
        <InProgressState
          title="This Page Is In Progress"
          description="This surface is not fully implemented yet. We are actively building it and wiring backend data, actions, and governance controls."
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
