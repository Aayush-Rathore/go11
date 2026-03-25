import { Pick11HomePage } from "@/components/pick11-home-page";
import { buildMetadata } from "@/lib/seo";

const PAGE_TITLE = "GoPlay11 Fantasy Cricket App - Play and Win Real Cash Daily";
const PAGE_DESCRIPTION =
  "Play fantasy cricket online with GoPlay11. Join IPL contests, use smart picks, and win real cash with daily gameplay.";

export const metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return <Pick11HomePage />;
}
