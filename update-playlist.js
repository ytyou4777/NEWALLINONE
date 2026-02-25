const axios = require("axios");
const fs = require("fs");

const OUTPUT_FILE = "stream.m3u";

// ================= SOURCES =================
const SOURCES = {
  JIO_M3U: "https://raw.githubusercontent.com/ytyou4777/JIO-STAR/refs/heads/main/jiostar.m3u",  
  HOTSTAR_M3U: "",
  ZEE5_M3U: "https://join-vaathala1-for-more.vodep39240327.workers.dev/zee5.m3u",
          // updated
  SONYLIV_M3U: "https://raw.githubusercontent.com/ytyou4777/sony-playlist/refs/heads/main/SONY.m3u", // updated
  FANCODE_JSON: "https://allinonereborn.online/fctest/json/fancode_latest.json",
  ICC_TV_JSON: "https://icc.vodep39240327.workers.dev/icctv.jso",
  SPORTS_JSON: "",
};

// ================= PLAYLIST HEADER =================
const PLAYLIST_HEADER = `#EXTM3U
#EXTM3U x-tvg-url="https://epgshare01.online/epgshare01/epg_ripper_IN4.xml.gz"
#EXTM3U x-tvg-url="https://mitthu786.github.io/tvepg/tataplay/epg.xml.gz"
#EXTM3U x-tvg-url="https://avkb.short.gy/tsepg.xml.gz"
# ===== Clarity TV Playlist =====
# Join Telegram: @watch_clarity
`;

// ================= PLAYLIST FOOTER =================
const PLAYLIST_FOOTER = `
# =========================================
# This m3u link is only for educational purposes
# =========================================
`;

// ================= SECTION =================
function section(title) {
  return `\n# ---------------=== ${title} ===-------------------\n`;
}


// ================= JIO M3U HANDLER =================
function handleJioM3U(data) {
  if (!data) return "";
  if (typeof data !== 'string') {
    console.warn("⚠️ JIO data is not a string, skipping.");
    return "";
  }

  const lines = data.split('\n');
  const out = [];
  const defaultGroup = "| JIOTV+";

  for (let line of lines) {
    line = line.trimRight(); // preserve indentation but remove trailing spaces
    if (line.startsWith('#EXTINF:')) {
      // Prepend our group prefix to existing group-title, or add it if missing
      if (line.includes('group-title=')) {
        line = line.replace(/group-title="([^"]*)"/, (match, group) => {
          return `group-title=" ${group}"`;
        });
      } else {
        // No group-title, insert one after the duration
        const commaIndex = line.indexOf(',');
        if (commaIndex !== -1) {
          line = line.slice(0, commaIndex) + ` group-title="${defaultGroup}"` + line.slice(commaIndex);
        } else {
          // Malformed line, just add at the end
          line = line + ` group-title="${defaultGroup}"`;
        }
      }
      out.push(line);
    } else {
      out.push(line);
    }
  }

  console.log("✅ JIO M3U processed with group-title prefix.");
  return out.join('\n');
}


// ================= HOTSTAR =================
// function convertHotstar(data) {
//   if (typeof data !== 'string' || !data.trim().startsWith('#EXTM3U')) {
//     let json = data;
//     if (!Array.isArray(json) && typeof json === 'object') {
//       const possibleKeys = ['channels', 'data', 'results', 'streams', 'list'];
//       for (const key of possibleKeys) {
//         if (Array.isArray(json[key])) { json = json[key]; break; }
//       }
//     }
//     if (Array.isArray(json)) {
//       const out = [];
//       json.forEach((ch) => {
//         const rawUrl = ch.m3u8_url || ch.mpd_url || ch.url || ch.playback_url || ch.streamUrl;
//         if (!rawUrl) return;
//         try {
//           const urlObj = new URL(rawUrl);
//           const cookieMatch = rawUrl.match(/hdntl=[^&]*/);
//           const cookie = cookieMatch ? cookieMatch[0] : "";
//           const userAgent = decodeURIComponent(urlObj.searchParams.get("User-agent") || "") || "Hotstar;in.startv.hotstar/25.02.24.8.11169 (Android/15)";
//           urlObj.searchParams.delete("User-agent"); urlObj.searchParams.delete("Origin"); urlObj.searchParams.delete("Referer");
//           const logo = ch.logo || ch.logo_url || ch.image || "";
//           const name = ch.name || ch.title || ch.channel_name || "Unknown";
          
//           out.push(
//             `#EXTINF:-1 group-title="Clarity TV | JIOHOTSTAR" tvg-logo="${logo}" ,${name}`,
//             `#EXTVLCOPT:http-user-agent=${userAgent}`,
//             `#EXTHTTP:${JSON.stringify({ cookie: cookie, Origin: "https://www.hotstar.com", Referer: "https://www.hotstar.com/" })}`,
//             urlObj.toString()
//           );
//         } catch (e) {}
//       });
//       return out.join("\n");
//     }
//     return "";
//   }

//   console.log("✅ Hotstar: Parsing and reformatting raw M3U...");
//   const lines = data.split('\n');
//   const out = [];
//   let currentInf = "";

//   const getRawParam = (url, name) => {
//     const regex = new RegExp(`(?:[?&%7C])${name}=([^&]*)`);
//     const match = url.match(regex);
//     return match ? match[1] : "";
//   };

//   const DEFAULT_UA = "Hotstar;in.startv.hotstar/25.02.24.8.11169 (Android/15)";
//   const DEFAULT_ORIGIN = "https://www.hotstar.com";
//   const DEFAULT_REFERER = "https://www.hotstar.com/";

//   for (let line of lines) {
//     line = line.trim();
//     if (!line) continue;

//     if (line.startsWith('#EXTINF')) {
//       const logoMatch = line.match(/tvg-logo="([^"]*)"/);
//       const logo = logoMatch ? logoMatch[1] : "";
//       const lastComma = line.lastIndexOf(',');
//       const name = (lastComma !== -1) ? line.substring(lastComma + 1).trim() : "Unknown";
//       currentInf = `#EXTINF:-1 group-title="Clarity TV | JIOHOTSTAR" tvg-logo="${logo}" ,${name}`;
//     } 
//     else if (line.startsWith('http')) {
//       const cookie = getRawParam(line, 'Cookie');
//       let userAgent = getRawParam(line, 'User-agent');
//       let origin = getRawParam(line, 'Origin');
//       let referer = getRawParam(line, 'Referer');

//       if (!userAgent) userAgent = DEFAULT_UA;
//       if (!origin) origin = DEFAULT_ORIGIN;
//       if (!referer) referer = DEFAULT_REFERER;

//       const cleanUrl = line.split('?')[0];

//       if (currentInf) {
//         out.push(currentInf);
        
//         const safeUA = userAgent.replace(/ /g, "%20");
//         out.push(`#EXTVLCOPT:http-user-agent=${safeUA}`);

//         const headers = {
//           cookie: cookie,
//           Origin: origin,
//           Referer: referer
//         };
//         out.push(`#EXTHTTP:${JSON.stringify(headers)}`);

//         out.push(cleanUrl);
        
//         currentInf = "";
//       }
//     }
//   }

//   console.log(`✅ Processed ${out.length / 4} Hotstar channels.`);
//   return out.join("\n");
// }



// ================= SONY M3U HANDLER =================
function handleSonyM3U(data) {
  if (!data) return "";
  if (typeof data !== 'string') {
    console.warn("⚠️ Sony data is not a string, skipping.");
    return "";
  }

  const lines = data.split('\n');
  const out = [];
  const defaultGroup = "Clarity TV | SonyLiv | Sports";

  for (let line of lines) {
    line = line.trimRight();
    if (line.startsWith('#EXTINF:')) {
      if (line.includes('group-title=')) {
        line = line.replace(/group-title="([^"]*)"/, (match, group) => {
          return `group-title="Clarity TV | SONYLIV | ${group}"`;
        });
      } else {
        const commaIndex = line.indexOf(',');
        if (commaIndex !== -1) {
          line = line.slice(0, commaIndex) + ` group-title="${defaultGroup}"` + line.slice(commaIndex);
        } else {
          line = line + ` group-title="${defaultGroup}"`;
        }
      }
      out.push(line);
    } else {
      out.push(line);
    }
  }

  console.log("✅ Sony M3U processed with group-title prefix.");
  return out.join('\n');
}

// ================= FANCODE =================
function convertFancode(json) {
  if (!Array.isArray(json.matches)) return "";
  return json.matches
    .filter((m) => m.status === "LIVE")
    .map((m) => {
      const url = m.adfree_url || m.dai_url;
      if (!url) return null;
      return `#EXTINF:-1 tvg-logo="${m.src}" group-title="Clarity TV | FanCode | Sports",${m.match_name}\n${url}`;
    })
    .filter(Boolean)
    .join("\n");
}

// ================= ICC TV =================
function convertIccTv(json) {
  if (!Array.isArray(json.tournaments)) return "";
  const out = [];

  json.tournaments.forEach((t) => {
    if (t.status !== "success") return;

    t.live_streams.forEach((s) => {
      if (!s.mpd || !s.keys) return;

      out.push(
        `#KODIPROP:inputstream.adaptive.license_type=clearkey`,
        `#KODIPROP:inputstream.adaptive.license_key=${s.keys}`,
        `#EXTINF:-1 group-title="Clarity TV | T20 World Cup | Live Matches" tvg-logo="${s.match?.thumbnail || ""}",ICC-${s.title || "Live"}`,
        s.mpd
      );
    });
  });

  return out.join("\n");
}

// ================= SPORTS (HANDLES M3U OR JSON) =================
function handleSportsData(data) {
  if (!data) return "";

  if (typeof data === 'string' && data.trim().startsWith('#EXTM3U')) {
    console.log("✅ Sports: Detected raw M3U, inserting directly.");
    return data.trim();
  }

  try {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    if (data && Array.isArray(data.streams)) {
      console.log("✅ Sports: Detected JSON format, converting.");
      return convertSportsJson(data);
    }
  } catch (e) {
    console.warn("⚠️ Sports data is neither valid M3U nor expected JSON.");
  }

  return "";
}

// Old JSON converter for Sports (kept)
function convertSportsJson(json) {
  if (!json || !Array.isArray(json.streams)) return "";
  const out = [];

  json.streams.forEach((s, i) => {
    if (!s.url) return;

    const urlObj = new URL(s.url);
    const drm = urlObj.searchParams.get("drmLicense") || "";
    const [kid, key] = drm.split(":");

    const ua = urlObj.searchParams.get("User-Agent") || "";
    const hdnea = urlObj.searchParams.get("__hdnea__") || "";

    urlObj.searchParams.delete("drmLicense");
    urlObj.searchParams.delete("User-Agent");

    out.push(
      `#EXTINF:-1 tvg-id="${1100 + i}" tvg-logo="https://img.u0k.workers.dev/joinvaathala1.webp" group-title="Clarity TV | T20 World Cup | Live Matches",${s.language}`,
      `#KODIPROP:inputstream.adaptive.license_type=clearkey`,
      `#KODIPROP:inputstream.adaptive.license_key=${kid}:${key}`,
      `#EXTHTTP:${JSON.stringify({
        Cookie: hdnea ? `__hdnea__=${hdnea}` : "",
        "User-Agent": ua,
      })}`,
      urlObj.toString()
    );
  });

  return out.join("\n");
}

// ================= SAFE FETCH =================
async function safeFetch(url, name, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const res = await axios.get(url, {
        timeout: 60000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      });

      console.log(`✅ Loaded ${name}`);
      return res.data;

    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed for ${name}`);

      if (attempt > retries) {
        console.warn(`❌ Skipped ${name}`);
        return null;
      }

      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ================= MAIN =================
async function run() {
  const out = [];
  out.push(PLAYLIST_HEADER.trim());

  const hotstar = await safeFetch(SOURCES.HOTSTAR_M3U, "Hotstar");
  if (hotstar) out.push(section("Clarity TV | JIOHOTSTAR"), hotstar);

  const zee5 = await safeFetch(SOURCES.ZEE5_M3U, "ZEE5");
  if (zee5) out.push(section("Clarity TV | ZEE5 | Live"), zee5);

  // JIO M3U
  const jioData = await safeFetch(SOURCES.JIO_M3U, "JIO");
  if (jioData) {
    const jioContent = handleJioM3U(jioData);
    if (jioContent) {
      out.push(section("Clarity TV | JIOTV+"), jioContent);
    }
  }

  const sportsData = await safeFetch(SOURCES.SPORTS_JSON, "Sports");
  if (sportsData) {
    const sportsContent = handleSportsData(sportsData);
    if (sportsContent) {
      out.push(section("Clarity TV | T20 World Cup | Live Matches"), sportsContent);
    }
  }

  const icc = await safeFetch(SOURCES.ICC_TV_JSON, "ICC TV");
  if (icc) out.push(section("ICC TV"), convertIccTv(icc));

  // Sony M3U
  const sonyData = await safeFetch(SOURCES.SONYLIV_M3U, "SonyLiv");
  if (sonyData) {
    const sonyContent = handleSonyM3U(sonyData);
    if (sonyContent) {
      out.push(section("Clarity TV | SonyLiv"), sonyContent);
    }
  }

  const fan = await safeFetch(SOURCES.FANCODE_JSON, "FanCode");
  if (fan) out.push(section("Clarity TV | FanCode | Sports"), convertFancode(fan));

  out.push(PLAYLIST_FOOTER.trim());

  fs.writeFileSync(OUTPUT_FILE, out.join("\n") + "\n");
  console.log(`✅ ${OUTPUT_FILE} generated successfully`);
}

run();
