import type { Metadata } from "next";
import { Assistant } from "./assistant";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AssistantPage() {
  return <Assistant />;
}
