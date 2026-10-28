import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDameAdvantage,
  calculateIgisoroAdvantage,
  calculateBiyariAdvantage,
  calculateHonorReward,
} from './matchScoring.ts';

test('Dame Scoring: tracks pieces captured and advantage cleanly', () => {
  const initial = calculateDameAdvantage(0, 0);
  assert.equal(initial.leader, null);
  assert.equal(initial.advantage, 0);

  const aLeads = calculateDameAdvantage(3, 1);
  assert.equal(aLeads.leader, 'A');
  assert.equal(aLeads.advantage, 0.2);

  const bLeads = calculateDameAdvantage(2, 6);
  assert.equal(bLeads.leader, 'B');
  assert.equal(bLeads.advantage, 0.4);

  const win = calculateDameAdvantage(10, 4);
  assert.equal(win.isDecisiveWin, true);
  assert.equal(win.winner, 'A');
  assert.equal(win.advantage, 1.0);
});

test('Igisoro Scoring: tracks seed proportion w = |2p - 1|', () => {
  const tie = calculateIgisoroAdvantage(32, 32);
  assert.equal(tie.leader, null);
  assert.equal(tie.advantage, 0);

  const aLeads = calculateIgisoroAdvantage(48, 16);
  assert.equal(aLeads.leader, 'A');
  assert.equal(aLeads.advantage, 0.5);

  const decisive = calculateIgisoroAdvantage(64, 0);
  assert.equal(decisive.isDecisiveWin, true);
  assert.equal(decisive.winner, 'A');
  assert.equal(decisive.advantage, 1.0);
});

test('Biyari Scoring: evaluates potted balls and clean 8-ball victory', () => {
  const midGame = calculateBiyariAdvantage(3, 1);
  assert.equal(midGame.leader, 'A');
  assert.ok(midGame.advantage > 0);

  const sevenPotted = calculateBiyariAdvantage(7, 2);
  assert.equal(sevenPotted.isDecisiveWin, false);
  assert.equal(sevenPotted.winner, null);

  const win = calculateBiyariAdvantage(7, 2, true, false);
  assert.equal(win.isDecisiveWin, true);
  assert.equal(win.winner, 'A');
  assert.equal(win.scoreA, 7);
  assert.equal(win.advantage, 1.0);
});

test('Honor Rewards: awards sportsmanship points without monetary wagering', () => {
  const winReward = calculateHonorReward('win', 5);
  assert.equal(winReward, 25);

  const lossReward = calculateHonorReward('loss', 4);
  assert.equal(lossReward, 14);

  const drawReward = calculateHonorReward('draw', 5);
  assert.equal(drawReward, 20);

  const concludeReward = calculateHonorReward('conclude', 5);
  assert.equal(concludeReward, 20);
});
