import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.17-alpha/deno-dom-wasm.ts";

import { quoteTranslations, typeTranslations } from "./translations.ts";

const rocketUrl = "https://thesilphroad.com/rocket-invasions";
const germanNames =
  "https://bulbapedia.bulbagarden.net/wiki/List_of_German_Pok%C3%A9mon_names";

class Pokemon {
  constructor(
    public species: string,
    public canBeCaught: boolean,
    public canBeShiny: boolean,
  ) {}
}

class Grunt {
  static grunts: Grunt[] = [];
  constructor(
    public quote: string,
    public type: string,
    public slots: [Pokemon[], Pokemon[], Pokemon[]],
  ) {
    Grunt.grunts.push(this);
  }
}

class Boss {
  static bosses: Boss[] = [];
  constructor(
    public name: string,
    public slots: [Pokemon[], Pokemon[], Pokemon[]],
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

([...(await parse(rocketUrl)).querySelectorAll(".lineupGroup")] as Element[])
  .forEach((foe) => {
    const quote = query(foe, ".quote")?.replace(/[“”]/g, "");
    const pokemon = ([...foe.querySelectorAll(".lineupSlot")] as Element[]).map(
      (slot) =>
        ([...slot.querySelectorAll(".speciesWrap")] as Element[]).map(
          (wrap) =>
            new (Pokemon.bind(Pokemon))(
              query(wrap, ".speciesName"),
              Boolean(wrap.querySelector(".pokeballIcon")),
              Boolean(wrap.querySelector(".shinyIcon")),
            ),
        ),
    ) as [Pokemon[], Pokemon[], Pokemon[]];
    if (quote) {
      new Grunt(quote, query(foe, "h3"), pokemon);
    } else {
      new Boss(query(foe, ".specialFoe"), pokemon);
    }
  });

const nameTranslations: [string, [string, number]][] =
  ([...(await parse(germanNames)).querySelectorAll(
    "table.roundy > tbody > tr",
  )] as Element[]).filter((row) => row.children[0].tagName === "TD").slice(
    0,
    -3,
  ).map((t) => {
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
          display: block;
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
        const grunts = ${
  JSON.stringify(Grunt.grunts.sort((a, b) => a.quote > b.quote ? 1 : -1))
};
        const bosses = ${
  JSON.stringify(Boss.bosses.sort((a, b) => a.name > b.name ? 1 : -1))
};
        const translations = {
          quotes: new Map(${JSON.stringify(quoteTranslations)}),
          types: new Map(${JSON.stringify(typeTranslations)}),
          pokemon: new Map(${JSON.stringify(nameTranslations)}),
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
