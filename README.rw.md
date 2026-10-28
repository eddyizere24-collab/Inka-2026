# INKA
### Imikino gakondo y'ubuhanga

> **“Kina. Ruhura ubwenge. Rwanira ku buhanga. Menyana n’abandi.”**

**INKA** ni verisiyo y'igerageza y'urubuga rw'imikino y'ubuhanga ishingiye ku muco nyarwanda, ubucuti, imikino isaba gutekereza no kubahana.

**Indimi:** [Kinyarwanda](README.rw.md) · [English](README.md) · [Français](README.fr.md)

---

## 1. Intego n'indangagaciro za INKA

- **Imikino y'ubuntu:** nta gutega amafaranga, nta migabane y'inka cyangwa indi mitungo, nta koherezanya amafaranga, kandi nta buryo bwo kubikuza amafaranga burimo.
- **Ubuhanga n'ubunyangamugayo:** amanota agaragaza uko umukinnyi yitwaye mu mukino n'uburyo yitwara neza; si amafaranga kandi ntashobora guhindurwa amafaranga.
- **Imikino itatu:** Dame, Igisoro na Biyari.
- **Indimi eshatu:** Kinyarwanda (`rw`), Icyongereza (`en`) n'Igifaransa (`fr`). Ubutumwa, ibisobanuro, amazina y'ibikorwa n'ibikoresho bifasha abantu bafite ubumuga bwo kureba cyangwa gukoresha imbeba bishyigikira guhindura ururimi.
- **Icyitonderwa ku rwego rw'umushinga:** iyi ni verisiyo y'igerageza ikorera ku ruhande rw'imbere rwa porogaramu. Ifite amakuru y'icyitegererezo n'imikorere yigana uwo mukinnyi bahanganye. Nta buryo bwuzuye bwo kwemeza konti, ububiko bw'amakuru bwa seriveri, guhuza abakinnyi nyabo cyangwa gukinira hamwe ako kanya burimo.
- **Abakinnyi b'icyitegererezo:** amazina, amanota n'amakuru y'abakinnyi agaragara mu cyitegererezo ntabwo ari konti zemejwe z'abantu nyabo.

## 2. Imikino

### Dame
- Ikibaho cya kare 8 × 8 n'ibice 10 kuri buri mukinnyi.
- Gufata ibice by'umukeba bituma amanota y'ubuhanga ahinduka.
- Umukino urangira iyo habaye intsinzi yemewe cyangwa umukinnyi ahisemo kuwusoza.

### Igisoro
- Ikibaho gifite imirongo 4 n'imyobo 8 kuri buri murongo: imyobo 32 yose.
- Icyitegererezo gitangirana n'imbuto 64.
- Umukinnyi anyanyagiza imbuto akurikije inzira y'umukino, kandi imikorere yo gufata imbuto igaragazwa mu buryo bw'icyitegererezo.

### Biyari (Eight-ball)
- Imbonerahamwe ya biliyari igaragarizwa kuri canvas, ifite kugongana kw'imipira, kugaruka ku nkuta n'imifuka 6.
- Umukino usanzwe ukoresha imipira 15 yo gukina: imipira 7 yuzuye, imipira 7 ifite imirongo n'umupira wa 8.
- Umukinnyi agomba kubanza gushyira mu mufuka imipira 7 yo mu itsinda rye mbere yo gutsinda ashyize mu mufuka umupira wa 8.
- Umukeba w'icyitegererezo akina akoresheje uburyo bworoshye bwigana umukino; uburyo bwa **Pass and Play** butuma abantu babiri basimburana kuri telefoni cyangwa mudasobwa imwe.
- Iyi ni simulation yo kwerekana imikorere; igomba kugeragezwa no kunozwa mbere yo kwitwa umukino wuzuye uhuye n'amategeko yose ya biliyari.

## 3. Ibyo verisiyo y'igerageza irimo

- `src/components/brand/InkaLogo.tsx` — ikirango cya INKA gishushanyije muri SVG.
- `src/components/games/` — imikino ya Dame, Igisoro na Biyari hamwe n'ibikoresho byo kwerekana amanota.
- `src/components/views/` — urutonde rw'imikino, abakinnyi b'icyitegererezo, gahunda, amategeko, ibigwi n'ahantu ho kurebera.
- `src/context/PlatformContext.tsx` — uko verisiyo y'igerageza ibika uko umukino uhagaze, amakuru y'icyitegererezo n'ururimi rwatoranyijwe.
- `src/utils/i18n.ts` — ububiko bw'ubuhinduzi bw'indimi eshatu.
- `src/utils/i18n.test.ts` — ibizamini bigenzura ko indimi zose zifite imfunguzo zimwe, ko nta butumwa busigaye ari ubusa, kandi ko ibimenyetso bisimbuzwa mu butumwa bihuye.
- `src/utils/matchScoring.ts` — ibarura ry'ubuhanga n'amanota y'imyitwarire myiza.
- `.github/workflows/verify-inka.yml` — igenzura ryikoresha rigerageza TypeScript, ibizamini n'ubwubatsi bwa porogaramu.

## 4. Gukoresha porogaramu kuri mudasobwa yawe

Banza ushyire Node.js na npm, hanyuma ukore ibi muri terminal uri mu bubiko bw'umushinga:

```bash
npm install
npm run dev
```

Porogaramu yo kugerageza iba kuri `http://localhost:3000`.

### Ibizamini n'igenzura

```bash
npm run lint
npm test
npm run build
```

- `npm run lint` igenzura ubwoko bw'amakuru muri TypeScript.
- `npm test` ikoresha ibizamini by'ibarura ry'ubuhanga n'ubuhinduzi.
- `npm run build` yubaka verisiyo yo kwerekana cyangwa gusohora.

## 5. Icyitonderwa mbere yo kuyishyira mu bikorwa nyayo

**INKA ntiraba urubuga rwuzuye rwo gukiniraho n'abantu nyabo kuri interineti.** Mbere yo kuyifungurira abantu benshi, hakenewe ububiko bw'amakuru burambye, konti zifite umutekano, uburyo bwo guhuza abakinnyi nyabo, guhuza imigendekere y'umukino hagati y'abakinnyi, kugenzura ibikorwa kuri seriveri, kurinda amakuru bwite, kugerageza imikino n'igenzura ry'umutekano. Gushyira ku murongo wa internet porogaramu yo ku ruhande rw'imbere yonyine ntibihita bitanga ibyo bikorwa.
