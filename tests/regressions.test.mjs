import test from 'node:test';
import assert from 'node:assert/strict';
import { navItems } from '../lib/navigation.ts';
import { createToken, verifyToken } from '../lib/admin/session-token.ts';
import { offerStatus, currentOfferId, todayInSosua, parseOfferInput } from '../lib/offers.ts';

const labels = { services: 'Services', prices: 'Prices', offers: 'Offers', results: 'Results', about: 'About', contact: 'Contact' };
for (const hasPromo of [false, true]) for (const hasResults of [false, true]) {
  test(`navigation reflects offers=${hasPromo}, results=${hasResults}`, () => {
    const links = navItems(labels, { hasPromo, hasResults }).map(item => item.href);
    assert.equal(links.includes('#ofertas'), hasPromo);
    assert.equal(links.includes('#resultados'), hasResults);
    assert.ok(links.includes('#contacto'));
    // Prices has its own anchor, and the menu follows the page order.
    assert.deepEqual(links.slice(0, 2), ['#tratamientos', '#precios']);
  });
}

test('signed tokens reject tampering, wrong purpose, expiry, and a different admin', () => {
  const original = { secret: process.env.ADMIN_SESSION_SECRET, email: process.env.ADMIN_EMAIL };
  process.env.ADMIN_SESSION_SECRET = 'test-only-secret-'.repeat(4);
  process.env.ADMIN_EMAIL = 'owner@example.test';
  try {
    const claim = { email: process.env.ADMIN_EMAIL, stamp: 'password-version-1' };
    const token = createToken('session', claim, 60);
    assert.deepEqual(verifyToken('session', token), claim);
    assert.equal(verifyToken('setup', token), null);
    assert.equal(verifyToken('session', `x${token}`), null);
    assert.equal(verifyToken('session', createToken('session', claim, -1)), null);
    process.env.ADMIN_EMAIL = 'someone-else@example.test';
    assert.equal(verifyToken('session', token), null);
  } finally {
    for (const [key, value] of [['ADMIN_SESSION_SECRET', original.secret], ['ADMIN_EMAIL', original.email]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('offer dates include the whole last day in the salon timezone', () => {
  const offer = { active: true, startsOn: '2026-10-21', endsOn: '2026-10-22' };
  assert.equal(todayInSosua(new Date('2026-10-23T03:59:59Z')), '2026-10-22');
  assert.equal(offerStatus(offer, '2026-10-22'), 'live');
  assert.equal(offerStatus(offer, '2026-10-23'), 'ended');
  assert.equal(offerStatus(offer, '2026-10-20'), 'scheduled');
  assert.equal(offerStatus({ ...offer, active: false }, '2026-10-22'), 'off');
});

test('current offer prefers the latest start and ignores hidden offers', () => {
  const offers = [
    { id: 'undated', active: true, startsOn: null, endsOn: null, createdAt: '2026-10-22' },
    { id: 'dated', active: true, startsOn: '2026-10-21', endsOn: null, createdAt: '2026-10-20' },
    { id: 'hidden', active: false, startsOn: '2026-10-22', endsOn: null, createdAt: '2026-10-22' },
  ];
  assert.equal(currentOfferId(offers, '2026-10-22'), 'dated');
});

test('offer validation rejects invalid calendar days, reversed dates, and unknown services', () => {
  const text = { es: 'Oferta' };
  const base = { label: text, heading: text, badge: text, title: text, body: text };
  assert.equal(parseOfferInput(base, []).ok, true);
  for (const extra of [
    { startsOn: '2026-02-30' },
    { startsOn: '2026-10-23', endsOn: '2026-10-22' },
    { rewardService: 'unknown' },
    { valueDOP: -1 },
  ]) assert.equal(parseOfferInput({ ...base, ...extra }, []).ok, false);
});
