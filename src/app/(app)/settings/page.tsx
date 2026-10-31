import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Settings" };

// Owner: พี่ภีม — Not in Figma yet — follow the app layout
export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Profile, company and account settings." />
      <PagePlaceholder
        owner="พี่ภีม"
        reference='Not in Figma yet — follow the app layout'
        todo={[
          "Profile, password, company info (reuse Company Setup form), notifications",
        ]}
      />
    </>
  );
}
