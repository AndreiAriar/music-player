// Server-side proxy for the iTunes Search API.
//
// Why this exists: calling itunes.apple.com directly from the browser
// works fine on some networks/browsers and silently fails ("Load
// failed" / "Failed to fetch") on others — seen so far on an iPhone
// on Chrome AND Safari (both WebKit under the hood) on a network
// where the laptop had no issue at all. That points at something
// between that specific network and Apple's servers (DNS filtering,
// firewall, geo/IP-based bot protection), not a browser setting.
//
// Routing the request through this Vercel function means the
// browser only ever talks to your own domain. The iTunes request
// happens from Vercel's servers instead, which sidesteps whatever
// is blocking the client entirely.

export default async function handler(req: any, res: any) {
  const term = req.query?.term;

  if (!term || typeof term !== "string" || !term.trim()) {
    res.status(400).json({ error: "Missing search term" });
    return;
  }

  const upstreamUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term.trim()
  )}&media=music&limit=12`;

  try {
    const upstream = await fetch(upstreamUrl);

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `iTunes API returned ${upstream.status}` });
      return;
    }

    const data = await upstream.json();

    // Short edge cache so repeated identical searches (e.g. someone
    // retrying) don't all hit Apple's API individually.
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: "Could not reach iTunes search API" });
  }
}