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
      { id: "marsha-p-johnson", name: "Marsha P. Johnson", category: "Activism", description: "Ključna figura u Stonewall pobuni i suosnivačica S.T.A.R. organizacije. Majka modernog pokreta za trans prava.", connections: [{ targetId: "harvey-milk", reason: "Zajednička borba za prava u 70-ima." }, { targetId: "rupaul", reason: "Inspiracija za sve drag izvođače kao simbol otpora." }, { targetId: "laverne-cox", reason: "Izravni povijesni uzor za trans aktivizam." }] },
      { id: "harvey-milk", name: "Harvey Milk", category: "Activism", description: "Prvi otvoreno gay političar izabran u Kaliforniji, simbol nade i političkog organiziranja.", connections: [{ targetId: "marsha-p-johnson", reason: "Suvremenici u aktivizmu." }, { targetId: "james-baldwin", reason: "Intelektualni temelji borbe za prava." }, { targetId: "lady-gaga", reason: "Inspiracija za njen politički aktivizam." }] },
      { id: "freddie-mercury", name: "Freddie Mercury", category: "Music", description: "Legendarni frontman grupe Queen, redefinirao je granice performansa i muškosti kroz rock spektakl.", connections: [{ targetId: "david-bowie", reason: "Glazbeni utjecaj i suradnja ('Under Pressure')." }, { targetId: "lady-gaga", reason: "Inspiracija za njeno scensko ime i teatralnost." }, { targetId: "elton-john", reason: "Blisko prijateljstvo i zajednička era glam rocka." }] },
      { id: "david-bowie", name: "David Bowie", category: "Music", description: "Androgini vizionar koji je kroz Ziggy Stardusta učinio 'neobičnost' privlačnom cijelom svijetu.", connections: [{ targetId: "freddie-mercury", reason: "Pioniri queer estetike u rocku." }, { targetId: "sophie", reason: "Inspiracija za futuristički i eksperimentalni pop." }, { targetId: "janelle-monae", reason: "Izravna inspiracija za njen koncept 'androida'." }] },
      { id: "rupaul", name: "RuPaul", category: "Drag", description: "Najpoznatija drag queen na svijetu koja je transformirala drag iz subkulture u globalni TV fenomen.", connections: [{ targetId: "marsha-p-johnson", reason: "Poštovanje prema korijenima uličnog aktivizma." }, { targetId: "lil-nas-x", reason: "Mentorstvo i podrška u mainstream medijima." }, { targetId: "divine", reason: "Inspiracija kroz ranu drag/trash kulturu." }] },
      { id: "lil-nas-x", name: "Lil Nas X", category: "Music", description: "Moderna ikona koja koristi meme kulturu i vizualni spektakl za rušenje homofobije u hip-hopu.", connections: [{ targetId: "lady-gaga", reason: "Vizualni storytelling i hrabrost." }, { targetId: "rupaul", reason: "Rušenje rodnih normi." }, { targetId: "elton-john", reason: "Glazbena suradnja i mentorski odnos." }] },
      { id: "lady-gaga", name: "Lady Gaga", category: "Music", description: "Pop ikona koja je postala 'majka' generaciji queer mladih kroz aktivizam i avangardni pop.", connections: [{ targetId: "freddie-mercury", reason: "Inspiracija za ime (Radio Ga Ga)." }, { targetId: "alexander-mcqueen", reason: "Modna i umjetnička simbioza." }, { targetId: "madonna", reason: "Utjecaj i usporedbe u redefiniranju pop zvijezde." }] },
      { id: "madonna", name: "Madonna", category: "Music", description: "Kraljica popa koja je uvela kulturu ballrooma i vogueanja u mainstream još 90-ih.", connections: [{ targetId: "lady-gaga", reason: "Arhitektica modernog pop fenomena." }, { targetId: "sylvester", reason: "Utjecaj dance i disco glazbe na njen zvuk." }, { targetId: "keith-haring", reason: "Blisko prijateljstvo i suradnja u New Yorku 80-ih." }] },
      { id: "elton-john", name: "Elton John", category: "Music", description: "Jedan od najuspješnijih glazbenika svih vremena, poznat po ekstravagantnim kostimima i AIDS aktivizmu.", connections: [{ targetId: "freddie-mercury", reason: "Zajednička borba i prijateljstvo." }, { targetId: "lil-nas-x", reason: "Podrška novoj generaciji queer umjetnika." }, { targetId: "billy-porter", reason: "Utjecaj na teatralnu modu na crvenom tepihu." }] },
      { id: "billy-porter", name: "Billy Porter", category: "Film/TV", description: "Zvijezda serije 'Pose' i modni revolucionar koji ruši rodne barijere na crvenim tepisima.", connections: [{ targetId: "elton-john", reason: "Nastavak tradicije glamuroznog performansa." }, { targetId: "rupaul", reason: "Zajednički korijeni u communityju i ballroom kulturi." }] },
      { id: "divine", name: "Divine", category: "Drag", description: "Muza Johna Watersa i 'najprljavija žena na svijetu', inspiracija za Ursulu iz Male Sirene.", connections: [{ targetId: "rupaul", reason: "Pionirka 'trash' i 'camp' estetike u dragu." }] },
      { id: "janelle-monae", name: "Janelle Monáe", category: "Music", description: "Umjetnica koja kroz znanstvenu fantastiku i afrofuturizam istražuje nebinarnost i panseksualnost.", connections: [{ targetId: "david-bowie", reason: "Inspiracija konceptualnim albumima." }, { targetId: "james-baldwin", reason: "Povezanost kroz afroamerički identitet." }] },
      { id: "james-baldwin", name: "James Baldwin", category: "Art", description: "Jedan od najvažnijih pisaca 20. stoljeća, istraživao je kompleksnost rase i seksualnosti u Americi.", connections: [{ targetId: "harvey-milk", reason: "Zajednički ideali slobode." }, { targetId: "janelle-monae", reason: "Inspiracija za njen književni i aktivistički rad." }] },
      { id: "sophie", name: "SOPHIE", category: "Music", description: "Futuristička producentica koja je redefinirala zvuk popa kroz dekonstrukciju rodnih i zvučnih normi.", connections: [{ targetId: "david-bowie", reason: "Eksperimentalni duh." }, { targetId: "lady-gaga", reason: "Suradnja i utjecaj na 'Chromatica' eru." }] },
      { id: "sylvester", name: "Sylvester", category: "Music", description: "Kralj disca koji je donio androgini glamur i falseto u klupsku kulturu San Francisca.", connections: [{ targetId: "marsha-p-johnson", reason: "Zajednički klupski i aktivistički korijeni." }, { targetId: "madonna", reason: "Utjecaj na ranu dance glazbu." }] },
      { id: "keith-haring", name: "Keith Haring", category: "Art", description: "Umjetnik čiji su radovi postali vizualni sinonim za borbu protiv AIDS-a i ulični aktivizam.", connections: [{ targetId: "madonna", reason: "Zajednička njujorška underground scena." }, { targetId: "andy-warhol", reason: "Prijateljstvo i mentorstvo u pop-artu." }] },
      { id: "andy-warhol", name: "Andy Warhol", category: "Art", description: "Otac pop-arta, čija je 'Factory' bila rano sigurno mjesto za queer umjetnike i trans ikone.", connections: [{ targetId: "keith-haring", reason: "Utjecaj na komercijalnu umjetnost." }, { targetId: "lou-reed", reason: "Suradnja kroz Velvet Underground." }] },
      { id: "laverne-cox", name: "Laverne Cox", category: "Film/TV", description: "Prva trans osoba na naslovnici Timea, koristi svoju slavu za edukaciju i borbu za trans prava.", connections: [{ targetId: "marsha-p-johnson", reason: "Zahvalnost za započetu borbu." }, { targetId: "elliot-page", reason: "Zajednička platforma za trans vidljivost." }] },
      { id: "elliot-page", name: "Elliot Page", category: "Film/TV", description: "Glumac i memoarist čija je tranzicija postala povijesni trenutak za trans vidljivost u Hollywoodu.", connections: [{ targetId: "laverne-cox", reason: "Solidarnost u trans zajednici." }] },
      { id: "alexander-mcqueen", name: "Alexander McQueen", category: "Art", description: "Dizajner čije su revije bile mračni i prekrasni queer performansi, pomičući granice tijela.", connections: [{ targetId: "lady-gaga", reason: "Stvorili su neke od najpoznatijih pop slika (Bad Romance)." }] },
      { id: "troye-sivan", name: "Troye Sivan", category: "Music", description: "Predstavnik nove generacije pop zvijezda koji kroz glazbu i film slavi queer senzualnost bez isprika.", connections: [{ targetId: "lil-nas-x", reason: "Zajedničko oblikovanje queer popa 2020-ih." }, { targetId: "madonna", reason: "Poštovanje prema pop klasicima." }] },
      { id: "oscar-wilde", name: "Oscar Wilde", category: "Art", description: "Povijesni genij estetizma čiji je progon zbog 'skandaloznog ponašanja' postao simbol povijesne nepravde.", connections: [{ targetId: "james-baldwin", reason: "Povezanost kroz književni otpor i progon." }] },
      { id: "frank-ocean", name: "Frank Ocean", category: "Music", description: "Zagonetni R&B vizionar čije je otvoreno pismo o ljubavi prema muškarcu promijenilo hip-hop i R&B kulturu.", connections: [{ targetId: "janelle-monae", reason: "Zajednička diskrecija i umjetnička dubina." }, { targetId: "lil-nas-x", reason: "Pionir iskrenosti u urbanim žanrovima." }] },
      { id: "anderson-cooper", name: "Anderson Cooper", category: "Film/TV", description: "Jedno od najprepoznatljivijih lica novinarstva, koristi svoju platformu za promicanje istine i queer vidljivosti.", connections: [{ targetId: "harvey-milk", reason: "Zajednički interes za javno zastupanje." }] },
      { id: "gilbert-baker", name: "Gilbert Baker", category: "Activism", description: "Umjetnik i aktivist koji je dizajnirao zastavu duginih boja, univerzalni simbol LGBTQ+ ponosa.", connections: [{ targetId: "harvey-milk", reason: "Harvey ga je potaknuo da stvori simbol za pokret." }] },
      { id: "pedro-almodovar", name: "Pedro Almodóvar", category: "Art", description: "Kultni španjolski redatelj čiji su filmovi prepuni queer likova, camp estetike i duboke ljudskosti.", connections: [{ targetId: "divine", reason: "Zajednička ljubav prema campu i melodrami." }] }
    ];

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Generate a list of 30 diverse and influential queer icons from history and modern pop culture. Focus on legends like Madonna, Freddie Mercury, Lady Gaga, RuPaul, Elton John, Billy Porter, Marsha P. Johnson, Harvey Milk, SOPHIE, and Janelle Monáe. For each icon, provide: 'id' (short kebab-case string), 'name', 'category' (Music, Activism, Drag, Art, Film/TV), 'description' (rich 2-3 sentence overview IN CROATIAN), and 'connections' (array of {targetId: string, reason: string} where targetId matches another icon's id, explaining the shared influence or collaboration IN CROATIAN). Output ONLY valid JSON array.",
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
