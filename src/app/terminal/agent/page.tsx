"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { apiPost, isDummyEnabled } from "@/lib/api/http";
import { useApiResource } from "@/lib/hooks/useApiResource";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { metricsSnapshotFallback } from "@/lib/api/fallbacks";
import type {
  AgentQueryRequest,
  AgentQueryResponse,
  MetricsSnapshotResponse,
} from "@/lib/api/types";

type CardColor = "primary" | "gold";

type DashboardCard = {
  title: string;
  value: string;
  sub: string;
  progress: number;
  color: CardColor;
};

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function formatSigned(value: number, digits = 2): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/[\*_`>#-]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type AgentStreamMessage = {
  type?: "start" | "token" | "done" | "error";
  channel?: "brief" | "query";
  token?: string;
  message?: string;
  suggested_command?: string;
};

export default function AgentPage() {
  const dummyEnabled = isDummyEnabled();
  const { data, error } = useApiResource<MetricsSnapshotResponse>("/metrics/snapshot", {
    initialData: metricsSnapshotFallback,
    refreshMs: 15_000,
  });

  const agent = data.agent;

  const dashboardCards: DashboardCard[] = useMemo(() => {
    if (dummyEnabled) {
      return [
        { title: "Current Regime (HMM)", value: "N/A", sub: "N/A", progress: 0, color: "primary" },
        { title: "Alpha Signal Strength", value: "N/A", sub: "N/A", progress: 0, color: "primary" },
        { title: "Rotation Index", value: "N/A", sub: "N/A", progress: 0, color: "gold" },
      ];
    }

    return [
      {
        title: "Current Regime (HMM)",
        value: agent.regime_label,
        sub: `${formatSigned(agent.regime_sigma_change_pct, 2)}% sigma`,
        progress: clampProgress(Math.abs(agent.regime_sigma_change_pct) * 4),
        color: "primary",
      },
      {
        title: "Alpha Signal Strength",
        value: agent.alpha_signal_strength.toFixed(3),
        sub: `${formatSigned(agent.alpha_signal_change_pct, 2)}%`,
        progress: clampProgress(agent.alpha_signal_strength * 100),
        color: "primary",
      },
      {
        title: "Rotation Index",
        value: agent.rotation_label,
        sub: `${agent.rotation_rate_pct_per_day.toFixed(2)}% p/d`,
        progress: clampProgress(agent.rotation_rate_pct_per_day * 4),
        color: "gold",
      },
    ];
  }, [
    agent.alpha_signal_change_pct,
    agent.alpha_signal_strength,
    agent.regime_label,
    agent.regime_sigma_change_pct,
    agent.rotation_label,
    agent.rotation_rate_pct_per_day,
    dummyEnabled,
  ]);

  const [displayedText, setDisplayedText] = useState(
    dummyEnabled ? "N/A" : stripMarkdown(agent.daily_brief_markdown),
  );
  const [chatInput, setChatInput] = useState("");
  const [queryReply, setQueryReply] = useState("");
  const [suggestedCommand, setSuggestedCommand] = useState(agent.suggested_command);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    if (dummyEnabled) {
      setDisplayedText("N/A");
      setSuggestedCommand("N/A");
      return;
    }

    setDisplayedText(stripMarkdown(agent.daily_brief_markdown));
    setSuggestedCommand(agent.suggested_command);
  }, [agent.daily_brief_markdown, agent.suggested_command, dummyEnabled]);

  const handleStreamMessage = useCallback((payload: AgentStreamMessage) => {
    if (payload.type === "start" && payload.channel === "brief") {
      setDisplayedText("");
      return;
    }

    if (payload.type === "start" && payload.channel === "query") {
      setQueryReply("");
      setIsQuerying(true);
      return;
    }

    if (payload.type === "token" && payload.channel === "brief" && payload.token) {
      setDisplayedText((prev) => `${prev}${payload.token}`);
      return;
    }

    if (payload.type === "token" && payload.channel === "query" && payload.token) {
      setQueryReply((prev) => `${prev}${payload.token}`);
      return;
    }

    if (payload.type === "done") {
      if (payload.suggested_command) {
        setSuggestedCommand(payload.suggested_command);
      }
      if (payload.channel === "query") {
        setIsQuerying(false);
      }
      return;
    }

    if (payload.type === "error") {
      setQueryReply(payload.message ?? "Streaming error");
      setIsQuerying(false);
    }
  }, []);

  const stream = useWebSocket<AgentStreamMessage, { query: string }>("/api/agent/stream/ws", {
    onMessage: handleStreamMessage,
  });

  const heatmapData =
    agent.regime_heatmap.length > 0
      ? agent.regime_heatmap
          .sort((a, b) => a.y - b.y || a.x - b.x)
          .map((cell) => {
            if (cell.state === "Bull") {
              return "primary";
            }
            if (cell.state === "Bear") {
              return "magenta";
            }
            return cell.intensity > 0.55 ? "gold" : "surface-hover";
          })
      : Array.from({ length: 72 }, () => "surface-hover");

  const workerStream = agent.worker_stream.slice(-24);
  const agentTools = agent.tools.map((tool) => tool.tool);

  async function submitQuery(): Promise<void> {
    if (!chatInput.trim()) {
      return;
    }

    if (dummyEnabled) {
      setQueryReply("N/A (dummy mode)");
      return;
    }

    const query = chatInput.trim();
    if (stream.connected) {
      setIsQuerying(true);
      const sent = stream.send({ query });
      if (sent) {
        setChatInput("");
        return;
      }
      setIsQuerying(false);
    }

    try {
      setIsQuerying(true);
      const payload: AgentQueryRequest = { query };
      const response = await apiPost<AgentQueryRequest, AgentQueryResponse>("/agent/query", payload);
      setQueryReply(response.answer);
      setSuggestedCommand(response.suggested_command);
      setChatInput("");
    } catch {
      setQueryReply("Agent query failed. Please retry.");
    } finally {
      setIsQuerying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight italic">Fin-OSS Agent</h1>
          <p className="text-xs text-text-tertiary text-mono mt-1">AI-Powered Quantitative Intelligence</p>
          {error ? <p className="text-[10px] text-gold text-mono mt-1">Using fallback data ({error})</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-mono",
            dummyEnabled ? "bg-surface-hover text-text-tertiary" : stream.connected ? "bg-primary/10 text-primary" : "bg-gold/10 text-gold",
          )}>
            <Bot className="w-3 h-3" /> {dummyEnabled ? "Dummy Data" : "Live Inference"}
          </span>
        </div>
      </motion.div>

      {/* Dashboard Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dashboardCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4">
              <p className="label mb-2">{card.title}</p>
              <p className={cn("text-xl font-black text-mono", card.color === "gold" ? "text-gold" : "text-primary")}>{card.value}</p>
              <p className="text-xs text-text-tertiary text-mono mt-0.5">{card.sub}</p>
              <div className="mt-3 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div className={cn("h-full rounded-full", card.color === "gold" ? "bg-gold" : "bg-primary")} style={{ width: `${card.progress}%` }} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agent Synthesis */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Quantitative Brief</CardTitle>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-lg border border-border text-[10px] font-bold text-text-tertiary text-mono uppercase hover:text-text-primary hover:border-border-accent transition-colors">
              Export
            </button>
            <button className="px-3 py-1 rounded-lg bg-primary text-text-inverse text-[10px] font-bold text-mono uppercase">
              Execute
            </button>
          </div>
        </CardHeader>
        <div className="prose prose-invert max-w-none">
          <p className="text-sm text-text-secondary leading-relaxed italic">
            {displayedText}
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse-slow" />
          </p>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-surface-hover border border-border">
          <p className="text-[10px] text-text-tertiary text-mono mb-1">SUGGESTED COMMAND</p>
          <code className="text-xs text-primary text-mono">{suggestedCommand}</code>
        </div>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regime Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Regime Heatmap</CardTitle>
            <span className="text-[10px] text-text-tertiary text-mono">12 x 6 Grid</span>
          </CardHeader>
          <div className="grid grid-cols-12 gap-1">
            {heatmapData.map((color, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-sm transition-opacity hover:opacity-100",
                  color === "primary" ? "bg-primary/60" : color === "gold" ? "bg-gold/40" : color === "magenta" ? "bg-magenta/40" : "bg-surface-hover"
                )}
              />
            ))}
          </div>
        </Card>

        {/* Tool Worker Stream */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Worker Stream</CardTitle>
            <Activity className="w-4 h-4 text-primary animate-pulse-slow" />
          </CardHeader>
          <div className="space-y-1.5 font-mono text-xs max-h-52 overflow-y-auto">
            {workerStream.map((log, i) => (
              <div key={i} className="flex gap-2 py-1">
                <span className="text-text-tertiary shrink-0">[{log.ts.includes("T") ? log.ts.split("T")[1]?.slice(0, 8) : log.ts}]</span>
                <span className={cn(
                  "font-bold shrink-0 uppercase",
                  log.level.toUpperCase() === "SUCCESS" ? "text-gain" : log.level.toUpperCase() === "WARN" ? "text-gold" : log.level.toUpperCase() === "AWAIT" ? "text-magenta" : "text-text-secondary"
                )}>
                  {log.level.toUpperCase()}:
                </span>
                <span className="text-text-secondary">{log.message}</span>
              </div>
            ))}
            <div className="flex gap-2 py-1">
              <span className="text-text-tertiary">[{">>"}</span>
              <span className="text-primary animate-pulse-slow">_</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Agent Chat */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Query Interface</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2 mb-4">
          {agentTools.map((tool) => (
            <button key={tool} className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-text-secondary text-mono uppercase hover:bg-surface-hover hover:text-text-primary transition-colors">
              {tool}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitQuery();
              }
            }}
            placeholder="Ask the agent about portfolio risk, alpha decay, regime shifts..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors text-mono"
          />
          <button
            onClick={() => {
              void submitQuery();
            }}
            disabled={isQuerying}
            className="px-4 py-2.5 rounded-lg bg-primary text-text-inverse hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {queryReply ? <p className="mt-4 text-sm text-text-secondary">{queryReply}</p> : null}
      </Card>
    </div>
  );
}
