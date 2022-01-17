import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.17-alpha/deno-dom-wasm.ts";

import { quoteTranslations, typeTranslations } from "./translations.ts";

const rocketUrl = "https://thesilphroad.com/rocket-invasions";
const germanNames =
  "https://bulbapedia.bulbagarden.net/wiki/List_of_German_Pok%C3%A9mon_names";

const encoder = new TextEncoder();
const encode = encoder.encode.bind(encoder);

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

function sortBy<T extends { [key in U]: any }, U extends string>(
  a: T[],
  p: U,
): T[] {
  return a.sort(function (a: T, b: T): number {
    return a[p] > b[p] ? 1 : -1;
  });
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

Deno.writeFile(
  "./out/grunts.js",
  encode(
    `const grunts = ${JSON.stringify(sortBy(Grunt.grunts, "quote"), null, 2)};`,
  ),
);
Deno.writeFile(
  "./out/bosses.js",
  encode(
    `const bosses = ${JSON.stringify(sortBy(Boss.bosses, "name"), null, 2)};`,
  ),
);
Deno.writeFile(
  "./out/translations.js",
  encode(`const translations = {
  quotes: new Map(${JSON.stringify(quoteTranslations)}),
  types: new Map(${JSON.stringify(typeTranslations)}),
  pokemon: new Map(${JSON.stringify(nameTranslations)}),
};`),
);
