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
      {
        id: "marsha-p-johnson",
        name: "Marsha P. Johnson",
        category: "Activism",
        description: "Ključna figura Stonewall pobune 1969. i pionirka transrodnog aktivizma u New Yorku.",
        decade: 1960,
        sentimentScore: 0.9,
        connections: [
          { targetId: "harvey-milk", reason: "Zajednička borba za civilna prava u 70-ima.", strength: 0.8 },
          { targetId: "sylvester", reason: "Zajednički korijeni u oslobođenju i uličnoj kulturi.", strength: 0.8 },
          { targetId: "laverne-cox", reason: "Povijesni uzor i inspiracija za transrodni pokret.", strength: 0.95 }
        ]
      },
      {
        id: "harvey-milk",
        name: "Harvey Milk",
        category: "Activism",
        description: "Prvi otvoreno gay političar izabran u Kaliforniji, borac za LGBT prava i jednakost.",
        decade: 1970,
        sentimentScore: 0.85,
        connections: [
          { targetId: "marsha-p-johnson", reason: "Suvremeno političko i aktivističko povezivanje.", strength: 0.75 },
          { targetId: "james-baldwin", reason: "Pristup borbi kroz intelektualno i tekstualno oslobođenje.", strength: 0.6 },
          { targetId: "gilbert-baker", reason: "Potaknuo dizajniranje prve zastave duginih boja kao simbola.", strength: 0.95 }
        ]
      },
      {
        id: "gilbert-baker",
        name: "Gilbert Baker",
        category: "Activism",
        description: "Umjetnik i aktivist koji je dizajnirao globalno prepoznatljivu zastavu duginih boja.",
        decade: 1970,
        sentimentScore: 0.95,
        connections: [
          { targetId: "harvey-milk", reason: "Milk ga je potaknuo da stvori univerzalni simbol za zajednicu.", strength: 0.95 }
        ]
      },
      {
        id: "freddie-mercury",
        name: "Freddie Mercury",
        category: "Music",
        description: "Karizmatični vokal grupe Queen koji je redefinirao muški scenski nastup i rock izričaj.",
        decade: 1970,
        sentimentScore: 0.95,
        connections: [
          { targetId: "david-bowie", reason: "Legendarna suradnja na pjesmi 'Under Pressure' i glam-rock estetika.", strength: 1.0 },
          { targetId: "lady-gaga", reason: "Scenski uzor i inspiracija za njezino umjetničko ime.", strength: 0.8 },
          { targetId: "elton-john", reason: "Dugogodišnje prijateljstvo i zajedničko razbijanje barijera u pop kulturi.", strength: 0.9 }
        ]
      },
      {
        id: "david-bowie",
        name: "David Bowie",
        category: "Music",
        description: "Legendarni androgini glazbenik koji je kroz Ziggy Stardusta ponudio model za queer izvedbu.",
        decade: 1970,
        sentimentScore: 0.92,
        connections: [
          { targetId: "freddie-mercury", reason: "Rani utjecaj na glam-rock i androgini spektakl.", strength: 1.0 },
          { targetId: "lady-gaga", reason: "Uzor za njezinu kazališno-monstruoznu pop estetiku.", strength: 0.9 },
          { targetId: "lou-reed", reason: "Bliska glazbena suradnja i produkcija albuma 'Transformer'.", strength: 0.95 },
          { targetId: "grace-jones", reason: "Zajedničko razbijanje rodnih normi kroz modu i androgini stil.", strength: 0.8 }
        ]
      },
      {
        id: "lou-reed",
        name: "Lou Reed",
        category: "Music",
        description: "Frontman Velvet Undergrounda koji je uveo teme underground queer života u rock klasike.",
        decade: 1970,
        sentimentScore: 0.72,
        connections: [
          { targetId: "david-bowie", reason: "Bowie mu je koproducirao ključni album 'Transformer'.", strength: 0.95 },
          { targetId: "andy-warhol", reason: "Andyeva 'Factory' scena i Velvet Underground simbioza.", strength: 0.95 }
        ]
      },
      {
        id: "grace-jones",
        name: "Grace Jones",
        category: "Music",
        description: "Kultna androgina ikona, pjevačica i model čiji je scenski gard izazivao rasne i rodne stereotipe.",
        decade: 1980,
        sentimentScore: 0.88,
        connections: [
          { targetId: "david-bowie", reason: "Zajedničko pomicanje granica androgine mode i scenskog rada.", strength: 0.8 },
          { targetId: "lady-gaga", reason: "Avangardna estetika koja je izravno utjecala na Gagin vizualni izričaj.", strength: 0.8 },
          { targetId: "annie-lennox", reason: "Upotreba maskuline estetike u pop kulturi 1980-ih.", strength: 0.7 }
        ]
      },
      {
        id: "annie-lennox",
        name: "Annie Lennox",
        category: "Music",
        description: "Vokalistica Eurythmicsa poznata po maskulinom androgiziranom odijelu i propitivanju ormara u pop medijima.",
        decade: 1980,
        sentimentScore: 0.9,
        connections: [
          { targetId: "david-bowie", reason: "Izvedbeno modeliranje androgine snage na scenskom prostoru.", strength: 0.8 },
          { targetId: "grace-jones", reason: "Propitivanje vizualnih rodnih uloga i snažne scenske prisutnosti.", strength: 0.7 }
        ]
      },
      {
        id: "lady-gaga",
        name: "Lady Gaga",
        category: "Music",
        description: "Pop vizionarka i ikona koja ujedinjuje camp, avangardnu modu i bezuvjetnu podršku queer zajednici.",
        decade: 2010,
        sentimentScore: 0.9,
        connections: [
          { targetId: "david-bowie", reason: "Tribute nastup na Grammyjima 2016. i praćenje Ziggy predloška.", strength: 0.9 },
          { targetId: "freddie-mercury", reason: "Naziv Gaga inspiriran je kultnim hitom 'Radio Ga Ga'.", strength: 0.8 },
          { targetId: "madonna", reason: "Poštovanje prema kraljici popa i ballroom utjecajima u mainstreamu.", strength: 0.8 },
          { targetId: "alexander-mcqueen", reason: "Konceptualno-modna simbioza u spotu 'Bad Romance' i revijama.", strength: 0.95 }
        ]
      },
      {
        id: "madonna",
        name: "Madonna",
        category: "Music",
        description: "Kraljica popa koja je ballroom kulturu i plesni vogueing dovela u globalni mainstream.",
        decade: 1980,
        sentimentScore: 0.85,
        connections: [
          { targetId: "lady-gaga", reason: "Postavljanje temelja za avangardni i provokativni ženski pop spektakl.", strength: 0.8 },
          { targetId: "keith-haring", reason: "Rano njujorško prijateljstvo i zajednički kreativni underground krug.", strength: 0.9 },
          { targetId: "sylvester", reason: "Disko i plesna klupska elektronika koja je izravno utjecala na njezin dance zvuk.", strength: 0.75 }
        ]
      },
      {
        id: "elton-john",
        name: "Elton John",
        category: "Music",
        description: "Jedan od najuspješnijih pop glazbenika svih vremena, borac protiv HIV/AIDS-a i ikona glamurozne mode.",
        decade: 1970,
        sentimentScore: 0.96,
        connections: [
          { targetId: "freddie-mercury", reason: "Duboko prijateljstvo, suradnja i zajedničko razdoblje pop-rock ekscentričnosti.", strength: 0.9 },
          { targetId: "lil-nas-x", reason: "Kreativna glazbena potpora i mentorski doprinos mlađoj generaciji.", strength: 0.85 }
        ]
      },
      {
        id: "lil-nas-x",
        name: "Lil Nas X",
        category: "Music",
        description: "Umjetnik mlađe generacije koji otvoreno i provokativno dekonstruira homofobiju unutar hip-hop žanra.",
        decade: 2020,
        sentimentScore: 0.8,
        connections: [
          { targetId: "elton-john", reason: "Zajednička glazbena suradnja i generacijski most.", strength: 0.85 },
          { targetId: "rupaul", reason: "Propitivanje maskuliniteta i rodnih uloga u crnačkoj pop kulturi.", strength: 0.8 }
        ]
      },
      {
        id: "sylvester",
        name: "Sylvester",
        category: "Music",
        description: "Ikona disco i hi-NRG glazbe sa prepoznatljivim falsetom, androgina legenda San Francisca.",
        decade: 1970,
        sentimentScore: 0.82,
        connections: [
          { targetId: "marsha-p-johnson", reason: "Poštovanje prema uličnom oslobođenju i klupskim korijenima.", strength: 0.8 },
          { targetId: "madonna", reason: "Glazbeni utjecaj disko ritmova na ranu njujoršku klupsku pop produkciju.", strength: 0.75 }
        ]
      },
      {
        id: "boy-george",
        name: "Boy George",
        category: "Music",
        description: "Frontman Culture Cluba čiji je androgini izgled obilježio pop kulturu i TV ekrane 1980-ih.",
        decade: 1980,
        sentimentScore: 0.85,
        connections: [
          { targetId: "david-bowie", reason: "Androgina i kazališna inspiracija iz ere Ziggyja Stardusta.", strength: 0.8 },
          { targetId: "anohni", reason: "Kreativna suradnja u dirljivom duetu 'You Are My Sister'.", strength: 0.9 }
        ]
      },
      {
        id: "anohni",
        name: "Anohni",
        category: "Music",
        description: "Transrodna vokalistica poznata po dubokoj emotivnosti i borbi protiv patrijarhalnih i rodnih stereotipa.",
        decade: 2000,
        sentimentScore: 0.92,
        connections: [
          { targetId: "boy-george", reason: "Zajednički rad na predivnom duetu 'You Are My Sister'.", strength: 0.9 },
          { targetId: "rufus-wainwright", reason: "Povezanost kroz modernu melankoličnu art-pop scenu.", strength: 0.7 }
        ]
      },
      {
        id: "mykki-blanco",
        name: "Mykki Blanco",
        category: "Music",
        description: "Transrodni reper i pjesnik koji je redefinirao granice hip-hopa kroz agresivno queer izražavanje.",
        decade: 2010,
        sentimentScore: 0.88,
        connections: [
          { targetId: "zebra-katz", reason: "Kreativna bliskost i zajedničko pokretanje queer rap vala.", strength: 0.85 },
          { targetId: "le1f", reason: "Izgradnja modernog klupskog queer hip-hop izričaja.", strength: 0.8 }
        ]
      },
      {
        id: "zebra-katz",
        name: "Zebra Katz",
        category: "Music",
        description: "Minimalistički i mračni queer rap izvođač čija mješavina mode i glazbe ruši žanrovska očekivanja.",
        decade: 2010,
        sentimentScore: 0.85,
        connections: [
          { targetId: "mykki-blanco", reason: "Pionirsko zajedničko djelovanje na njujorškoj art-rap sceni.", strength: 0.85 }
        ]
      },
      {
        id: "le1f",
        name: "Le1f",
        category: "Music",
        description: "Upečatljivi njujorški producent i reper koji spaja tradiciju ball kulture s futurističkim hip-hop klupskim ritmovima.",
        decade: 2010,
        sentimentScore: 0.83,
        connections: [
          { targetId: "mykki-blanco", reason: "Zajedničko oblikovanje i osnaživanje underground queer rap scene.", strength: 0.8 },
          { targetId: "rupaul", reason: "Inkorporacija elemenata performansa i androgine estetike u rap formi.", strength: 0.7 }
        ]
      },
      {
        id: "rufus-wainwright",
        name: "Rufus Wainwright",
        category: "Music",
        description: "Art-pop i operni skladatelj poznat po vaudevillskom camp senzibilitetu i melodioznim vokalnim dionicama.",
        decade: 2000,
        sentimentScore: 0.9,
        connections: [
          { targetId: "anohni", reason: "Usko povezani u melodramatičnoj i androginoj art-pop niši.", strength: 0.7 }
        ]
      },
      {
        id: "felix-gonzalez-torres",
        name: "Félix González-Torres",
        category: "Art",
        description: "Konceptualni umjetnik koji kroz minimalistički medij bombona i satova progovara o ljubavi, prolaznosti i gubitku.",
        decade: 1990,
        sentimentScore: 0.97,
        connections: [
          { targetId: "zoe-leonard", reason: "Zajednička estetika sjećanja, žalovanja iAct Up aktivističkog kruga.", strength: 0.95 },
          { targetId: "keith-haring", reason: "Aktivističko korištenje umjetnosti kao odgovora na AIDS pandemiju.", strength: 0.9 },
          { targetId: "andy-warhol", reason: "Serijska repeticija svakodnevnih predmeta s novim intimnim značenjem.", strength: 0.8 }
        ]
      },
      {
        id: "zoe-leonard",
        name: "Zoe Leonard",
        category: "Art",
        description: "Umjetnica i fotografkinja čije djelo 'Strange Fruit' prenosi tragiku i ustrajnost kroz zašivene komade kore voća.",
        decade: 1990,
        sentimentScore: 0.94,
        connections: [
          { targetId: "felix-gonzalez-torres", reason: "Slična estetika žalovanja i redefiniranja svakodnevice kroz intimu.", strength: 0.95 },
          { targetId: "keith-haring", reason: "Njujorška radikalna aktivističko-umjetnička potpora u zlokobnom desetljeću.", strength: 0.85 }
        ]
      },
      {
        id: "andy-warhol",
        name: "Andy Warhol",
        category: "Art",
        description: "Otac pop-arta čija je legendarna 'Factory' bila rano sigurno utočište za queer umjetnike i trans ikone.",
        decade: 1960,
        sentimentScore: 0.85,
        connections: [
          { targetId: "keith-haring", reason: "Duboko mentorsko i prijateljsko povezivanje u pop-artu.", strength: 0.95 },
          { targetId: "lou-reed", reason: "Kreativna simbioza s Velvet Undergroundom u ranoj kreativnoj fazi.", strength: 0.95 },
          { targetId: "devan-shimoyama", reason: "Shimoyamina serija predstavlja izravan odgovor na kultne Warholove drag queen serijale.", strength: 0.9 }
        ]
      },
      {
        id: "keith-haring",
        name: "Keith Haring",
        category: "Art",
        description: "Umjetnik i ulični aktivist čiji su radovi s prepoznatljivim figurama postali globalni vizualni simbol borbe protiv AIDS-a.",
        decade: 1980,
        sentimentScore: 0.96,
        connections: [
          { targetId: "andy-warhol", reason: "Duboki utjecaj kroz pop-art principe i blisko prijateljstvo.", strength: 0.95 },
          { targetId: "madonna", reason: "Prijateljstvo i suradnja u ranoj njujorškoj underground sceni.", strength: 0.9 },
          { targetId: "felix-gonzalez-torres", reason: "Borba protiv političke pasivnosti i sjećanje na žrtve AIDS-a.", strength: 0.9 }
        ]
      },
      {
        id: "devan-shimoyama",
        name: "Devan Shimoyama",
        category: "Art",
        description: "Suvremeni slikar koji u radovima miješa klasičnu formu i pop kulturu istražujući crnački queer identitet.",
        decade: 2010,
        sentimentScore: 0.9,
        connections: [
          { targetId: "andy-warhol", reason: "Shimoyamina serija predstavlja izravan odgovor na kultne Warholove drag queen serijale.", strength: 0.9 }
        ]
      },
      {
        id: "ellsworth-kelly",
        name: "Ellsworth Kelly",
        category: "Art",
        description: "Slikar apstraktnog kova čije propitivanje formi i prostora utječe na queer formalističko sagledavanje odnosa.",
        decade: 1950,
        sentimentScore: 0.95,
        connections: [
          { targetId: "andy-warhol", reason: "Most između čiste apstrakcije i pop-art vizualnog vala.", strength: 0.75 }
        ]
      },
      {
        id: "james-baldwin",
        name: "James Baldwin",
        category: "Literature & Theory",
        description: "Jedan od najvećih američkih književnika koji je secirao bolne točke rase, opresije i seksualnosti u 20. stoljeću.",
        decade: 1950,
        sentimentScore: 0.95,
        connections: [
          { targetId: "harvey-milk", reason: "Političko djelovanje i intelektualni utjecaj slobodarskih misli.", strength: 0.6 },
          { targetId: "audre-lorde", reason: "Legendarni razgovori o rasi, rodu i sudbinama manjina.", strength: 0.95 }
        ]
      },
      {
        id: "audre-lorde",
        name: "Audre Lorde",
        category: "Literature & Theory",
        description: "Kvir-feministička ikona, spisateljica i aktivistica koja je uvela koncept erotskog kao poluge moći i otpora.",
        decade: 1970,
        sentimentScore: 0.96,
        connections: [
          { targetId: "james-baldwin", reason: "Duboki intelektualni dijalog i preklapanje rasnih te spolnih opresija.", strength: 0.95 }
        ]
      },
      {
        id: "oscar-wilde",
        name: "Oscar Wilde",
        category: "Literature & Theory",
        description: "Genij viktorijanskog estetizma čija je osuda zbog 'nedoličnog ponašanja' postala povijesni simbol nepravde.",
        decade: 1890,
        sentimentScore: 0.5,
        connections: [
          { targetId: "james-baldwin", reason: "Uzor za intelektualno propitivanje rigidnog morala u književnosti.", strength: 0.6 },
          { targetId: "susan-sontag", reason: "Njezine teze o campu oslanjaju se izravno na Wildeovu estetiku.", strength: 0.9 }
        ]
      },
      {
        id: "susan-sontag",
        name: "Susan Sontag",
        category: "Literature & Theory",
        description: "Kultna esejistica i kritičarka čiji je tekst 'Zapisi o campu' redefinirao poimanje stila i estetike.",
        decade: 1960,
        sentimentScore: 0.92,
        connections: [
          { targetId: "oscar-wilde", reason: "Svoju kultnu teoriju o campu posvetila je Wildeovoj androginoj estetici.", strength: 0.9 },
          { targetId: "michel-foucault", reason: "Povezanost kroz analizu diskursa seksualnosti i bolesti kao metafore.", strength: 0.8 }
        ]
      },
      {
        id: "michel-foucault",
        name: "Michel Foucault",
        category: "Literature & Theory",
        description: "Francuski filozof čija je 'Povijest seksualnosti' dekonstruirala ideju da je seksualnost prirođena biološka datost.",
        decade: 1970,
        sentimentScore: 0.9,
        connections: [
          { targetId: "judith-butler", reason: "Neposredan utjecaj na njezino poimanje roda kao diskurzivnog i reguliranog efekta.", strength: 0.95 },
          { targetId: "eve-kosofsky-sedgwick", reason: "Zajedničko propitivanje tajne ormara kao centralnog poretka znanja.", strength: 0.9 }
        ]
      },
      {
        id: "judith-butler",
        name: "Judith Butler",
        category: "Literature & Theory",
        description: "Najutjecajnija teoretičarka roda koja je uvela revolucionarnu tezu da su rod i spol performativni učinci.",
        decade: 1990,
        sentimentScore: 0.88,
        connections: [
          { targetId: "michel-foucault", reason: "Nadogradnja teorije o strukturama moći i kontroli tijela.", strength: 0.95 },
          { targetId: "eve-kosofsky-sedgwick", reason: "Kreatorice samih temelja kvir teorije u ranim 90-ima.", strength: 0.9 },
          { targetId: "rupaul", reason: "Njezino sagledavanje draga kao parodijskog razotkrivanja rodne iluzije.", strength: 0.85 }
        ]
      },
      {
        id: "eve-kosofsky-sedgwick",
        name: "Eve Kosofsky Sedgwick",
        category: "Literature & Theory",
        description: "Utemeljiteljica kvir studija koja je u 'Epistemologiji ormara' pokazala koliko su znanje i kultura strukturirani kroz tajne.",
        decade: 1990,
        sentimentScore: 0.92,
        connections: [
          { targetId: "michel-foucault", reason: "Kritička nadogradnja koncepta seksualnosti i regulacije znanja.", strength: 0.9 },
          { targetId: "judith-butler", reason: "Sinergijsko djelovanje na postavljanju temelja moderne kvir teorije.", strength: 0.9 }
        ]
      },
      {
        id: "heather-cassils",
        name: "Heather Cassils",
        category: "Performance Art",
        description: "Transrodna i nebinarna umjetnica snage, u uratku 'Becoming an Image' udara glinu u mraku propitujući tijelo.",
        decade: 2010,
        sentimentScore: 0.93,
        connections: [
          { targetId: "felix-gonzalez-torres", reason: "Apstraktan i mučni fizički izričaj kao protest protiv zaborava.", strength: 0.8 }
        ]
      },
      {
        id: "alexander-mcqueen",
        name: "Alexander McQueen",
        category: "Art",
        description: "Modni genij i vizionar čije su mračne revije bile vrhunski queer performansi pomicanja tjelesnih granica.",
        decade: 1990,
        sentimentScore: 0.95,
        connections: [
          { targetId: "lady-gaga", reason: "Njegove kultne cipele i vizuali stvorili su Gaginu prepoznatljivu eru.", strength: 0.95 }
        ]
      },
      {
        id: "laverne-cox",
        name: "Laverne Cox",
        category: "Film/TV",
        description: "Aktivistica i glumica, prva transrodna osoba nominirana za Emmy i na naslovnici magazina Time.",
        decade: 2010,
        sentimentScore: 0.95,
        connections: [
          { targetId: "marsha-p-johnson", reason: "Odavanje počasti korijenima transrodnog otpora iz ere Stonewalla.", strength: 0.9 }
        ]
      },
      {
        id: "rupaul",
        name: "RuPaul",
        category: "Drag",
        description: "Revolucionarna drag queen, pjevačica i TV producentica, odmarširala iz underground dreg klubova do vrha mainstreama.",
        decade: 1990,
        sentimentScore: 0.8,
        connections: [
          { targetId: "marsha-p-johnson", reason: "Zajedničke duboke počasti prema korijenima uličnog aktivizma i Stonewalla.", strength: 0.6 },
          { targetId: "lil-nas-x", reason: "Potpora i mentorski doprinos unutar crne dreg i pop produkcije.", strength: 0.9 }
        ]
      }
    ];

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Generate a list of exactly 30 diverse queer icons, ensuring that Lady Gaga (id: 'lady-gaga', category: 'Music') is absolutely included on the list. For each icon provide: 'id', 'name', 'category' (strictly one of: 'Music', 'Activism', 'Drag', 'Art', 'Film/TV', 'Literature & Theory', 'Performance Art'), 'description' (in Croatian), 'decade' (integer, e.g. 1960), 'sentimentScore' (float -1.0 to 1.0 representing media perception), and 'connections' (array of {targetId, reason, strength: float 0.1-1.0}). Ensure clear criteria for inclusion: icons must have a documented impact on queer cultural heritage. Ensure all connection targetIds point only to other icons present in the return list. Output valid JSON.",
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
