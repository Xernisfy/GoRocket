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
        const translation = translations.pokemon.get(
          slots[slot][position].species
        );
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
        icon.src = `https://assets.thesilphroad.com/img/pokemon/icons/96x96/${translation[1]}.png`;
        pokemon.append(name, ctch, shiny, icon);
      }
      p[slot][position].appendChild(pokemon);
    }
  }
}
