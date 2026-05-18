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
      { id: "marsha-p-johnson", name: "Marsha P. Johnson", category: "Activism", description: "Ključna figura u Stonewall pobuni i suosnivačica S.T.A.R. organizacije.", connections: [{ targetId: "harvey-milk", reason: "Zajednička borba za prava u ranim fazama pokreta." }, { targetId: "sylvester", reason: "Zajednička scena u San Franciscu." }] },
      { id: "harvey-milk", name: "Harvey Milk", category: "Activism", description: "Prvi otvoreno gay političar izabran u Kaliforniji, simbol nade i otpora.", connections: [{ targetId: "marsha-p-johnson", reason: "Aktivističko nasljeđe." }, { targetId: "james-baldwin", reason: "Intelektualni temelji borbe za prava." }] },
      { id: "freddie-mercury", name: "Freddie Mercury", category: "Music", description: "Legendarni frontman grupe Queen, redefinirao je granice performansa i muškosti.", connections: [{ targetId: "david-bowie", reason: "Glazbeni utjecaj i suradnja ('Under Pressure')." }, { targetId: "lady-gaga", reason: "Inspiracija za scenski nastup." }] },
      { id: "david-bowie", name: "David Bowie", category: "Music", description: "Androgini vizionar koji je promijenio lice pop glazbe kroz alter ego Ziggy Stardust.", connections: [{ targetId: "freddie-mercury", reason: "Suradnici i pioniri queer estetike." }, { targetId: "sophie", reason: "Inspiracija za futuristički pop." }] },
      { id: "rupaul", name: "RuPaul", category: "Drag", description: "Najpoznatija drag queen na svijetu koja je dovela drag kulturu u globalni mainstream.", connections: [{ targetId: "marsha-p-johnson", reason: "Poštovanje prema korijenima uličnog aktivizma." }, { targetId: "lil-nas-x", reason: "Moderni proboj u pop kulturu." }] },
      { id: "lil-nas-x", name: "Lil Nas X", category: "Music", description: "Moderni pionir u hip-hopu koji hrabro istražuje svoj identitet kroz vizualnu umjetnost.", connections: [{ targetId: "lady-gaga", reason: "Digitalni aktivizam i pop utjecaj." }, { targetId: "rupaul", reason: "Rušenje rodnih normi u medijima." }] },
      { id: "lady-gaga", name: "Lady Gaga", category: "Music", description: "Pop ikona poznata po nepokolebljivom zalaganju za LGBTQ+ zajednicu i 'Little Monsters'.", connections: [{ targetId: "freddie-mercury", reason: "Inspiracija za scensko ime." }, { targetId: "alexander-mcqueen", reason: "Modna i umjetnička suradnja." }] },
      { id: "james-baldwin", name: "James Baldwin", category: "Art", description: "Esejist i romanopisac čiji su radovi o rasi i seksualnosti ostali temeljni za razumijevanje identiteta.", connections: [{ targetId: "harvey-milk", reason: "Zajednički ciljevi socijalne pravde." }] },
      { id: "sophie", name: "SOPHIE", category: "Music", description: "Elektronička glazbenica i producentica koja je dekonstruirala pop glazbu i rodne identitete.", connections: [{ targetId: "david-bowie", reason: "Avangardna zvučna istraživanja." }, { targetId: "lady-gaga", reason: "Suradnja i utjecaj na moderni pop." }] },
      { id: "sylvester", name: "Sylvester", category: "Music", description: "Kralj disca i ikona Hi-NRG zvuka, poznat po svom falsetu i androginošću.", connections: [{ targetId: "marsha-p-johnson", reason: "Klupska scena i aktivizam." }, { targetId: "rupaul", reason: "Povijesni utjecaj na drag i performans." }] },
      { id: "alexander-mcqueen", name: "Alexander McQueen", category: "Art", description: "Modni dizajner čije su revije bile mračni, prekrasni performansi koji su propitivali ljepotu.", connections: [{ targetId: "lady-gaga", reason: "Ikonografska modna suradnja." }] },
      { id: "elliot-page", name: "Elliot Page", category: "Film/TV", description: "Glumac i aktivist čiji je put javne tranzicije postao ključni trenutak za trans vidljivost u Hollywoodu.", connections: [{ targetId: "laverne-cox", reason: "Borba za trans vidljivost u medijima." }] },
      { id: "laverne-cox", name: "Laverne Cox", category: "Film/TV", description: "Prva trans osoba nominirana za Emmy u glumačkoj kategoriji, pionirka u industriji.", connections: [{ targetId: "elliot-page", reason: "Zajednička platforma za trans prava." }, { targetId: "marsha-p-johnson", reason: "Povijesna inspiracija." }] },
      { id: "keith-haring", name: "Keith Haring", category: "Art", description: "Umjetnik čiji su grafiti i pop-art postali vizualni jezik aktivizma tijekom AIDS krize.", connections: [{ targetId: "marsha-p-johnson", reason: "Aktivizam tijekom 80-ih." }] }
    ];

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Generate a list of 25 diverse and influential queer icons from history and modern pop culture. Include legends like James Baldwin, Harvey Milk, Marsha P. Johnson, Keith Haring, as well as modern stars like SOPHIE, Lil Nas X, and Elliot Page. For each icon, provide: 'id' (short kebab-case string), 'name', 'category' (strictly one of: Music, Activism, Drag, Art, Film/TV), 'description' (rich 2-3 sentence overview), and 'connections' (array of {targetId: string, reason: string} where targetId matches another icon's id in this list). Ensure the network is well-connected. Output ONLY valid JSON array with at least 20 icons.",
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
                  connections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        targetId: { type: Type.STRING },
                        reason: { type: Type.STRING }
                      },
                      required: ["targetId", "reason"]
                    }
                  }
                },
                required: ["id", "name", "category", "description", "connections"]
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
