import { AFFILIATE_LINK } from "@/lib/site";

export function StickyCta() {
  return (
    <div className="sticky-cta" role="complementary">
      <div className="container sticky-shell">
        <p className="sticky-copy">
          Ready to install? Get the latest Goplay11 app and claim signup rewards.
        </p>
        <a
          className="btn btn-primary"
          href={AFFILIATE_LINK}
          rel="noopener noreferrer"
          target="_blank"
        >
          Download Goplay11 APK
        </a>
      </div>
    </div>
  );
}

