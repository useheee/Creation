import assert from 'node:assert/strict';
import { JumpCounter } from './counter.mjs';
const c=new JumpCounter();let t=0;
for(;t<=2100;t+=33)c.update(.6,t);
assert.notEqual(c.base,null);
for(let j=0;j<10;j++){for(const y of [.6,.59,.575,.57,.575,.59,.6,.6,.6,.6]){t+=33;c.update(y,t);}}
assert.equal(c.count,10);
for(let i=0;i<100;i++){t+=33;c.update(.6+Math.sin(i)*.002,t);}
assert.equal(c.count,10);
c.update(NaN,t+33);assert.equal(c.base,null);assert.equal(c.count,10);
c.reset();assert.equal(c.count,0);
console.log('PASS: calibration, 10 jumps, idle noise, lost tracking, reset');
