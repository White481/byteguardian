"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, RotateCcw, Send, User } from "lucide-react";
import { MockBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { apiFetch } from "@/lib/api-client";
import type { ChatReply, ChatTurn } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Explain my current maturity tier",
  "Which function should we improve first?",
  "What does the Govern function cover?",
];

export function Assistant() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, sending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    const next: ChatTurn[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const res = await apiFetch<ChatReply>("/api/chat", { method: "POST", body: JSON.stringify({ messages: next }) });
      setIsMock(res.isMock);
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      // Put the text back so the user can retry
      setMessages(messages);
      setInput(content);
      setError(e instanceof Error ? e.message : "The assistant is unavailable");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Ask about your results, NIST CSF 2.0 and how to improve your security posture."
        actions={
          <>
            {isMock && <MockBadge label="Mock replies" />}
            <Button
              variant="outline"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              disabled={!messages.length || sending}
            >
              <RotateCcw className="size-4" /> New chat
            </Button>
          </>
        }
      />

      <Card className="flex h-[calc(100vh-15rem)] min-h-[420px] flex-col">
        <CardBody className="flex-1 overflow-y-auto" aria-live="polite">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <Bot className="size-10 text-accent" />
              <p className="text-muted">How can I help with your cybersecurity assessment?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-fg-soft hover:border-line-strong hover:text-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((m, i) => (
                <li key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full",
                      m.role === "user" ? "bg-primary" : "bg-surface-3 text-accent",
                    )}
                    aria-hidden
                  >
                    {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                  </span>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                      m.role === "user" ? "bg-primary text-white" : "bg-surface-2 text-fg-soft",
                    )}
                  >
                    <span className="sr-only">{m.role === "user" ? "You: " : "Assistant: "}</span>
                    {m.content}
                  </div>
                </li>
              ))}
              {sending && (
                <li className="flex items-center gap-3 text-sm text-muted">
                  <Spinner /> Thinking…
                </li>
              )}
            </ul>
          )}
          <div ref={bottom} />
        </CardBody>

        <form
          className="border-t border-line p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          {error && <Alert className="mb-3">{error}</Alert>}
          <div className="flex items-end gap-2">
            <Textarea
              aria-label="Message"
              className="min-h-11 flex-1 resize-none"
              rows={1}
              maxLength={4000}
              placeholder="Type your question…  (Enter to send, Shift+Enter for a new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(input);
                }
              }}
            />
            <Button type="submit" size="lg" loading={sending} disabled={!input.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-subtle">AI answers can be wrong. Check important decisions with your security team.</p>
        </form>
      </Card>
    </>
  );
}
