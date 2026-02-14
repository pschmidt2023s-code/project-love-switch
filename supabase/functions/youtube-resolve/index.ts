import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VideoInfo {
  videoId: string;
  title: string;
  artist: string;
  coverUrl: string;
  durationSeconds: number | null;
}

function extractYouTubeId(url: string): { type: "video" | "playlist"; id: string } | null {
  try {
    const u = new URL(url);
    // Playlist
    const listId = u.searchParams.get("list");
    if (listId) return { type: "playlist", id: listId };
    // Video
    if (u.hostname.includes("youtu.be")) {
      return { type: "video", id: u.pathname.slice(1).split("/")[0] };
    }
    const vId = u.searchParams.get("v");
    if (vId) return { type: "video", id: vId };
  } catch { /* ignore */ }
  return null;
}

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 3600) +
         (parseInt(match[2] || "0") * 60) +
         (parseInt(match[3] || "0"));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not configured");
    }

    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL erforderlich" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = extractYouTubeId(url);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "Ungültige YouTube URL" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: VideoInfo[] = [];

    if (parsed.type === "video") {
      // Single video - fetch details
      const resp = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${parsed.id}&key=${YOUTUBE_API_KEY}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(`YouTube API error: ${JSON.stringify(data.error)}`);
      
      const item = data.items?.[0];
      if (item) {
        results.push({
          videoId: item.id,
          title: item.snippet.title,
          artist: item.snippet.channelTitle || "Unknown",
          coverUrl: item.snippet.thumbnails?.maxres?.url || 
                    item.snippet.thumbnails?.high?.url || 
                    item.snippet.thumbnails?.medium?.url || "",
          durationSeconds: parseDuration(item.contentDetails?.duration || ""),
        });
      }
    } else {
      // Playlist - fetch all items (paginated)
      let nextPageToken = "";
      let page = 0;
      const videoIds: string[] = [];
      const snippets: Record<string, any> = {};

      do {
        const resp = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${parsed.id}&pageToken=${nextPageToken}&key=${YOUTUBE_API_KEY}`
        );
        const data = await resp.json();
        if (!resp.ok) throw new Error(`YouTube API error: ${JSON.stringify(data.error)}`);

        for (const item of data.items || []) {
          const vid = item.snippet?.resourceId?.videoId;
          if (vid) {
            videoIds.push(vid);
            snippets[vid] = item.snippet;
          }
        }
        nextPageToken = data.nextPageToken || "";
        page++;
      } while (nextPageToken && page < 10); // Max 500 tracks

      // Fetch durations in batches of 50
      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const resp = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch.join(",")}&key=${YOUTUBE_API_KEY}`
        );
        const data = await resp.json();
        if (resp.ok) {
          for (const item of data.items || []) {
            const snip = snippets[item.id];
            if (snip) {
              results.push({
                videoId: item.id,
                title: snip.title,
                artist: snip.videoOwnerChannelTitle || snip.channelTitle || "Unknown",
                coverUrl: snip.thumbnails?.maxres?.url ||
                          snip.thumbnails?.high?.url ||
                          snip.thumbnails?.medium?.url || "",
                durationSeconds: parseDuration(item.contentDetails?.duration || ""),
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      type: parsed.type, 
      tracks: results,
      count: results.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[YOUTUBE-RESOLVE] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
