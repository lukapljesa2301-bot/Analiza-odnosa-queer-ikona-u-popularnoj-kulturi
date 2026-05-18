import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API to fetch icon data
  app.post("/api/icons", async (req, res) => {
    const fallbackIcons = [
      { id: "marsha-p-johnson", name: "Marsha P. Johnson", category: "Activism", description: "Ključna figura u Stonewall pobuni i suosnivačica S.T.A.R. organizacije. Majka modernog pokreta za trans prava.", decade: 1960, sentimentScore: 0.9, connections: [{ targetId: "harvey-milk", reason: "Zajednička borba za prava u 70-ima.", strength: 0.8 }, { targetId: "rupaul", reason: "Inspiracija za sve drag izvođače klor otpora.", strength: 0.7 }, { targetId: "laverne-cox", reason: "Izravni povijesni uzor za trans aktivizam.", strength: 0.9 }] },
      { id: "harvey-milk", name: "Harvey Milk", category: "Activism", description: "Prvi otvoreno gay političar izabran u Kaliforniji, simbol nade i političkog organiziranja.", decade: 1970, sentimentScore: 0.85, connections: [{ targetId: "marsha-p-johnson", reason: "Suvremenici u aktivizmu.", strength: 0.75 }, { targetId: "james-baldwin", reason: "Intelektualni temelji borbe za prava.", strength: 0.6 }, { targetId: "lady-gaga", reason: "Inspiracija za njen politički aktivizam.", strength: 0.5 }] },
      { id: "freddie-mercury", name: "Freddie Mercury", category: "Music", description: "Legendarni frontman grupe Queen, redefinirao je granice performansa i muškosti kroz rock spektakl.", decade: 1970, sentimentScore: 0.95, connections: [{ targetId: "david-bowie", reason: "Glazbeni utjecaj i suradnja ('Under Pressure').", strength: 1.0 }, { targetId: "lady-gaga", reason: "Inspiracija za njeno scensko ime i teatralnost.", strength: 0.8 }, { targetId: "elton-john", reason: "Blisko prijateljstvo i zajednička era glam rocka.", strength: 0.9 }] },
      { id: "david-bowie", name: "David Bowie", category: "Music", description: "Androgini vizionar koji je kroz Ziggy Stardusta učinio 'neobičnost' privlačnom cijelom svijetu.", decade: 1970, sentimentScore: 0.92, connections: [{ targetId: "freddie-mercury", reason: "Pioniri queer estetike u rocku.", strength: 1.0 }, { targetId: "sophie", reason: "Inspiracija za futuristički i eksperimentalni pop.", strength: 0.7 }, { targetId: "janelle-monae", reason: "Izravna inspiracija za njen koncept 'androida'.", strength: 0.85 }] },
      { id: "rupaul", name: "RuPaul", category: "Drag", description: "Najpoznatija drag queen na svijetu koja je transformirala drag iz subkulture u globalni TV fenomen.", decade: 1990, sentimentScore: 0.8, connections: [{ targetId: "marsha-p-johnson", reason: "Poštovanje prema korijenima uličnog aktivizma.", strength: 0.6 }, { targetId: "lil-nas-x", reason: "Mentorstvo i podrška u mainstream medijima.", strength: 0.9 }, { targetId: "divine", reason: "Inspiracija kroz ranu drag/trash kulturu.", strength: 0.8 }] },
      { id: "lil-nas-x", name: "Lil Nas X", category: "Music", description: "Moderna ikona koja koristi meme kulturu i vizualni spektakl za rušenje homofobije u hip-hopu.", decade: 2020, sentimentScore: 0.75, connections: [{ targetId: "lady-gaga", reason: "Vizualni storytelling i hrabrost.", strength: 0.6 }, { targetId: "rupaul", reason: "Rušenje rodnih normi.", strength: 0.8 }, { targetId: "elton-john", reason: "Glazbena suradnja i mentorski odnos.", strength: 0.9 }] },
      { id: "lady-gaga", name: "Lady Gaga", category: "Music", description: "Pop ikona koja je postala 'majka' generaciji queer mladih kroz aktivizam i avangardni pop.", decade: 2010, sentimentScore: 0.88, connections: [{ targetId: "freddie-mercury", reason: "Inspiracija za ime (Radio Ga Ga).", strength: 0.7 }, { targetId: "alexander-mcqueen", reason: "Modna i umjetnička simbioza.", strength: 0.95 }, { targetId: "madonna", reason: "Utjecaj i usporedbe u redefiniranju pop zvijezde.", strength: 0.8 }] },
      { id: "madonna", name: "Madonna", category: "Music", description: "Kraljica popa koja je uvela kulturu ballrooma i vogueanja u mainstream još 90-ih.", decade: 1980, sentimentScore: 0.7, connections: [{ targetId: "lady-gaga", reason: "Arhitektica modernog pop fenomena.", strength: 0.75 }, { targetId: "sylvester", reason: "Utjecaj dance i disco glazbe na njen zvuk.", strength: 0.6 }, { targetId: "keith-haring", reason: "Blisko prijateljstvo i suradnja u New Yorku 80-ih.", strength: 0.9 }] }
    ];

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Generate a list of 30 diverse queer icons. For each provide: 'id', 'name', 'category', 'description' (in Croatian), 'decade' (integer, e.g. 1960), 'sentimentScore' (float -1.0 to 1.0 representing media perception), and 'connections' (array of {targetId, reason, strength: float 0.1-1.0}). Ensure clear criteria for inclusion: icons must have a documented impact on queer cultural heritage. Output valid JSON.",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  decade: { type: Type.NUMBER },
                  sentimentScore: { type: Type.NUMBER },
                  connections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        targetId: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        strength: { type: Type.NUMBER }
                      },
                      required: ["targetId", "reason", "strength"]
                    }
                  }
                },
                required: ["id", "name", "category", "description", "decade", "sentimentScore", "connections"]
              }
            }
          }
        });

        const text = response.text;
        const data = JSON.parse(text);
        
        if (Array.isArray(data) && data.length > 0) {
          return res.json(data);
        } else {
          throw new Error("Empty or malformed array from AI");
        }
      } catch (error: any) {
        const isQuotaError = error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429;
        if (isQuotaError) {
          console.warn("Gemini Quota hit, using fallback data.");
          return res.json(fallbackIcons);
        }
        
        attempts++;
        console.warn(`Gemini Attempt ${attempts} failed:`, error.message);
        if (attempts >= maxAttempts) {
          console.warn("Max attempts reached, using fallback data.");
          return res.json(fallbackIcons);
        }
        // Wait 1s before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
