// These variables remember the appliance's current condition.
let cycle = "off";
let state = "off"; // off, ready, running, paused, or finished
let doorOpen = false;
let hasClothes = false;
let minutesLeft = 0;
let moistureLevel = 0; // An invented 0–100 score, not a real sensor reading.
let autoRepeatCount = 0;
const dryThreshold = 10;

const get = (id) => document.getElementById(id);
const cycleMinutes = 40; // Other cycle durations are classroom placeholders.

function render(message) {
  get("status").textContent = state.charAt(0).toUpperCase() + state.slice(1);
  get("timer").textContent = String(minutesLeft).padStart(2, "0") + ":00";
  // Heating depends on BOTH the selected cycle and the current state.
  if (state === "running" && cycle !== "noHeat") {
    get("heat").textContent = "Heat on";
  } else if (state === "running" && cycle === "noHeat") {
    get("heat").textContent = "Tumbling · No heat";
  } else {
    get("heat").textContent = "Heat off";
  }
  get("moistureValue").textContent = hasClothes ? moistureLevel : "No load";
  get("repeatValue").textContent = autoRepeatCount + " / 1";
  get("initialMoisture").disabled = hasClothes;
  get("initialValue").textContent = get("initialMoisture").value;
  get("cycleValue").textContent = cycle;
  get("stateValue").textContent = state;
  get("doorValue").textContent = doorOpen;
  get("clothesValue").textContent = hasClothes;
  get("minutesValue").textContent = minutesLeft;
  get("door").textContent = doorOpen ? "Close door" : "Open door";
  get("load").textContent = hasClothes ? "Remove clothes" : "Load clothes";
  get("doorLabel").textContent = (doorOpen ? "Door open" : "Door closed") + (hasClothes ? " · Loaded" : " · Empty");
  get("doorVisual").classList.toggle("open", doorOpen);
  get("drum").classList.toggle("empty", !hasClothes);
  get("drum").classList.toggle("running", state === "running");
  if (message) get("message").textContent = message;
}

// A change event fires when the user selects a different cycle.
get("mode").addEventListener("change", function () {
  cycle = get("mode").value;
  autoRepeatCount = 0;
  if (cycle === "off") {
    state = "off";
    minutesLeft = 0;
    render("Dryer switched off. The timer has been cleared.");
  } else {
    state = "ready";
    minutesLeft = cycleMinutes;
    render("Cycle selected. Press Start with the door closed. Changing cycles resets the timer.");
  }
});

get("start").addEventListener("click", function () {
  if (cycle === "off") {
    render("Select a cycle first.");
  } else if (doorOpen) {
    render("Close the door before pressing Start.");
  } else if (state === "running") {
    state = "paused";
    render("Cycle paused. Press Start to resume.");
  } else {
    if (state === "finished") {
      minutesLeft = cycleMinutes;
      autoRepeatCount = 0; // A new manually started run gets its own one-repeat limit.
    }
    state = "running";
    render(cycle === "noHeat" ? "Air Fluff / No Heat is running without heat." : "Selected cycle is running with simulated heat.");
  }
});

get("door").addEventListener("click", function () {
  doorOpen = !doorOpen;
  if (doorOpen && state === "running") state = "paused";
  // Closing the door never sets state to running: Start is required.
  render(doorOpen ? "Door open. The drum and heat are stopped." : "Door closed. Press Start when you are ready.");
});

get("load").addEventListener("click", function () {
  if (!doorOpen) {
    render("Open the door before loading or removing clothes.");
  } else {
    hasClothes = !hasClothes;
    if (hasClothes) moistureLevel = Number(get("initialMoisture").value);
    else moistureLevel = 0;
    // Loading/removing clothes does not reset the timer or resume the cycle.
    render(hasClothes ? "Clothes loaded. Remaining time preserved. Close the door and press Start to continue." : "Clothes removed. Remaining time preserved. Close the door and press Start to continue.");
  }
});

get("initialMoisture").addEventListener("input", function () {
  render(); // Choose a simulated starting moisture before loading clothes.
});

// Each timer callback represents one simulated minute.
setInterval(function () {
  if (state === "running") {
    minutesLeft -= 1;
    if (hasClothes && cycle !== "noHeat") {
      moistureLevel = Math.max(0, moistureLevel - 1);
    }
    if (minutesLeft <= 0) {
      minutesLeft = 0;
      // Only Quick 40 may automatically repeat, and only once per manual run.
      if (cycle === "quick" && hasClothes && moistureLevel > dryThreshold && autoRepeatCount < 1) {
        autoRepeatCount += 1;
        minutesLeft = cycleMinutes;
        render("Still damp: the simulated sensor started one extra Quick 40 cycle.");
      } else {
        state = "finished";
        if (!hasClothes) render("Cycle finished. The drum is empty.");
        else if (moistureLevel <= dryThreshold) render("Cycle finished. The simulated sensor reads dry.");
        else if (cycle === "quick" && autoRepeatCount === 1) render("Extra cycle finished. Still damp in this simulation; the one-repeat limit has been reached. Check the clothes.");
        else render("Cycle finished. Still damp in this simulation. Press Start for another cycle if needed.");
      }
    } else {
      render();
    }
  }
}, 1000);

render();
