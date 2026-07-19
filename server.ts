import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with system User-Agent for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Proxy for iTunes search to guarantee CORS and SSL safety
app.get("/api/search", async (req, res) => {
  const term = req.query.term;
  if (!term) {
    return res.status(400).json({ error: "Missing search term" });
  }

  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term as string)}&entity=song&limit=10`);
    if (!response.ok) {
      throw new Error(`iTunes API returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("iTunes search proxy error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to de-copyright a song using Gemini
app.post("/api/decopyright", async (req, res) => {
  const { song, customGenre, customBpm, customMood, customVocals, lang = "cs" } = req.body;
  if (!song) {
    return res.status(400).json({ error: "Skladba je vyžadována" });
  }

  const langNames: Record<string, string> = {
    cs: "Czech",
    en: "English",
    sk: "Slovak",
    pl: "Polish",
    de: "German",
    ru: "Russian",
    es: "Spanish",
    pt: "Portuguese"
  };
  const targetLangName = langNames[lang] || "Czech";

  const systemInstruction = `Jsi absolutní světový expert na hudební teorii, reverzní inženýrství zvuku a design promptů pro AI hudební generátory jako Suno, Udio a MusicGen.
Tvým posláním je rozebrat zadanou skladbu na její nejhlubší mikroskopické součástky (Audio DNA) a sestavit remakeový prompt v angličtině, který v AI vygeneruje skladbu, jež bude k nerozeznání od originálu co se týče atmosféry, rytmu, struktury, aranže, lyrického tónu a energie (dokonalá shoda atmosféry).

Nesmíš ale použít žádná chráněná jména (jméno interpreta, název skladby, alba). Místo nich popiš zvuky s extrémní přesností.
Strictly FORBIDDEN: Never include the artist's name, track title, album name, or direct lyric quotes in the final prompt. Avoid synonyms that closely mimic the title (e.g., if the song is 'Blinding Lights', do not use 'blinding city lights'). Replace them with generic atmospheric descriptions (e.g., 'neon skyline', 'glowing night cityscape').

Místo nich popiš zvuky s extrémní přesností:
1. ARANŽ A STRUKTURA: Popiš, jak píseň začíná a jak se vyvíjí (např. "starts with an atmospheric filtered synth intro, building up with a snare roll into a high-energy drop").
2. AKUSTICKÝ SPACE A PRODUKCE: Specifikuj efekty a mixážní techniky (např. "gated reverb on drums, warm analog tape saturation, sidechain compression pumping the synthesizer pads to the kick drum, deep stereo field width, lush plate reverb").
3. INSTRUMENTACE A SYNTH DESIGNY: Vyjmenuj konkrétní typy nástrojů a stylů (např. "vintage 1980s Roland Juno-106 analog chorus synths, punchy Roland TR-909 drum machine kick and tight hats, warm plucky electric bass, funk-style single-coil clean electric guitar riffs, heavy sub-bass lines").
4. DETALNÍ VOKÁLNÍ DESIGN: Zrekonstruuj vokální projev s maximální přesností (např. "airy, intimate, whispery close-mic female vocals with stereo delay, passionate soaring male tenor in the high register with subtle autotune effect, layered three-part background harmonies").
5. RYTMICKÉ SPECIFIKUM: Popiš groove a syncopace (např. "driving 4/4 four-on-the-floor disco beat, syncopated off-beat bassline, organic shaker loop").
6. LYRICKÝ VLIV A TÉMATIKA: Přidej instrukce pro lyrický tón a témata, o kterých se ve skladbě zpívá, aby generátor vygeneroval texty se stejným nábojem a metaforami (např. "lyrical themes of midnight driving, emotional longing, neon nostalgia, and runaway dreams").

Výsledný 'ai_music_prompt' musí mít délku cca 110-150 slov, být plný bohaté hudební terminologie v angličtině a být maximálně optimalizován pro pochopení současnými AI modely. Musí mít obrovský náboj a co nejpřesněji modelovat dynamiku a energii originálu.

Pokud uživatel zadal vlastní úpravy (custom žánr, BPM, náladu nebo vokály), použij je jako dominantní zadání a přizpůsob jim celý zvukový profil a prompt, přičemž zachováš původní instrumentální propracovanost a produkční kvalitu.

DŮLEŽITÉ: Výstupní pole 'lyrical_theme' a 'description' MUSÍ být napsána v požadovaném cílovém jazyce: ${targetLangName}. Hudební prompt 'ai_music_prompt' musí zůstat VŽDY v angličtině.`;

  let prompt = `Skladba k analýze: "${song}"`;
  if (customGenre) prompt += `\nPožadovaný žánr (přepiš původní): ${customGenre}`;
  if (customBpm) prompt += `\nPožadované BPM (přepiš původní): ${customBpm}`;
  if (customMood) prompt += `\nPožadovaná nálada (přepiš původní): ${customMood}`;
  if (customVocals) prompt += `\nPožadované vokály (přepiš původní): ${customVocals}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original_song: {
              type: Type.STRING,
              description: "Název původní skladby a případný interpret."
            },
            bpm: {
              type: Type.INTEGER,
              description: "Tempo skladby v BPM jako celé číslo (např. 128)."
            },
            genre: {
              type: Type.STRING,
              description: "Hudební žánr nebo žánry skladby."
            },
            mood: {
              type: Type.STRING,
              description: "Atmosféra a nálada skladby (např. energetic, melancholy)."
            },
            vocal_style: {
              type: Type.STRING,
              description: "Podrobný popis vokálního stylu."
            },
            instruments: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Hlavní použité hudební nástroje, syntezátory a bicí."
            },
            musical_key: {
              type: Type.STRING,
              description: "Tónina skladby (např. 'A Minor', 'G Major')."
            },
            lyrical_theme: {
              type: Type.STRING,
              description: `Popis tématiky textu - o čem se zpívá, jaké jsou hlavní emoční motivy, metafory a lyrická nálada skladby. MUSÍ být v jazyce: ${targetLangName}.`
            },
            ai_music_prompt: {
              type: Type.STRING,
              description: "Detailní, profesionální anglický prompt pro AI hudební generátory (Suno/Udio/MusicGen). Musí specifikovat styl, tempo, aranžmá, produkční textury, nástroje, podrobný popis vokálů a tématiku textu (lyrical themes) bez zmínky o jménu interpreta či názvu písně."
            },
            description: {
              type: Type.STRING,
              description: `Krátké, poutavé vysvětlení toho, co tvoří DNA této skladby a jak se podařilo vytvořit její remake. MUSÍ být v jazyce: ${targetLangName}.`
            }
          },
          required: ["original_song", "bpm", "genre", "mood", "vocal_style", "instruments", "musical_key", "lyrical_theme", "ai_music_prompt", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(text);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini API error during decopyrighting:", error);
    res.status(500).json({ error: error.message || "Nepodařilo se analyzovat skladbu" });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
