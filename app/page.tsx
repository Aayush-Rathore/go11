import { Pick11HomePage } from "@/components/pick11-home-page";
import { buildMetadata } from "@/lib/seo";

const PAGE_TITLE = "Go Play 11 APK Download | GoPlay11 Fantasy Cricket App";
const PAGE_DESCRIPTION =
  "Play fantasy cricket online with GoPlay11. Complete your Go Play 11 APK download quickly, join contests, and win real cash with daily gameplay.";

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
  keywords: [
    "go play 11",
    "go play 11 apk",
    "go play 11 apk download",
    "goplay11",
    "goplay11 apk",
    "goplay11 apk download",
  ],
});

export default function HomePage() {
  return <Pick11HomePage />;
}
