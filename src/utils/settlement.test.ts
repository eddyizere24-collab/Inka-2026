import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSettlement,
  calculateDameAdvantage,
  calculateIgisoroAdvantage,
  calculateBiyariAdvantage,
} from './settlement.ts';

test('Settlement Engine: matches worked example 1 (5 vs 5, A leads w=0.2)', () => {
  const result = calculateSettlement(5, 5, 'A', 0.2);
  assert.equal(result.holdingA, 6.0);
  assert.equal(result.holdingB, 4.0);
  assert.equal(result.totalPool, 10.0);
  assert.equal(result.deltaA, 1.0);
  assert.equal(result.deltaB, -1.0);
});

test('Settlement Engine: matches worked example 2 (5 vs 5, A leads w=0.5)', () => {
  const result = calculateSettlement(5, 5, 'A', 0.5);
  assert.equal(result.holdingA, 7.5);
  assert.equal(result.holdingB, 2.5);
  assert.equal(result.totalPool, 10.0);
});

test('Settlement Engine: matches worked example 3 (4 vs 5, B leads w=0.4)', () => {
  const result = calculateSettlement(4, 5, 'B', 0.4);
  assert.equal(result.holdingA, 2.4);
  assert.equal(result.holdingB, 6.6);
  assert.equal(result.totalPool, 9.0);
});

test('Settlement Engine: matches worked example 4 (3 vs 10, A leads w=0.5)', () => {
  const result = calculateSettlement(3, 10, 'A', 0.5);
  assert.equal(result.holdingA, 8.0);
  assert.equal(result.holdingB, 5.0);
  assert.equal(result.totalPool, 13.0);
});

test('Settlement Engine: matches worked example 5 (3 vs 10, A leads w=1.0)', () => {
  const result = calculateSettlement(3, 10, 'A', 1.0);
  assert.equal(result.holdingA, 13.0);
  assert.equal(result.holdingB, 0.0);
  assert.equal(result.totalPool, 13.0);
});

test('Settlement Engine: matches worked example 6 (3 vs 10, B leads w=0.5)', () => {
  const result = calculateSettlement(3, 10, 'B', 0.5);
  assert.equal(result.holdingA, 1.5);
  assert.equal(result.holdingB, 11.5);
  assert.equal(result.totalPool, 13.0);
});

test('Settlement Engine: matches worked example 7 (3 vs 10, B leads w=1.0)', () => {
  const result = calculateSettlement(3, 10, 'B', 1.0);
  assert.equal(result.holdingA, 0.0);
  assert.equal(result.holdingB, 13.0);
  assert.equal(result.totalPool, 13.0);
});

test('Settlement Engine: starting at w=0 preserves exact original stakes', () => {
  const result = calculateSettlement(8, 6, null, 0);
  assert.equal(result.holdingA, 8);
  assert.equal(result.holdingB, 6);
  assert.equal(result.deltaA, 0);
  assert.equal(result.deltaB, 0);
});

test('Dame Advantage: net piece diff calculation and decisive win', () => {
  // A captures 3, B captures 1 -> net +2 -> w = 0.2
  const adv1 = calculateDameAdvantage(3, 1);
  assert.equal(adv1.leader, 'A');
  assert.equal(adv1.w, 0.2);

  // Equal captures -> tie
  const adv2 = calculateDameAdvantage(2, 2);
  assert.equal(adv2.leader, null);
  assert.equal(adv2.w, 0);

  // Decisive win guarantees w = 1.0
  const win = calculateDameAdvantage(10, 4, true, false);
  assert.equal(win.leader, 'A');
  assert.equal(win.w, 1.0);
});

test('Igisoro Advantage: seed fraction formula w = |2p - 1|', () => {
  // A has 48 seeds, B has 16 seeds out of 64 -> p = 0.75 -> w = |1.5 - 1| = 0.5
  const adv = calculateIgisoroAdvantage(48, 16);
  assert.equal(adv.leader, 'A');
  assert.equal(adv.w, 0.5);

  // Tie: 32 vs 32 -> w = 0
  const tie = calculateIgisoroAdvantage(32, 32);
  assert.equal(tie.leader, null);
  assert.equal(tie.w, 0);
});

test('Biyari Advantage: ball progress and 8-ball victory', () => {
  const adv = calculateBiyariAdvantage(4, 2);
  assert.equal(adv.leader, 'A');
  assert.ok(adv.w > 0);

  const win = calculateBiyariAdvantage(7, 3, false, true);
  assert.equal(win.leader, 'B');
  assert.equal(win.w, 1.0);
});
