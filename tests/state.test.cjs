const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
function dryer(moisture = 70, cycle = 'quick') {
  const elements = {};
  const get = id => elements[id] ||= { value: id === 'initialMoisture' ? String(moisture) : 'off', textContent: '', classList: { toggle() {} }, handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; } };
  let tick;
  const context = vm.createContext({ document: { getElementById: get }, setInterval(fn) { tick = fn; } });
  vm.runInContext(source, context);
  const click = id => get(id).handlers.click();
  const select = value => { get('mode').value = value; get('mode').handlers.change(); };
  const read = expression => vm.runInContext(expression, context);
  const advance = count => { for (let n = 0; n < count; n++) tick(); };
  click('door'); click('load'); click('door'); select(cycle); click('start');
  return { get, click, select, read, advance };
}
let d = dryer();
d.advance(40);
assert.equal(d.read('state'), 'running');
assert.equal(d.read('autoRepeatCount'), 1);
assert.equal(d.read('minutesLeft'), 40);
assert.equal(d.read('moistureLevel'), 30);
d.click('door'); d.advance(5); d.click('door'); d.advance(5);
assert.equal(d.read('minutesLeft'), 40);
assert.equal(d.read('moistureLevel'), 30);
d.click('start'); d.advance(40);
assert.equal(d.read('state'), 'finished');
assert.equal(d.read('moistureLevel'), 0);
console.log('PASS: damp load repeats once; door pause preserves time and moisture during repeat.');
d = dryer(50); d.advance(40);
assert.equal(d.read('state'), 'finished'); assert.equal(d.read('autoRepeatCount'), 0);
console.log('PASS: threshold value 10 finishes without repeat.');
d = dryer(100); d.advance(80);
assert.equal(d.read('state'), 'finished'); assert.equal(d.read('autoRepeatCount'), 1); assert.equal(d.read('moistureLevel'), 20);
d.advance(40); assert.equal(d.read('moistureLevel'), 20);
console.log('PASS: very damp load stops after one extra cycle, even if still damp.');
d = dryer(); d.advance(33); d.click('door'); d.click('load'); d.advance(5); d.click('door'); d.advance(5);
assert.equal(d.read('minutesLeft'), 7); assert.equal(d.read('state'), 'paused');
d.click('start'); d.advance(7); assert.equal(d.read('state'), 'finished'); assert.equal(d.read('autoRepeatCount'), 0);
console.log('PASS: removal preserves seven minutes; empty drum resumes only on Start and cannot auto-repeat.');
d = dryer(70, 'noHeat'); d.advance(40);
assert.equal(d.read('state'), 'finished'); assert.equal(d.read('moistureLevel'), 70); assert.equal(d.read('autoRepeatCount'), 0);
console.log('PASS: No Heat does not heat, change the moisture score, or auto-repeat.');
const modes = [...fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8').matchAll(/<option value="([^"]+)">/g)].map(m => m[1]);
assert.equal(modes.length, 16);
for (const mode of modes) {
 d = dryer(70, mode);
 assert.equal(d.read('state'), mode === 'off' ? 'off' : 'running');
 if (mode !== 'quick') { d.advance(40); assert.equal(d.read('autoRepeatCount'), 0); }
}
d = dryer(); d.click('door'); d.click('start'); assert.equal(d.read('state'), 'paused');
d.select('off'); d.advance(10); assert.equal(d.read('minutesLeft'), 0); assert.equal(d.get('heat').textContent, 'Heat off');
console.log('PASS: all 16 modes, open-door start guard, and Off.');
