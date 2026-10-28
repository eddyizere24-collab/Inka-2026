import test from 'node:test';
import assert from 'node:assert/strict';
import { translations, validateTranslations } from './i18n.ts';

test('i18n Validation: All translation keys are 100% complete across RW, EN, and FR', () => {
  const result = validateTranslations();

  assert.equal(
    result.missingInRw.length,
    0,
    `Missing keys in Kinyarwanda: ${result.missingInRw.join(', ')}`
  );
  assert.equal(
    result.missingInFr.length,
    0,
    `Missing keys in French: ${result.missingInFr.join(', ')}`
  );
  assert.equal(
    result.emptyValues.length,
    0,
    `Empty translation values detected: ${result.emptyValues.join(', ')}`
  );
  assert.equal(result.isValid, true);
});

test('i18n Validation: Brand name is consistently INKA across all languages', () => {
  assert.equal(translations.rw.brandName, 'INKA');
  assert.equal(translations.en.brandName, 'INKA');
  assert.equal(translations.fr.brandName, 'INKA');
});

test('i18n Validation: Zero wagering terms present in brand notice', () => {
  assert.ok(translations.rw.zeroWageringNotice.length > 10);
  assert.ok(translations.en.zeroWageringNotice.length > 10);
  assert.ok(translations.fr.zeroWageringNotice.length > 10);
});

test('i18n Validation: All three dictionaries have exactly the same keys', () => {
  const englishKeys = Object.keys(translations.en).sort();
  assert.deepEqual(Object.keys(translations.rw).sort(), englishKeys);
  assert.deepEqual(Object.keys(translations.fr).sort(), englishKeys);
});

test('i18n Validation: Dynamic message templates preserve matching placeholders', () => {
  const templateKeys = [
    'incomingChallengeMessage',
    'challengeSentNotice',
    'scheduledMatchConfirmation',
    'currentTurnWithLabel',
    'dameVictoryReason',
    'igisoroVictoryReason',
    'igisoroNoMovesVictoryReason',
    'igisoroCaptureMessage',
    'playerConcededReason',
    'biyariEightBallVictoryReason',
    'squareAccessibleLabel',
    'pitAccessibleLabel',
  ] as const;

  const placeholders = (value: string) =>
    (value.match(/\\{[^}]+\\}/g) ?? []).sort();

  for (const key of templateKeys) {
    assert.deepEqual(
      placeholders(translations.rw[key]),
      placeholders(translations.en[key]),
      `Placeholder mismatch between Kinyarwanda and English for ${key}`
    );
    assert.deepEqual(
      placeholders(translations.fr[key]),
      placeholders(translations.en[key]),
      `Placeholder mismatch between French and English for ${key}`
    );
  }
});

test('i18n Validation: Document metadata is present in all languages', () => {
  for (const language of ['rw', 'en', 'fr'] as const) {
    assert.ok(translations[language].documentTitle.trim().length > 0);
    assert.ok(translations[language].metaDescription.trim().length > 0);
  }
});
