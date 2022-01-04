import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

class Pokemon {
  constructor(
    private species: string,
    private canBeCaught: boolean,
    private canBeShiny: boolean,
  ) {
  }
}

class Grunt {
  static grunts: Grunt[] = [];
  constructor(
    private quote: string,
    private type: string,
    private slots: [Pokemon[], Pokemon[], Pokemon[]],
  ) {
    Grunt.grunts.push(this);
  }
}

class Boss {
  static bosses: Boss[] = [];
  constructor(
    private name: string,
    private slots: [Pokemon[], Pokemon[], Pokemon[]],
  ) {
    Boss.bosses.push(this);
  }
}

function query(element: Element, selector: string): string {
  return element.querySelector(selector)?.innerText!;
}

const parser = new DOMParser();
async function parse(url: string): Promise<HTMLDocument> {
  const dom = parser.parseFromString(
    await (await fetch(url)).text(),
    "text/html",
  );
  if (!dom) throw new Error("html could not be parsed!");
  return dom;
}

([...(await parse("https://thesilphroad.com/rocket-invasions"))
  .querySelectorAll(".lineupGroup")] as Element[]).forEach((foe) => {
    const quote = query(foe, ".quote")?.replace(/[“”]/g, "");
    const pokemon = ([...foe.querySelectorAll(".lineupSlot")] as Element[])
      .map((slot) =>
        ([...slot.querySelectorAll(".speciesWrap")] as Element[]).map((wrap) =>
          new (Pokemon.bind(Pokemon))(
            query(wrap, ".speciesName"),
            Boolean(wrap.querySelector(".pokeballIcon")),
            Boolean(wrap.querySelector(".shinyIcon")),
          )
        )
      ) as [Pokemon[], Pokemon[], Pokemon[]];
    if (quote) {
      new Grunt(
        quote,
        query(foe, "h3"),
        pokemon,
      );
    } else {
      new Boss(
        query(foe, ".specialFoe"),
        pokemon,
      );
    }
  });

const nameTranslations = ([...(await parse(
  "https://bulbapedia.bulbagarden.net/wiki/List_of_German_Pok%C3%A9mon_names",
)).querySelectorAll("table.roundy > tbody > tr")] as Element[]).filter((row) =>
  row.children[0].tagName === "TD"
).slice(0, -3).map((t) => {
  const texts = [...t.children].map((child) => child.innerText.trimEnd());
  return [texts[2], [texts[3], parseInt(texts[0])]];
});

console.log(`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Pokémon Go Rocket Rüpel/Bosse</title>
      <style>
        * {
          font-family: sans-serif;
        }
        img {
          display: block
        }
      </style>
    </head>
    <body>
      Rüpel:
      <select id="grunts"></select>
      Boss:
      <select id="bosses"></select>
      <table>
        <thead>
          <tr>
            <th>1.</th>
            <th>2.</th>
            <th>3.</th>
          </tr>
        </thead>
        <tbody id="team"></tbody>
      </table>
      <script>
        const grunts = ${JSON.stringify(Grunt.grunts)};
        const bosses = ${JSON.stringify(Boss.bosses)};
  
        const translations = {
          quotes: new Map([
            [
              "These waters are treacherous!",
              "Hey, du! Diese Gewässer sind trügerisch!",
            ],
            [
              "Wherever there is light, there is also shadow.",
              "Es mag etwas abgedroschen klingen, aber wo Licht ist, da ist auch Schatten!",
            ],
            ["Don't tangle with us!", "Mit uns ist nicht gut Beeren essen"],
            [
              "This buff physique isn't just for show!",
              "Dieser muskulöse Körper dient nicht nur der Show!",
            ],
            [
              "Battle against my Flying-type Pokémon!",
              "Mein Vogel-Pokémon will gegen dich kämpfen!",
            ],
            ["Get ready to be shocked!", "Du wirst schockiert sein."],
            ["Go, my super bug Pokémon!", "Los, mein super Käfer-Pokémon!"],
            [
              "You're gonna be frozen in your tracks.",
              "Du bewegst dich auf dünnem Eis!",
            ],
            [
              "Do you know how hot Pokémon fire breath can get?",
              "Weißt du eigentlich, wie heiß der Feueratem eines Pokémon sein kann?",
            ],
            ["Check out my cute Pokémon!", "Schau dir meine süßen Pokémon an!"],
            [
              "Coiled and ready to strike!",
              "Wir sind bereit. Da kannst du Gift drauf nehmen.",
            ],
            [
              "Normal does not mean weak.",
              "Normal heißt noch lange nicht schwach.",
            ],
            [
              "Are you scared of psychics that use unseen power?",
              "Hast du Angst vor unsichtbaren Kräften?",
            ],
            ["Ke...ke...ke...ke...ke...ke!", "Buhuu...Buhuu...Buhuu!"],
            ["Let's rock and roll!", "Bringen wir den Stein ins Rollen!"],
            [
              "You'll be defeated into the ground!",
              "Wir werden dich in den Boden stampfen!",
            ],
            [
              \`Don't bother - I've already won!
  Get ready to be defeated!
  Winning is for winners!\`,
              "Siegen ist für Sieger",
            ],
            [
              "These waters are treacherous!",
              "Hey, du! Diese Gewässer sind trügerisch!",
            ],
            ["ROAR! ...How'd that sound?", "Gut gebrüllt ist halb gewonnen!"],
          ]),
          types: new Map([
            ["Water", "Wasser"],
            ["Dark", "Unlicht"],
            ["Grass", "Pflanze"],
            ["Fighting", "Kampf"],
            ["Flying", "Flug"],
            ["Electric", "Elektro"],
            ["Bug", "Käfer"],
            ["Ice", "Eis"],
            ["Fire", "Feuer"],
            ["Fairy", "Fee"],
            ["Poison", "Gift"],
            ["Normal", "Normal"],
            ["Psychic", "Psycho"],
            ["Ghost", "Geist"],
            ["Rock", "Gestein"],
            ["Ground", "Boden"],
            ["Typeless", "???"],
            ["Magikarp", "Karpador"],
            ["Dragon", "Drache"],
          ]),
          pokemon: new Map(${JSON.stringify(nameTranslations)})
        };
  
        const gruntSelect = document.getElementById("grunts");
        gruntSelect.append(
          ...grunts.map((grunt) => {
            const option = document.createElement("option");
            option.innerText = translations.quotes.get(grunt.quote);
            return option;
          })
        );
        gruntSelect.value = "";
        gruntSelect.addEventListener("input", function () {
          bossSelect.value = "";
          const grunt = grunts[this.selectedIndex];
          fill(grunt.slots);
        });
  
        const bossSelect = document.getElementById("bosses");
        bossSelect.append(
          ...bosses.map((boss) => {
            const option = document.createElement("option");
            option.innerText = boss.name
              .replace("Leader", "Boss")
              .replace("Decoy Grunt", "Boss Attrappe");
            return option;
          })
        );
        bossSelect.value = "";
        bossSelect.addEventListener("input", function () {
          gruntSelect.value = "";
          const boss = bosses[this.selectedIndex];
          fill(boss.slots);
        });
  
        const team = document.getElementById("team");
        function fill(slots) {
          team.innerHTML = "";
          const p = [[], [], []];
          for (let i = 0; i < 3; i++) {
            const row = document.createElement("tr");
            team.appendChild(row);
            for (let j = 0; j < 3; j++) {
              const cel = document.createElement("td");
              row.appendChild(cel);
              p[j].push(cel);
            }
          }
          for (const slot in p) {
            for (const position in p[slot]) {
              const pokemon = document.createElement("div");
              if (slots[slot][position]) {
                const translation = translations.pokemon.get(slots[slot][position].species);
                const name = document.createElement("label");
                name.innerText = translation[0];
                const ctch = document.createElement("input");
                ctch.type = "checkbox";
                ctch.disabled = true;
                ctch.checked = slots[slot][position].canBeCaught;
                const shiny = document.createElement("input");
                shiny.type = "checkbox";
                shiny.disabled = true;
                shiny.checked = slots[slot][position].canBeShiny;
                const icon = document.createElement("img");
                icon.src = \`https://assets.thesilphroad.com/img/pokemon/icons/96x96/\${translation[1]}.png\`;
                pokemon.append(name, ctch, shiny, icon);
              }
              p[slot][position].appendChild(pokemon);
            }
          }
        }
      </script>
    </body>
  </html>
`);
