import type { Metadata } from "next";

const title = "Retro Funding 5: Voting";
const description = "Voting is now live for Retro Funding 5: OP Stack";
// needs to update to op-rf5
const url = "https://op-rf4-voting-ui-production.up.railway.app/";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: title,
    images: [{ url: url + "/og.png" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@site",
    creator: "@creator",
    images: url + "/og.png",
  },
};
