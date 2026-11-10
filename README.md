# One More Quick 40

An appliance doodle by Qingyu Liu, built with HTML, CSS, and JavaScript from a photograph and description of a home dryer, with Codex assistance.

## Run

Open `index.html` in a browser. No installation or build step is needed.

## Try it

1. Leave the initial simulated moisture score at 70.
2. Open the door, load clothes, close the door, and choose Quick 40.
3. Press Start. One second represents one simulated minute.
4. After 40 seconds the score is 30, so one additional cycle starts automatically.
5. After that extra cycle the dryer stops. There is at most one automatic repeat per manual run.

Try a starting score of 50 for no automatic repeat, or 100 to see the repeat limit reached with clothes still damp. Choose the score before loading. Only Quick 40 can repeat automatically.

Opening the door pauses the timer and moisture change. Closing it never resumes automatically. Removing or loading clothes preserves remaining time; an empty drum can resume on Start but cannot trigger an automatic repeat. Changing modes resets the timer and repeat counter.

## Assumptions

All 16 photographed dial positions are included. Other cycle durations are 40-minute placeholders. Heated cycles reduce an invented moisture score by one point per simulated minute. No Heat leaves that score unchanged. Scores at or below 10 mean dry only within this model. This is not a physical moisture measurement or a complete reproduction of the manufacturer's programs.

## Files

- `index.html`: controls, feedback, and inspiration photograph.
- `style.css`: responsive layout and optional drum animation.
- `script.js`: state variables, event handlers, and control flow.
- `WRITEUP.md`: English assignment write-up.
- `tests/state.test.cjs`: automated state-transition checks (run with `node tests/state.test.cjs`).

The write-up distinguishes the student's reported tests from Codex's automated checks. The proposed moisture feature is a design improvement, not a verified feature of the original dryer.
