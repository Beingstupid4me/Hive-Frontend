import { InProgressState } from "@/components/features/InProgressState";

export default function TerminalSettingsPage() {
  return (
    <div className="space-y-6">
      <InProgressState
        title="Terminal Settings Is In Progress"
        description="Settings controls are being implemented with user preferences, auth-scoped policies, and environment-aware defaults."
      />
    </div>
  );
}
