const dex = new Pokedex.Pokedex();
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
async function fill(slots) {
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
        const alolan = slots[slot][position].species.includes("Alolan");
        const name = slots[slot][position].species.toLowerCase().replace("♂", "-m").replace("♀", "-f").replace(/alolan (.*)/, "$1-alola");
        const species = document.createElement("label");
        dex.getPokemonSpeciesByName(name).then(pokemonSpecies => species.innerText = pokemonSpecies.names.find(x => x.language.name === navigator.languages.find(lang => lang.length === 2)).name);
        const ctch = document.createElement("input");
        ctch.type = "checkbox";
        ctch.disabled = true;
        ctch.checked = slots[slot][position].canBeCaught;
        const shiny = document.createElement("input");
        shiny.type = "checkbox";
        shiny.disabled = true;
        shiny.checked = slots[slot][position].canBeShiny;
        const icon = document.createElement("img");
        dex.getPokemonByName(name).then(pokemon => icon.src = pokemon.sprites.other.dream_world.front_default);
        pokemon.append(species, ctch, shiny, icon);
      }
      p[slot][position].appendChild(pokemon);
    }
  }
}
