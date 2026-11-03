import type { Metadata } from "next";
import { Collaborators } from "./collaborators";

export const metadata: Metadata = { title: "Collaborators" };

export default function CollaboratorsPage() {
  return <Collaborators />;
}
