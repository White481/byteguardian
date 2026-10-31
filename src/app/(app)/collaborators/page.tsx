import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Collaborators" };

// Owner: พี่ภีม — Not in Figma yet — follow the app layout
export default function CollaboratorsPage() {
  return (
    <>
      <PageHeader title="Collaborators" description="Invite teammates to your organization." />
      <PagePlaceholder
        owner="พี่ภีม"
        reference='Not in Figma yet — follow the app layout'
        todo={[
          "List users in the company, invite by email, role (admin / member / viewer)",
        ]}
      />
    </>
  );
}
