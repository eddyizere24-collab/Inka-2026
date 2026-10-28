/**
 * INKA Multilingual Localization Engine
 * Complete, independent localization for Kinyarwanda, English, and French.
 * No wagering or financial terms; focused on skill, honor, friendship, and community.
 */

export type Language = 'rw' | 'en' | 'fr';

export interface TranslationSchema {
  // Brand & Identity
  brandName: string;
  tagline: string;
  subTagline: string;
  culturalNotice: string;
  zeroWageringNotice: string;

  // Navigation Links
  navPlayNow: string;
  navSpectate: string;
  navSchedule: string;
  navHonors: string;
  navRules: string;
  navCommunity: string;

  // Games
  gamesTitle: string;
  gamesSubtitle: string;
  dameTitle: string;
  dameSubtitle: string;
  dameDesc: string;
  dameRulesShort: string;
  igisoroTitle: string;
  igisoroSubtitle: string;
  igisoroDesc: string;
  igisoroRulesShort: string;
  biyariTitle: string;
  biyariSubtitle: string;
  biyariDesc: string;
  biyariRulesShort: string;

  // Actions & Buttons
  playGame: string;
  challengePlayer: string;
  arrangeMatch: string;
  backToLobby: string;
  accept: string;
  decline: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  close: string;
  send: string;
  passAndPlay: string;
  rematch: string;
  pause: string;
  resume: string;
  offerDraw: string;
  resign: string;
  concludeMatch: string;
  concludeConfirm: string;
  strikeCueBall: string;
  rackBalls: string;

  // Game HUD & Advantage Status
  moveTimer: string;
  turnYourTurn: string;
  turnOpponentTurn: string;
  advantageGauge: string;
  tiedScore: string;
  advantageA: string;
  advantageB: string;
  capturedPieces: string;
  seedsControlled: string;
  ballsPotted: string;
  spectatorsWatching: string;
  spectatorNotice: string;

  // Challenge & Incoming Request Dialog
  incomingChallengeTitle: string;
  incomingChallengeSubtitle: string;
  selectGameToPlay: string;
  selectTimeControl: string;
  timeCasual: string;
  time30s: string;
  time60s: string;
  friendlyMessageLabel: string;
  friendlyMessagePlaceholder: string;
  sendChallenge: string;
  challengeSentSuccess: string;
  simulateIncomingCall: string;

  // Spectator Arena
  arenaTitle: string;
  arenaSubtitle: string;
  noWageringBadge: string;
  liveMatchesCount: string;
  spectatorChatTitle: string;
  chatAntiCoachingNotice: string;
  chatInputPlaceholder: string;
  admireSkillPrompt: string;
  challengeSpectatedPlayer: string;

  // Scheduling & Availability
  schedulingTitle: string;
  schedulingSubtitle: string;
  publishYourHours: string;
  publishHoursDesc: string;
  yourTimeWindowLabel: string;
  yourTimeWindowPlaceholder: string;
  preferredGameLabel: string;
  callAlertNotice: string;
  saveAvailability: string;
  availabilitySavedNotice: string;
  activePlayersList: string;

  // Honor & Achievements (formerly Wallet/Staking)
  honorsTitle: string;
  honorsSubtitle: string;
  honorPointsLabel: string;
  sportsmanshipRating: string;
  matchesPlayed: string;
  matchesWon: string;
  winRate: string;
  achievementsTitle: string;
  badgeMasterSower: string;
  badgeMasterSowerDesc: string;
  badgeDameStrategist: string;
  badgeDameStrategistDesc: string;
  badgeCleanCue: string;
  badgeCleanCueDesc: string;
  badgeFriendlyRival: string;
  badgeFriendlyRivalDesc: string;
  matchHistoryTitle: string;
  fairPlayPledge: string;

  // Profiles & Community
  communityTitle: string;
  communitySubtitle: string;
  yourProfile: string;
  editBio: string;
  bioUpdatedNotice: string;
  activePlayers: string;
  statusAvailable: string;
  statusInGame: string;
  statusOffline: string;

  // Rules & Philosophy
  philosophyTitle: string;
  philosophySubtitle: string;
  rule1Title: string;
  rule1Desc: string;
  rule2Title: string;
  rule2Desc: string;
  rule3Title: string;
  rule3Desc: string;
  rule4Title: string;
  rule4Desc: string;
  rule5Title: string;
  rule5Desc: string;
  rule6Title: string;
  rule6Desc: string;

  muteSound: string;
  unmuteSound: string;
  editionLabel: string;
  humanVsHuman: string;
  skillAdvantage: string;
  zeroWageringFooter: string;
  levelLabel: string;
  badgeFairPlayGuardian: string;
  badgeFairPlayGuardianDesc: string;
  netCaptureDifference: string;
  skillAdvantageLabel: string;
  leaderLabel: string;
  seedRatioLabel: string;
  formulaLabel: string;
  playerASeedsLabel: string;
  playerBHoldsLabel: string;
  playerASolidsPottedLabel: string;
  playerBStripesPottedLabel: string;
  endgameStageLabel: string;
  targetGroupPotting: string;
  playerAOnEightBall: string;
  playerBOnEightBall: string;
  piecesUnit: string;
  levelStanding: string;
  dameBoardLabel: string;
  aimShotInstruction: string;
  cuePowerLabel: string;
  ballsRollingLabel: string;
  biyariScoringHelp: string;
  matchConcluded: string;
  honorPointsAwarded: string;
  passAndPlayLabel: string;
  gameDetailPhysics: string;
  communityMatchmakingDesc: string;
  noMatchesCompletedLabel: string;
  matchOutcomeWin: string;
  matchOutcomeLoss: string;
  matchOutcomeDraw: string;
  scheduledMatchConfirmation: string;
  testRingLabel: string;
  versusLabel: string;
  northTerritory: string;
  southTerritory: string;
  seedsCountLabel: string;
  pitAccessibleLabel: string;
  profileDirectoryDesc: string;
  profileUpdatedLabel: string;
  versusHistoryLabel: string;

  timeNoLimit: string;
  timeOfficial30s: string;
  timeRelaxed60s: string;
  friendlyMatchConclusion: string;
  mutualDrawAgreed: string;
  watchLiveMatchesDescription: string;
  moveNumberLabel: string;
  currentTurnWithLabel: string;
  dameVictoryReason: string;
  igisoroVictoryReason: string;
  igisoroNoMovesVictoryReason: string;
  igisoroSelectPitInstruction: string;
  igisoroInvalidPitInstruction: string;
  igisoroCaptureMessage: string;
  playerConcededReason: string;
  biyariEightBallVictoryReason: string;
  squareAccessibleLabel: string;
  pieceLabel: string;
  incomingChallengeMessage: string;
  defaultFriendlyMessage: string;
  challengeSentNotice: string;
  documentTitle: string;
  metaDescription: string;
  playerLabel: string;
  normalizedAdvantageLabel: string;
  playerACapturesLabel: string;
  playerBCapturesLabel: string;
  opponentCalculatingMove: string;
  freeSkillCompetitionNotice: string;
  matchFinishedHonorMessage: string;
  youLabel: string;
  saveBioLabel: string;
  specializesInLabel: string;
  winsLabel: string;
  gameStreamInProgress: string;
  turnLabel: string;

  // Convenience Aliases for Clean UI Integration
  nav_play: string;
  nav_spectator: string;
  nav_schedule: string;
  nav_honors: string;
  nav_rules: string;
  nav_community: string;
  hero_desc: string;
  the_three_games: string;
  game_dame: string;
  game_igisoro: string;
  game_biyari: string;
  dame_rule: string;
  igisoro_rule: string;
  biyari_rule: string;
  dame_captures: string;
  seeds_count: string;
  biyari_potted: string;
  play_dame: string;
  play_igisoro: string;
  play_biyari: string;
  live_opponents: string;
  status_available: string;
  challenge: string;
  challenge_player: string;
  select_game: string;
  time_control: string;
  time_casual: string;
  time_30s: string;
  time_60s: string;
  fair_play: string;
  zero_wagering_rule: string;
  sportsmanship_awarded: string;
  send_challenge: string;
  incoming_call: string;
  honor_rating: string;
  match_history: string;
  rules_title: string;
  rules_desc: string;
  schedule_time: string;
  live_arena: string;
  spectator_comments_hidden: string;
  stop_game: string;
  inka_philosophy: string;
  continue_playing: string;
  confirm_stop: string;
  draw: string;
  lead_advantage: string;
  equal_standing: string;
  score_advantage: string;
  spectators_watching: string;
  live_spectators: string;
}

export const translations: Record<Language, TranslationSchema> = {
  rw: {
    // Brand & Identity
    brandName: 'INKA',
    tagline: 'Kina. Ruhura ubwenge. Rwanira ku buhanga. Menyana n’abandi.',
    subTagline: 'Urubuga rw’u Rwanda rw’imikino gakondo n’ubuhanga: Igisoro, Dame, na Biyari.',
    culturalNotice: 'Inka yacu ni ikimenyetso cy’ubucuti, ubumwe n’ubwubahane hagati y’abakinnyi.',
    zeroWageringNotice: 'Umukino w’ubuhanga n’ubucuti gusa. Nta masezerano y’amafaranga cyangwa gutega bibaho.',

    // Navigation Links
    navPlayNow: 'Kina Ubu',
    navSpectate: 'Reba Imikino',
    navSchedule: 'Gahunda',
    navHonors: 'Ibigwi n’Amanota',
    navRules: 'Amategeko',
    navCommunity: 'Abakinnyi',

    // Games
    gamesTitle: 'Imikino Itatu y’Ubuhanga',
    gamesSubtitle: 'Hitamo umukino ushaka gukinana na bagenzi bawe mu mudendezo n’ubucuti.',
    dameTitle: 'Dame (Checkers)',
    dameSubtitle: 'Urugero rw’ibice 10 kuri buri mukinnyi',
    dameDesc: 'Umukino w’ubwenge n’amayeri yo gusimbuka no kurya ibice by’umukeba. Buri ruhande rutangirana ibice 10 ku kibaho cya 8×8 (ibice 20 byose hamwe).',
    dameRulesShort: 'Ibice 10 · Amayeri yo kurya · Kuba Umwamikazi',
    igisoroTitle: 'Igisoro (Mancala)',
    igisoroSubtitle: 'Umukino gakondo w’imyobo 32 n’isoro 64',
    igisoroDesc: 'Umukino w’amateka n’umuco nyarwanda. Ugizwe n’imyobo 32 n’isoro 64. Biba byiza iyo ugenzura umurongo w’imbere n’uw’inyuma ugamije kurya isoro z’umukeba.',
    igisoroRulesShort: 'Imyobo 32 · Isoro 64 · Kurya mu myobo y’imbere n’inyuma',
    biyariTitle: 'Biyari (Eight-Ball Pool)',
    biyariSubtitle: 'Urukino rwa biliyari rw’imipira 8',
    biyariDesc: 'Umukino wo gupima uburebure, imbaraga n’icyerekezo cy’inkoni kugira ngo winjize imipira mu myobo ukurikije amabara.',
    biyariRulesShort: 'Inkoni yo gukina · Gupima ingufu · Kwinjiza umupira wa 8',

    // Actions & Buttons
    playGame: 'Kina Ubu',
    challengePlayer: 'Tanga Ubutumire',
    arrangeMatch: 'Tegura Umukino',
    backToLobby: 'Gusubira ku Rusisiro',
    accept: 'Emeza',
    decline: 'Reka',
    cancel: 'Hagarika',
    confirm: 'Emeza Byose',
    save: 'Bika',
    edit: 'Hindura',
    close: 'Funga',
    send: 'Ohereza',
    passAndPlay: 'Kina na mugenzi wawe kuri uyu munara',
    rematch: 'Ongera Ukine',
    pause: 'Kurangiza by’agateganyo',
    resume: 'Komeza',
    offerDraw: 'Saba Kunganya',
    resign: 'Kureka Umukino',
    concludeMatch: 'Gusoza Umukino',
    concludeConfirm: 'Uremeza gusoza uyu mukino ubu?',
    strikeCueBall: 'Kina Umupira',
    rackBalls: 'Kora Umurundo Mushya',

    // Game HUD & Advantage Status
    moveTimer: 'Igihe cyo Gukina',
    turnYourTurn: 'Ni igihe cyanyu cyo gukina',
    turnOpponentTurn: 'Mugenzi wanyu ari gutekereza',
    advantageGauge: 'Ubuhanga bugezweho',
    tiedScore: 'Banganyije Neza (0 - 0)',
    advantageA: 'Muri imbere mu buhanga',
    advantageB: 'Umukeba ari imbere',
    capturedPieces: 'Ibice Bimaze Kuribwa',
    seedsControlled: 'Isoro zigenzurwa',
    ballsPotted: 'Imipira Yinjijwe',
    spectatorsWatching: 'Abantu bari kureba umukino',
    spectatorNotice: 'Abareba ntibashobora kohereza inama z’amayeri ku bakinnyi mugihe umukino ugikomeza.',

    // Challenge & Incoming Request Dialog
    incomingChallengeTitle: 'Ubutumire Bushya bw’Umukino!',
    incomingChallengeSubtitle: 'Mugenzi wawe yifuza ko mukinana umukino w’ubuhanga n’ubucuti.',
    selectGameToPlay: 'Hitamo Umukino:',
    selectTimeControl: 'Igihe cyo gutekereza kuri buri kintu:',
    timeCasual: 'Umudendezo (Nta gihe)',
    time30s: 'Amasegonda 30 (Byihuse)',
    time60s: 'Amasegonda 60 (Bitonze)',
    friendlyMessageLabel: 'Ubutumwa bw’ubucuti:',
    friendlyMessagePlaceholder: 'Kaza neza! Reka dukine mu mutuzo n’ubwubahane.',
    sendChallenge: 'Ohereza Ubutumire',
    challengeSentSuccess: 'Ubutumire bwohererejwe mugenzi wanyu neza.',
    simulateIncomingCall: 'Gupima Ubutumire nka Terefone',

    // Spectator Arena
    arenaTitle: 'Icyumba cyo Kureba Imikino',
    arenaSubtitle: 'Reba uburyo abahanga b’Abanyarwanda bakina Igisoro, Dame, na Biyari mu buryo butaziguye.',
    noWageringBadge: 'Imikino y’ubuhanga gusa · Nta gutega bibaho',
    liveMatchesCount: 'Imikino iri kubera ubu',
    spectatorChatTitle: 'Ikiganiro cy’Abareba Umukino',
    chatAntiCoachingNotice: 'Abakinnyi babona ubu butumwa nyuma y’uko umukino urangira kugira ngo birinde amayeri ava hanze.',
    chatInputPlaceholder: 'Tanga igitecyerezo ku mukino...',
    admireSkillPrompt: 'Ubonye ubuhanga bw’umukinnyi? Mutumire mukine umukino utaha:',
    challengeSpectatedPlayer: 'Mutumire Gukina',

    // Scheduling & Availability
    schedulingTitle: 'Gahunda n’Igihe cyo Kuboneka',
    schedulingSubtitle: 'Tangaza amasaha uba witeguye gukina kugira ngo bagenzi bawe babashe kugushaka.',
    publishYourHours: 'Tangaza Amasaha Yawe',
    publishHoursDesc: 'Iyo umuntu agutumiye mu masaha watangaje, terefone yawe izagutabaza nko guhamagarwa.',
    yourTimeWindowLabel: 'Amasaha Uboneye:',
    yourTimeWindowPlaceholder: 'Urugero: Buri munsi 18:00 – 21:00 cyangwa Kuwa Gatandatu',
    preferredGameLabel: 'Umukino ukunda muri ayo masaha:',
    callAlertNotice: 'Iyo uhamagariwe umukino, urumva ijwi risa n’iry’ihamagarwa rya terefone.',
    saveAvailability: 'Bika Amasaha',
    availabilitySavedNotice: 'Amasaha yawe yo kuboneka yamaze kubikwa no gutangazwa.',
    activePlayersList: 'Abakinnyi Batanze Amasaha yabo',

    // Honor & Achievements
    honorsTitle: 'Ibigwi, Amanota n’Ubwubahane',
    honorsSubtitle: 'Kina kenshi, uhe agaciro bagenzi bawe, maze uzamure urwego rwawe mu mikino nyarwanda.',
    honorPointsLabel: 'Amanota y’Ubwubahane',
    sportsmanshipRating: 'Urwego rw’Imyitwarire Myiza',
    matchesPlayed: 'Imikino Yakinwe',
    matchesWon: 'Imikino Yatsinzwe',
    winRate: 'Ijanisha ryo Gutsinda',
    achievementsTitle: 'Ibimenyetso by’Ubuhanga (Achievements)',
    badgeMasterSower: 'Intwaza mu Gisoro',
    badgeMasterSowerDesc: 'Gusiba neza no gushishoza mu gukata umurongo w’imbere.',
    badgeDameStrategist: 'Intiti mu Kigoza cya Dame',
    badgeDameStrategistDesc: 'Kuzamuka kugeza ku bamikazi no gufata inguni.',
    badgeCleanCue: 'Umuhanga mu Biyari',
    badgeCleanCueDesc: 'Kwinjiza umupira wa 8 utakoze amakosa.',
    badgeFriendlyRival: 'Inshuti y’Abakinnyi',
    badgeFriendlyRivalDesc: 'Gukina imikino 10 mu mudendezo no kubaha abo mukina.',
    matchHistoryTitle: 'Amateka y’Imikino Yaherutse',
    fairPlayPledge: 'Indangagaciro za INKA: Gukina mu mucyo, kubaha umukeba, no kwiga kuri buri mukino.',

    // Profiles & Community
    communityTitle: 'Umuryango w’Abakinnyi ba INKA',
    communitySubtitle: 'Menyana n’abakunda imikino gakondo mu Rwanda hose.',
    yourProfile: 'Umwirondoro Wawe',
    editBio: 'Kosora Ibisobanuro',
    bioUpdatedNotice: 'Umwirondoro wawe wavuguruwe neza.',
    activePlayers: 'Abakinnyi Bakora',
    statusAvailable: 'Ari Kuboneka',
    statusInGame: 'Ari Gukina',
    statusOffline: 'Ntariho',

    // Rules & Philosophy
    philosophyTitle: 'Indangagaciro n’Amategeko ya INKA',
    philosophySubtitle: 'Uburyo INKA yubatswe kugira ngo iteze imbere umuco nyarwanda n’ubuhanga budashingiye ku mafaranga.',
    rule1Title: '1. Abantu Nyamuntu Gusa (Nta Mashini)',
    rule1Desc: 'Buri mukino uba hagati y’abantu babiri b’abanyamuryango. Nta za bots cyangwa mudasobwa zikina.',
    rule2Title: '2. Ubuhanga Ntabwo ari Amahirwe cyangwa Gutega',
    rule2Desc: 'Igisoro, Dame na Biyari ni imikino y’ubwenge n’imyitozo. Nta gutega amafaranga na gato byemewe kuri INKA.',
    rule3Title: '3. Umudendezo wo Guhagarara',
    rule3Desc: 'Buri mukinnyi ashobora gusaba gusoza umukino igihe abishakiye nta gahato kabayeho.',
    rule4Title: '4. Agaciro k’Ubwubahane',
    rule4Desc: 'Gushyigikirana no kwishimira ubuhanga bw’umukeba bituma umuryango wa INKA urushaho gukomera.',
    rule5Title: '5. Kurinda Abakinnyi Inama zo Hanze',
    rule5Desc: 'Abareba umukino ntibashobora kohereza ubutumwa ku bakinnyi mugihe umukino ukiri kuba, kugira ngo habeho umukino utabogamye.',
    rule6Title: '6. Umuco Nyarwanda no Kwikorera',
    rule6Desc: 'Gusigasira imikino yacu gakondo nka Igisoro no kuyimenyekanisha mu ikoranabuhanga rigezweho.',

    muteSound: "Zimya ijwi",
    unmuteSound: "Fungura ijwi",
    editionLabel: "Inyandiko ya 2026",
    humanVsHuman: "Abakinnyi bakina hagati yabo",
    skillAdvantage: "Inyungu ishingiye ku buhanga",
    zeroWageringFooter: "Nta gutega cyangwa kwimura amafaranga",
    levelLabel: "Urwego",
    badgeFairPlayGuardian: "Murinda Indangagaciro za INKA",
    badgeFairPlayGuardianDesc: "Yagaragaje imyitwarire myiza no kubaha abandi mu mikino.",
    netCaptureDifference: "Itandukaniro ry’ibice byafashwe",
    skillAdvantageLabel: "Inyungu y’ubuhanga",
    leaderLabel: "Ubuyoboye",
    seedRatioLabel: "Ikigereranyo cy’isoro",
    formulaLabel: "Inzira y’imibare",
    playerASeedsLabel: "Isoro z’Umukinnyi A",
    playerBHoldsLabel: "Umukinnyi B afite",
    playerASolidsPottedLabel: "Imipira yuzuye yinjijwe",
    playerBStripesPottedLabel: "Imipira ifite imirongo yinjijwe",
    endgameStageLabel: "Icyiciro cya nyuma",
    targetGroupPotting: "Kwinjiza imipira y’itsinda",
    playerAOnEightBall: "Umukinnyi A agiye gukina umupira wa 8",
    playerBOnEightBall: "Umukinnyi B agiye gukina umupira wa 8",
    piecesUnit: "ibice",
    levelStanding: "Barangana",
    dameBoardLabel: "Ikibaho cya 8×8",
    aimShotInstruction: "Erekera ku meza uhindure imbaraga zo gukubita",
    cuePowerLabel: "Imbaraga z’inkoni",
    ballsRollingLabel: "Imipira iri kugenda…",
    biyariScoringHelp: "Kwinjiza imipira byongera inyungu. Banza winjize imipira yo mu itsinda ryawe, hanyuma winjize umupira wa 8 kugira ngo utsinde.",
    matchConcluded: "Umukino urarangiye",
    honorPointsAwarded: "Amanota y’imyitwarire myiza",
    passAndPlayLabel: "Kina n’undi ukoresheje igikoresho kimwe",
    gameDetailPhysics: "Imbonerahamwe y’imipira ya 2D",
    communityMatchmakingDesc: "Huza umukino n’abakinnyi bo mu muryango wa INKA.",
    noMatchesCompletedLabel: "Nta mukino urarangira. Tumira umukinnyi uboneka kugira ngo utangire kwegeranya amanota y’icyubahiro.",
    matchOutcomeWin: "WATSINZE",
    matchOutcomeLoss: "WATSINZWE",
    matchOutcomeDraw: "ANGANYE",
    scheduledMatchConfirmation: "Umukino na {player} wateguwe: {game} ({time}) mu gihe cya {window}.",
    testRingLabel: "Gerageza ijwi",
    versusLabel: "na",
    northTerritory: "Uruhande rwo mu majyaruguru",
    southTerritory: "Uruhande rwo mu majyepfo",
    seedsCountLabel: "Isoro",
    pitAccessibleLabel: "Umwobo {row}, inkingi {col}, isoro {count}",
    profileDirectoryDesc: "Reba abakinnyi, umenye ubuhanga bakunda, kandi uhitamo uwo mukina mu bwubahane.",
    profileUpdatedLabel: "Umwirondoro wawe wavuguruwe.",
    versusHistoryLabel: "na",

    timeNoLimit: "Nta gihe ntarengwa",
    timeOfficial30s: "Amasegonda 30 kuri buri ntambwe",
    timeRelaxed60s: "Amasegonda 60 kuri buri ntambwe",
    friendlyMatchConclusion: "Umukino urangijwe mu bwubahane",
    mutualDrawAgreed: "Abakinnyi bemeranyije kunganya mu bwubahane",
    watchLiveMatchesDescription: "Reba imikino iri kubera ubu kandi ugire ibiganiro byiza n’abandi bareba.",
    moveNumberLabel: "Intambwe",
    currentTurnWithLabel: "Igihe cyo gukina kiri kuri {player}",
    dameVictoryReason: "{player} yatsinze Dame; ibice 10 by’umukeba byafashwe.",
    igisoroVictoryReason: "{player} yatsinze Igisoro; umukeba nta soro asigaranye.",
    igisoroNoMovesVictoryReason: "{player} nta ntambwe yemewe asigaranye; {winner} aratsinze.",
    igisoroSelectPitInstruction: "Hitamo umwobo uri ku ruhande rwawe urimo isoro nibura ebyiri.",
    igisoroInvalidPitInstruction: "Mu Gisoro, ukina uhereye ku mwobo urimo isoro nibura ebyiri.",
    igisoroCaptureMessage: "{player} yafashe isoro {count} z’umukeba!",
    playerConcededReason: "{player} yemeye guhagarika umukino mu bwubahane.",
    biyariEightBallVictoryReason: "Umukinnyi {player} yinjije umupira wa 8 mu buryo bwemewe aratsinda.",
    squareAccessibleLabel: "Akazu {row}, inkingi {col}, {piece}",
    pieceLabel: "igice",
    incomingChallengeMessage: "Muraho {player}! Reka dukine umukino wa {game} mu bwubahane.",
    defaultFriendlyMessage: "Niteguye gukina umukino w’ubuhanga n’ubucuti!",
    challengeSentNotice: "Ubutumire bwohererejwe {player} ku mukino wa {game} ({time}).",
    documentTitle: "INKA · Imikino y’Ubuhanga",
    metaDescription: "INKA ni urubuga rw’imikino y’ubuhanga: Igisoro, Dame na Biyari. Kina ku buntu, menyana n’abandi kandi ukine mu bwubahane.",
    playerLabel: "Umukinnyi",
    normalizedAdvantageLabel: "Igipimo cy’inyungu y’ubuhanga",
    playerACapturesLabel: "Ibice Umukinnyi A yafashe",
    playerBCapturesLabel: "Ibice Umukinnyi B yafashe",
    opponentCalculatingMove: "Mugenzi arimo gutekereza ku ntambwe…",
    freeSkillCompetitionNotice: "Iri rushanwa rishingiye ku buhanga. Nta gutega cyangwa amafaranga.",
    matchFinishedHonorMessage: "Umukino warangiye mu bwubahane.",
    youLabel: "Wowe",
    saveBioLabel: "Bika umwirondoro",
    specializesInLabel: "Akunda gukina",
    winsLabel: "intsinzi",
    gameStreamInProgress: "Umukino uri kubera ako kanya",
    turnLabel: "Igihe cyo gukina",

    // Convenience Aliases
    nav_play: 'Kina Ubu',
    nav_spectator: 'Reba Imikino',
    nav_schedule: 'Gahunda',
    nav_honors: 'Ibigwi n’Amanota',
    nav_rules: 'Amategeko',
    nav_community: 'Abakinnyi',
    hero_desc: 'Urubuga rw’u Rwanda rw’imikino gakondo n’ubuhanga: Igisoro, Dame, na Biyari.',
    the_three_games: 'Imikino Itatu y’Ubuhanga',
    game_dame: 'Dame (Checkers)',
    game_igisoro: 'Igisoro (Mancala)',
    game_biyari: 'Biyari (Eight-Ball Pool)',
    dame_rule: 'Ibice 10 kuri buri mukinnyi ku kibaho cya 8×8',
    igisoro_rule: 'Imyobo 32 n’isoro 64 gakondo',
    biyari_rule: 'Urukino rwa biliyari rw’imipira 8 kuri sima',
    dame_captures: 'Ibice byariwe',
    seeds_count: 'Isoro zigenzurwa',
    biyari_potted: 'Imipira yinjijwe',
    play_dame: 'Kina Dame',
    play_igisoro: 'Kina Igisoro',
    play_biyari: 'Kina Biyari',
    live_opponents: 'Abakinnyi bari ku rubuga ubu',
    status_available: 'Bari kwitegura gukina',
    challenge: 'Tanga Ubutumire',
    challenge_player: 'Tanga Ubutumire',
    select_game: 'Hitamo Umukino',
    time_control: 'Igihe cya Buri Move',
    time_casual: 'Muduherereje (Nta gihe)',
    time_30s: 'Amasegonda 30 (Blitz)',
    time_60s: 'Amasegonda 60 (Standard)',
    fair_play: 'Ubwitonzi n’Ubupfura',
    zero_wagering_rule: 'Nta masezerano y’amafaranga cyangwa gutega bibaho.',
    sportsmanship_awarded: 'Amanota y’ubupfura ahabwa abakinnyi bose.',
    send_challenge: 'Ohereza Ubutumire',
    incoming_call: 'Ubutumire bushya bwinjira',
    honor_rating: 'Amanota y’Ibigwi',
    match_history: 'Amateka y’Imikino',
    rules_title: 'Amahame n’Ubuhanga bwa INKA',
    rules_desc: 'Amategeko arambuye y’imikino n’agaciro k’ubupfura n’umuco nyarwanda.',
    schedule_time: 'Gahunda y’Imikino n’Ubwitabire',
    live_arena: 'Reba Imikino iri kuba ubu',
    spectator_comments_hidden: 'Ibitekerezo by’abareba bihishwa abakinnyi kugeza umukino urangiye.',
    stop_game: 'Soza Umukino mu Bupfura',
    inka_philosophy: 'Ku rubuga rwa INKA, gusoza umukino bikorwa mu bwubahane.',
    continue_playing: 'Komeza Umukino',
    confirm_stop: 'Emeza Gusoza',
    draw: 'Kunganya',
    lead_advantage: 'ari hejuru ku kigero cya',
    equal_standing: 'Munganya amanota',
    score_advantage: 'Ikigero cy’Ubuhanga',
    spectators_watching: 'abantu bari kureba ubu',
    live_spectators: 'Abareba Umukino',
  },

  en: {
    // Brand & Identity
    brandName: 'INKA',
    tagline: 'Play. Relax the mind. Compete with skill. Meet people.',
    subTagline: 'Rwanda’s authentic skill-games community for Igisoro, Dame, and Biyari.',
    culturalNotice: 'Inka represents friendship, shared prosperity, and mutual respect among players.',
    zeroWageringNotice: 'Pure skill and community play. No wagering, betting, or real-money stakes.',

    // Navigation Links
    navPlayNow: 'Play Now',
    navSpectate: 'Live Arena',
    navSchedule: 'Schedule',
    navHonors: 'Honors & Trophies',
    navRules: 'Rules & Spirit',
    navCommunity: 'Community',

    // Games
    gamesTitle: 'The Three Skill Games',
    gamesSubtitle: 'Select a game to challenge friends or match with skilled players across Rwanda.',
    dameTitle: 'Dame (Checkers)',
    dameSubtitle: '10 pieces per side draughts',
    dameDesc: 'Tactical diagonal draughts game. Each player starts with 10 pieces on an 8×8 board (20 pieces total). Crown kings and capture opponent pieces through skillful positioning.',
    dameRulesShort: '10 Pieces · Multi-Jump Captures · King Promotions',
    igisoroTitle: 'Igisoro (Mancala)',
    igisoroSubtitle: 'Traditional 32-pit board with 64 inka seeds',
    igisoroDesc: 'The revered traditional Rwandan mancala game. Features 4 rows of 8 pits and 64 seeds. Sow seeds counter-clockwise and sweep both front and back pits of your opponent.',
    igisoroRulesShort: '32 Pits · 64 Seeds · Front & Back Row Sweeps',
    biyariTitle: 'Biyari (Eight-Ball Pool)',
    biyariSubtitle: 'Classic eight-ball billiards contest',
    biyariDesc: 'Precision top-down billiards. Measure cue angles and stroke power on the green felt to sink target balls and finish cleanly with the 8-ball.',
    biyariRulesShort: 'Cue Stick Aim · Power Stroke · Clean 8-Ball Pocket',

    // Actions & Buttons
    playGame: 'Play Game',
    challengePlayer: 'Invite to Play',
    arrangeMatch: 'Schedule Match',
    backToLobby: 'Back to Lobby',
    accept: 'Accept',
    decline: 'Decline',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    close: 'Close',
    send: 'Send',
    passAndPlay: 'Pass & Play on this device',
    rematch: 'Rematch',
    pause: 'Pause Match',
    resume: 'Resume',
    offerDraw: 'Offer Draw',
    resign: 'Resign Match',
    concludeMatch: 'Conclude Match',
    concludeConfirm: 'Are you sure you want to conclude this match now?',
    strikeCueBall: 'Strike Ball',
    rackBalls: 'Rack New Balls',

    // Game HUD & Advantage Status
    moveTimer: 'Move Timer',
    turnYourTurn: 'Your turn to play',
    turnOpponentTurn: 'Opponent is thinking',
    advantageGauge: 'Skill Advantage',
    tiedScore: 'Even Position (0 - 0)',
    advantageA: 'You are leading',
    advantageB: 'Opponent is leading',
    capturedPieces: 'Pieces Captured',
    seedsControlled: 'Seeds Controlled',
    ballsPotted: 'Balls Potted',
    spectatorsWatching: 'Spectators watching live',
    spectatorNotice: 'Spectator comments are isolated from active players to ensure zero outside coaching.',

    // Challenge & Incoming Request Dialog
    incomingChallengeTitle: 'Incoming Match Challenge!',
    incomingChallengeSubtitle: 'A fellow player has invited you to a game of skill and camaraderie.',
    selectGameToPlay: 'Select Game:',
    selectTimeControl: 'Move Time Limit:',
    timeCasual: 'Casual (No timer)',
    time30s: '30 Seconds (Fast pace)',
    time60s: '60 Seconds (Relaxed pace)',
    friendlyMessageLabel: 'Friendly Greeting:',
    friendlyMessagePlaceholder: 'Welcome! Let’s have an honorable and fun game.',
    sendChallenge: 'Send Challenge',
    challengeSentSuccess: 'Challenge sent successfully to your opponent.',
    simulateIncomingCall: 'Simulate Incoming Call Alert',

    // Spectator Arena
    arenaTitle: 'Live Spectator Arena',
    arenaSubtitle: 'Watch skilled Rwandan players compete in real time across Dame, Igisoro, and Biyari.',
    noWageringBadge: '100% Free Skill Play · Zero Betting',
    liveMatchesCount: 'Active matches right now',
    spectatorChatTitle: 'Spectator Community Discussion',
    chatAntiCoachingNotice: 'Players can only view spectator comments after the match concludes to prevent live tactical coaching.',
    chatInputPlaceholder: 'Comment on tactics or great moves...',
    admireSkillPrompt: 'Admire a player’s strategy? Invite them for the next match:',
    challengeSpectatedPlayer: 'Challenge Player',

    // Scheduling & Availability
    schedulingTitle: 'Availability & Scheduling',
    schedulingSubtitle: 'Publish your available playing windows so friends and community members can arrange games.',
    publishYourHours: 'Publish Your Playing Hours',
    publishHoursDesc: 'When someone invites you during your active window, your device rings like an incoming call.',
    yourTimeWindowLabel: 'Your Time Window:',
    yourTimeWindowPlaceholder: 'e.g. Daily 6:00 PM – 9:00 PM or Saturday Afternoons',
    preferredGameLabel: 'Preferred game for this window:',
    callAlertNotice: 'Challenges trigger an audible telephone ring cadence so you never miss a match.',
    saveAvailability: 'Publish Availability',
    availabilitySavedNotice: 'Your playing hours have been published to the community.',
    activePlayersList: 'Community Playing Windows',

    // Honor & Achievements
    honorsTitle: 'Player Honors & Achievements',
    honorsSubtitle: 'Earn sportsmanship honors, elevate your mastery rank, and celebrate cultural skill.',
    honorPointsLabel: 'Honor Points',
    sportsmanshipRating: 'Fair Play Rating',
    matchesPlayed: 'Matches Played',
    matchesWon: 'Matches Won',
    winRate: 'Win Rate',
    achievementsTitle: 'Skill Badges & Achievements',
    badgeMasterSower: 'Master Sower',
    badgeMasterSowerDesc: 'Execute a double-row capture sweep in Igisoro.',
    badgeDameStrategist: 'Dame Strategist',
    badgeDameStrategistDesc: 'Promote two kings and secure diagonal dominance.',
    badgeCleanCue: 'Clean Cue Master',
    badgeCleanCueDesc: 'Sink the 8-ball without scratching or committing fouls.',
    badgeFriendlyRival: 'Honorary Companion',
    badgeFriendlyRivalDesc: 'Complete 10 respectful matches with different players.',
    matchHistoryTitle: 'Recent Match History',
    fairPlayPledge: 'The INKA Creed: Play with integrity, respect your opponent, and celebrate Rwandan game craft.',

    // Profiles & Community
    communityTitle: 'INKA Player Community',
    communitySubtitle: 'Connect with fellow enthusiasts of traditional and modern skill games across Rwanda.',
    yourProfile: 'Your Profile',
    editBio: 'Edit Bio',
    bioUpdatedNotice: 'Profile bio updated successfully.',
    activePlayers: 'Active Community Players',
    statusAvailable: 'Available Now',
    statusInGame: 'In a Match',
    statusOffline: 'Offline',

    // Rules & Philosophy
    philosophyTitle: 'The INKA Principles',
    philosophySubtitle: 'Why INKA is designed around cultural heritage, human connection, and pure skill without money.',
    rule1Title: '1. Human-vs-Human Only',
    rule1Desc: 'Every match is played between two real people. Automated bots and computer opponents are never used.',
    rule2Title: '2. Pure Skill, Zero Wagering',
    rule2Desc: 'Igisoro, Dame, and Biyari are contests of mind and skill. Betting and money stakes are strictly excluded.',
    rule3Title: '3. Freedom to Conclude',
    rule3Desc: 'Either player is free to pause or stop a game at any time by mutual respect; nobody is forced to stay.',
    rule4Title: '4. Culture of Honor & Friendship',
    rule4Desc: 'Playing together builds bridges and relaxation. We celebrate sportsmanship and respectful conduct.',
    rule5Title: '5. Anti-Coaching Protection',
    rule5Desc: 'Spectator chat comments are hidden from players during active games to prevent outside tactical interference.',
    rule6Title: '6. Cultural Preservation',
    rule6Desc: 'Honoring Rwanda’s heritage games like Igisoro and bringing them to modern digital craft for future generations.',

    muteSound: "Mute sound",
    unmuteSound: "Unmute sound",
    editionLabel: "2026 edition",
    humanVsHuman: "Human vs. human",
    skillAdvantage: "Skill advantage",
    zeroWageringFooter: "No betting or money transfers",
    levelLabel: "Level",
    badgeFairPlayGuardian: "Guardian of INKA",
    badgeFairPlayGuardianDesc: "Maintained exemplary sportsmanship and respect during games.",
    netCaptureDifference: "Net capture difference",
    skillAdvantageLabel: "Skill advantage",
    leaderLabel: "Leader",
    seedRatioLabel: "Seed ratio",
    formulaLabel: "Formula",
    playerASeedsLabel: "Player A’s seeds",
    playerBHoldsLabel: "Player B holds",
    playerASolidsPottedLabel: "Solid balls potted",
    playerBStripesPottedLabel: "Striped balls potted",
    endgameStageLabel: "Endgame stage",
    targetGroupPotting: "Clearing the target group",
    playerAOnEightBall: "Player A is on the 8-ball",
    playerBOnEightBall: "Player B is on the 8-ball",
    piecesUnit: "pieces",
    levelStanding: "Tied",
    dameBoardLabel: "8×8 board",
    aimShotInstruction: "Aim over the table and adjust shot power",
    cuePowerLabel: "Cue power",
    ballsRollingLabel: "Balls rolling…",
    biyariScoringHelp: "Each potted ball increases the advantage. Clear your group first, then pot the 8-ball to win.",
    matchConcluded: "Match concluded",
    honorPointsAwarded: "Sportsmanship points",
    passAndPlayLabel: "Pass and play · two players on one device",
    gameDetailPhysics: "2D table simulation",
    communityMatchmakingDesc: "Find a match with players from the INKA community.",
    noMatchesCompletedLabel: "No matches completed yet. Challenge an available player to begin earning honor points.",
    matchOutcomeWin: "WIN",
    matchOutcomeLoss: "LOSS",
    matchOutcomeDraw: "DRAW",
    scheduledMatchConfirmation: "Match arranged with {player}: {game} ({time}) during {window}.",
    testRingLabel: "Test ring",
    versusLabel: "vs",
    northTerritory: "North side",
    southTerritory: "South side",
    seedsCountLabel: "Seeds",
    pitAccessibleLabel: "Pit row {row}, column {col}, {count} seeds",
    profileDirectoryDesc: "Browse players, discover their favorite games, and choose a respectful opponent.",
    profileUpdatedLabel: "Your profile has been updated.",
    versusHistoryLabel: "vs",

    timeNoLimit: "No timer limit",
    timeOfficial30s: "Official 30-second move limit",
    timeRelaxed60s: "Relaxed 60-second move limit",
    friendlyMatchConclusion: "Friendly match concluded with mutual respect",
    mutualDrawAgreed: "Players agreed to a respectful draw",
    watchLiveMatchesDescription: "Watch live matches and discuss the games respectfully with other spectators.",
    moveNumberLabel: "Move",
    currentTurnWithLabel: "Current turn: {player}",
    dameVictoryReason: "{player} wins Dame after capturing all 10 opposing pieces.",
    igisoroVictoryReason: "{player} wins Igisoro after clearing the opponent’s seeds.",
    igisoroNoMovesVictoryReason: "{player} has no legal move remaining; {winner} wins.",
    igisoroSelectPitInstruction: "Select a pit on your side containing at least two seeds.",
    igisoroInvalidPitInstruction: "In Igisoro, you can only sow from a pit with at least two seeds.",
    igisoroCaptureMessage: "{player} captured {count} seeds from the opponent!",
    playerConcededReason: "{player} conceded the match respectfully.",
    biyariEightBallVictoryReason: "{player} legally potted the 8-ball and won.",
    squareAccessibleLabel: "Square row {row}, column {col}, {piece}",
    pieceLabel: "piece",
    incomingChallengeMessage: "Hello {player}! Let’s play a friendly game of {game}.",
    defaultFriendlyMessage: "Ready for a respectful, friendly game of skill!",
    challengeSentNotice: "A challenge was sent to {player} for {game} ({time}).",
    documentTitle: "INKA · Skill Games",
    metaDescription: "INKA is a free skill-games platform for Igisoro, Dame, and Biyari. Play, connect with others, and enjoy respectful competition.",
    playerLabel: "Player",
    normalizedAdvantageLabel: "Normalized skill advantage",
    playerACapturesLabel: "Player A captures",
    playerBCapturesLabel: "Player B captures",
    opponentCalculatingMove: "Opponent is thinking…",
    freeSkillCompetitionNotice: "Free skill competition. No betting or financial risk.",
    matchFinishedHonorMessage: "Match finished with mutual respect and sportsmanship.",
    youLabel: "You",
    saveBioLabel: "Save bio",
    specializesInLabel: "Specializes in",
    winsLabel: "wins",
    gameStreamInProgress: "Game stream in progress",
    turnLabel: "Turn",

    // Convenience Aliases
    nav_play: 'Play Now',
    nav_spectator: 'Live Arena',
    nav_schedule: 'Schedule',
    nav_honors: 'Honors & Trophies',
    nav_rules: 'Rules & Spirit',
    nav_community: 'Players',
    hero_desc: 'Rwanda’s authentic skill-games community for Igisoro, Dame, and Biyari.',
    the_three_games: 'The Three Skill Games',
    game_dame: 'Dame (Checkers)',
    game_igisoro: 'Igisoro (Mancala)',
    game_biyari: 'Biyari (Eight-Ball Pool)',
    dame_rule: '10 pieces per side on an 8×8 board',
    igisoro_rule: 'Traditional 32-pit board with 64 seeds',
    biyari_rule: 'Eight-ball pocket billiards on felt canvas',
    dame_captures: 'Captures',
    seeds_count: 'Seeds Controlled',
    biyari_potted: 'Balls Potted',
    play_dame: 'Play Dame',
    play_igisoro: 'Play Igisoro',
    play_biyari: 'Play Biyari',
    live_opponents: 'Live Players Available Now',
    status_available: 'Available to Play',
    challenge: 'Challenge',
    challenge_player: 'Challenge Player',
    select_game: 'Select Game',
    time_control: 'Time Control',
    time_casual: 'Casual (No Timer)',
    time_30s: '30s Blitz',
    time_60s: '60s Standard',
    fair_play: 'Fair Play & Sportsmanship',
    zero_wagering_rule: 'Strictly zero monetary wagering or betting.',
    sportsmanship_awarded: 'Sportsmanship honors are awarded to both players.',
    send_challenge: 'Send Challenge',
    incoming_call: 'Incoming Real-Time Match Invitation',
    honor_rating: 'Honor Rating',
    match_history: 'Match History',
    rules_title: 'Principles & Mathematics of INKA',
    rules_desc: 'Authentic rules, mathematical advantage scoring, and zero-wagering charter.',
    schedule_time: 'Availability & Scheduling',
    live_arena: 'Live Spectator Arena',
    spectator_comments_hidden: 'Spectator comments are hidden from players during live play.',
    stop_game: 'Conclude Match Gracefully',
    inka_philosophy: 'On INKA, games are concluded with dignity and mutual respect.',
    continue_playing: 'Continue Playing',
    confirm_stop: 'Confirm Conclusion',
    draw: 'Propose Draw',
    lead_advantage: 'leads with advantage',
    equal_standing: 'Level Standing',
    score_advantage: 'Skill Advantage',
    spectators_watching: 'spectators watching live',
    live_spectators: 'Live Spectators',
  },

  fr: {
    // Brand & Identity
    brandName: 'INKA',
    tagline: 'Jouez. Détendez l’esprit. Concourrez avec talent. Rencontrez du monde.',
    subTagline: 'La communauté rwandaise de jeux d’adresse traditionnels : Igisoro, Dames, et Billard.',
    culturalNotice: 'Inka incarne l’amitié, la prospérité partagée et le respect mutuel entre joueurs.',
    zeroWageringNotice: 'Jeux d’adresse et de convivialité uniquement. Aucun pari d’argent ni mise financière.',

    // Navigation Links
    navPlayNow: 'Jouer',
    navSpectate: 'Arène en Direct',
    navSchedule: 'Disponibilité',
    navHonors: 'Honneurs & Trophées',
    navRules: 'Règles & Esprit',
    navCommunity: 'Communauté',

    // Games
    gamesTitle: 'Les Trois Jeux d’Adresse',
    gamesSubtitle: 'Choisissez un jeu pour défier vos amis ou rencontrer des joueurs talentueux à travers le Rwanda.',
    dameTitle: 'Dame (Dames)',
    dameSubtitle: '10 pièces par joueur sur damier 8×8',
    dameDesc: 'Jeu tactique de dames diagonales. Chaque joueur débute avec 10 pions sur un damier 8×8 (20 pions au total). Promouvez vos dames et capturez avec précision.',
    dameRulesShort: '10 Pions · Prises Multiples · Promotion en Dame',
    igisoroTitle: 'Igisoro (Mancala)',
    igisoroSubtitle: 'Plateau traditionnel de 32 trous et 64 graines',
    igisoroDesc: 'Le prestigieux jeu traditionnel rwandais à 4 rangées de 8 fosses et 64 graines inka. Semez dans le sens antihoraire et capturez les graines des rangées avant et arrière adverses.',
    igisoroRulesShort: '32 Trous · 64 Graines · Prises Lignes Avant & Arrière',
    biyariTitle: 'Biyari (Billard Américain)',
    biyariSubtitle: 'Classique billard à 8 billes',
    biyariDesc: 'Jeu de précision vue du dessus. Ajustez l’angle de la queue et la puissance d’impact sur le tapis vert pour empocher vos billes et conclure proprement sur la 8.',
    biyariRulesShort: 'Visée de Queue · Jauge de Force · Finition Bille 8',

    // Actions & Buttons
    playGame: 'Lancer la Partie',
    challengePlayer: 'Défier ce Joueur',
    arrangeMatch: 'Planifier une Partie',
    backToLobby: 'Retour au Salon',
    accept: 'Accepter',
    decline: 'Décliner',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    edit: 'Modifier',
    close: 'Fermer',
    send: 'Envoyer',
    passAndPlay: 'Jouer à deux sur cet écran',
    rematch: 'Revanche',
    pause: 'Mettre en pause',
    resume: 'Reprendre',
    offerDraw: 'Proposer Nulle',
    resign: 'Abandonner',
    concludeMatch: 'Terminer la Partie',
    concludeConfirm: 'Êtes-vous sûr de vouloir terminer cette partie maintenant ?',
    strikeCueBall: 'Frapper la Bille',
    rackBalls: 'Replacer les Billes',

    // Game HUD & Advantage Status
    moveTimer: 'Chronomètre de Coup',
    turnYourTurn: 'À vous de jouer',
    turnOpponentTurn: 'L’adversaire réfléchit',
    advantageGauge: 'Avantage Tactique',
    tiedScore: 'Position Égale (0 - 0)',
    advantageA: 'Vous menez la partie',
    advantageB: 'L’adversaire a l’avantage',
    capturedPieces: 'Pièces Capturées',
    seedsControlled: 'Graines Contrôlées',
    ballsPotted: 'Billes Empôchées',
    spectatorsWatching: 'Spectateurs en direct',
    spectatorNotice: 'Les commentaires des spectateurs sont masqués aux joueurs pour éviter toute interférence extérieure.',

    // Challenge & Incoming Request Dialog
    incomingChallengeTitle: 'Défi de Partie Entrant !',
    incomingChallengeSubtitle: 'Un joueur vous invite pour une partie d’adresse et de convivialité.',
    selectGameToPlay: 'Sélectionnez le Jeu :',
    selectTimeControl: 'Temps par coup :',
    timeCasual: 'Sans chronomètre (Détente)',
    time30s: '30 Secondes (Rythmé)',
    time60s: '60 Secondes (Posé)',
    friendlyMessageLabel: 'Message de courtoisie :',
    friendlyMessagePlaceholder: 'Bienvenue ! Jouons avec talent et esprit sportif.',
    sendChallenge: 'Envoyer le Défi',
    challengeSentSuccess: 'Défi envoyé avec succès à votre adversaire.',
    simulateIncomingCall: 'Tester la Sonnerie d’Appel',

    // Spectator Arena
    arenaTitle: 'Arène des Spectateurs',
    arenaSubtitle: 'Observez en direct les parties des joueurs rwandais sur Dame, Igisoro et Biyari.',
    noWageringBadge: '100% Jeu d’Adresse Gratuit · Zéro Pari',
    liveMatchesCount: 'Parties actives en ce moment',
    spectatorChatTitle: 'Discussion des Spectateurs',
    chatAntiCoachingNotice: 'Les joueurs ne voient cette discussion qu’après la fin du match afin de garantir l’équité sportive.',
    chatInputPlaceholder: 'Commentez les coups et la stratégie...',
    admireSkillPrompt: 'Vous admirez la technique d’un joueur ? Invitez-le pour le prochain match :',
    challengeSpectatedPlayer: 'Défier le Joueur',

    // Scheduling & Availability
    schedulingTitle: 'Disponibilité & Rendez-vous',
    schedulingSubtitle: 'Indiquez vos créneaux de jeu pour que la communauté puisse vous proposer des rencontres.',
    publishYourHours: 'Publier vos Heures de Jeu',
    publishHoursDesc: 'Lorsqu’un joueur vous invite pendant votre créneau, votre appareil sonne comme un appel téléphonique.',
    yourTimeWindowLabel: 'Votre Plage Horaire :',
    yourTimeWindowPlaceholder: 'Ex: Tous les soirs 18h – 21h ou le samedi après-midi',
    preferredGameLabel: 'Jeu préféré sur ce créneau :',
    callAlertNotice: 'Les défis déclenchent une véritable sonnerie pour ne manquer aucune invitation.',
    saveAvailability: 'Publier la Disponibilité',
    availabilitySavedNotice: 'Votre créneau de jeu a été enregistré et publié auprès de la communauté.',
    activePlayersList: 'Créneaux des Membres de la Communauté',

    // Honor & Achievements
    honorsTitle: 'Honneurs & Trophées des Joueurs',
    honorsSubtitle: 'Gagnez des points d’esprit sportif, développez votre maîtrise et honorez le patrimoine rwandais.',
    honorPointsLabel: 'Points d’Honneur',
    sportsmanshipRating: 'Indice d’Esprit Sportif',
    matchesPlayed: 'Parties Jouées',
    matchesWon: 'Parties Gagnées',
    winRate: 'Taux de Victoire',
    achievementsTitle: 'Insignes & Trophées d’Adresse',
    badgeMasterSower: 'Maître Semeur d’Igisoro',
    badgeMasterSowerDesc: 'Réalisez une rafle complète sur les deux rangées adverses.',
    badgeDameStrategist: 'Stratège des Dames',
    badgeDameStrategistDesc: 'Promouvez deux dames et verrouillez la diagonale principale.',
    badgeCleanCue: 'Doigté d’Or au Billard',
    badgeCleanCueDesc: 'Empochez la bille 8 sans aucune faute ni scratch.',
    badgeFriendlyRival: 'Compagnon Honorable',
    badgeFriendlyRivalDesc: 'Terminez 10 parties amicales avec des joueurs différents.',
    matchHistoryTitle: 'Historique Récent des Rencontres',
    fairPlayPledge: 'La Charte INKA : Jouer avec honnêteté, respecter l’adversaire et faire rayonner la culture rwandaise.',

    // Profiles & Community
    communityTitle: 'Communauté des Joueurs INKA',
    communitySubtitle: 'Rencontrez des passionnés de jeux traditionnels et de réflexion à travers tout le pays.',
    yourProfile: 'Votre Profil',
    editBio: 'Modifier la Présentation',
    bioUpdatedNotice: 'Présentation mise à jour avec succès.',
    activePlayers: 'Joueurs Actifs',
    statusAvailable: 'Disponible',
    statusInGame: 'En Partie',
    statusOffline: 'Hors Ligne',

    // Rules & Philosophy
    philosophyTitle: 'Les Principes Fondateurs d’INKA',
    philosophySubtitle: 'Pourquoi INKA est voué au patrimoine, à la convivialité humaine et au talent pur sans argent.',
    rule1Title: '1. Exclusivement entre Humains',
    rule1Desc: 'Chaque rencontre oppose deux personnes réelles. Aucun bot ni adversaire virtuel n’est admis.',
    rule2Title: '2. Talent Pur, Zéro Pari',
    rule2Desc: 'L’Igisoro, les Dames et le Biyari sont des jeux de maîtrise. Tout pari d’argent est strictement exclu.',
    rule3Title: '3. Liberté d’Arrêt Respectueuse',
    rule3Desc: 'Chaque joueur peut interrompre ou clore une partie à tout moment dans le respect mutuel.',
    rule4Title: '4. Culture d’Honneur et d’Amitié',
    rule4Desc: 'Jouer ensemble tisse des liens durables. Nous valorisons la courtoisie et le respect de l’autre.',
    rule5Title: '5. Protection contre l’Assistance Externe',
    rule5Desc: 'Le clavardage des spectateurs est invisible aux joueurs pendant la partie pour éviter tout conseil tactique.',
    rule6Title: '6. Préservation du Patrimoine',
    rule6Desc: 'Honorer les trésors culturels rwandais comme l’Igisoro et les transmettre aux générations futures.',

    muteSound: "Couper le son",
    unmuteSound: "Réactiver le son",
    editionLabel: "Édition 2026",
    humanVsHuman: "Joueur contre joueur",
    skillAdvantage: "Avantage lié à l’adresse",
    zeroWageringFooter: "Aucun pari ni transfert d’argent",
    levelLabel: "Niveau",
    badgeFairPlayGuardian: "Gardien des valeurs d’INKA",
    badgeFairPlayGuardianDesc: "A fait preuve d’un esprit sportif et d’un respect exemplaires pendant les parties.",
    netCaptureDifference: "Écart des pièces capturées",
    skillAdvantageLabel: "Avantage de jeu",
    leaderLabel: "Joueur en tête",
    seedRatioLabel: "Ratio des graines",
    formulaLabel: "Formule",
    playerASeedsLabel: "Graines du joueur A",
    playerBHoldsLabel: "Le joueur B possède",
    playerASolidsPottedLabel: "Boules pleines empochées",
    playerBStripesPottedLabel: "Boules rayées empochées",
    endgameStageLabel: "Phase finale",
    targetGroupPotting: "Empocher les billes du groupe",
    playerAOnEightBall: "Le joueur A vise la bille 8",
    playerBOnEightBall: "Le joueur B vise la bille 8",
    piecesUnit: "pièces",
    levelStanding: "À égalité",
    dameBoardLabel: "Plateau 8×8",
    aimShotInstruction: "Visez la table et réglez la puissance du tir",
    cuePowerLabel: "Puissance de la queue",
    ballsRollingLabel: "Les billes roulent…",
    biyariScoringHelp: "Chaque bille empochée augmente l’avantage. Empochez d’abord les billes de votre groupe, puis la bille 8 pour gagner.",
    matchConcluded: "Match terminé",
    honorPointsAwarded: "Points de fair-play",
    passAndPlayLabel: "Jeu à deux sur le même appareil",
    gameDetailPhysics: "Simulation de table en 2D",
    communityMatchmakingDesc: "Trouvez une partie avec les joueurs de la communauté INKA.",
    noMatchesCompletedLabel: "Aucune partie terminée pour le moment. Défiez un joueur disponible pour commencer à gagner des points d’honneur.",
    matchOutcomeWin: "VICTOIRE",
    matchOutcomeLoss: "DÉFAITE",
    matchOutcomeDraw: "NUL",
    scheduledMatchConfirmation: "Partie organisée avec {player} : {game} ({time}) pendant {window}.",
    testRingLabel: "Tester la sonnerie",
    versusLabel: "contre",
    northTerritory: "Côté nord",
    southTerritory: "Côté sud",
    seedsCountLabel: "Graines",
    pitAccessibleLabel: "Trou ligne {row}, colonne {col}, {count} graines",
    profileDirectoryDesc: "Découvrez les joueurs, leurs jeux préférés et choisissez un adversaire dans le respect.",
    profileUpdatedLabel: "Votre profil a été mis à jour.",
    versusHistoryLabel: "contre",

    timeNoLimit: "Sans limite de temps",
    timeOfficial30s: "Limite officielle de 30 secondes par coup",
    timeRelaxed60s: "Limite souple de 60 secondes par coup",
    friendlyMatchConclusion: "Partie amicale terminée dans le respect mutuel",
    mutualDrawAgreed: "Les joueurs ont accepté une nulle dans le respect",
    watchLiveMatchesDescription: "Regardez les parties en direct et échangez respectueusement avec les autres spectateurs.",
    moveNumberLabel: "Coup",
    currentTurnWithLabel: "Au tour de {player}",
    dameVictoryReason: "{player} remporte la partie de Dame après avoir capturé les 10 pièces adverses.",
    igisoroVictoryReason: "{player} remporte l’Igisoro après avoir épuisé les graines adverses.",
    igisoroNoMovesVictoryReason: "{player} n’a plus de coup légal ; {winner} remporte la partie.",
    igisoroSelectPitInstruction: "Choisissez un trou de votre côté contenant au moins deux graines.",
    igisoroInvalidPitInstruction: "Au jeu d’Igisoro, vous ne pouvez jouer qu’à partir d’un trou contenant au moins deux graines.",
    igisoroCaptureMessage: "{player} a capturé {count} graines à l’adversaire !",
    playerConcededReason: "{player} a concédé la partie avec respect.",
    biyariEightBallVictoryReason: "{player} a empoché légalement la bille 8 et remporte la partie.",
    squareAccessibleLabel: "Case ligne {row}, colonne {col}, {piece}",
    pieceLabel: "pièce",
    incomingChallengeMessage: "Bonjour {player} ! Jouons une partie amicale de {game}.",
    defaultFriendlyMessage: "Prêt à jouer une partie amicale et respectueuse !",
    challengeSentNotice: "Une invitation a été envoyée à {player} pour {game} ({time}).",
    documentTitle: "INKA · Jeux d’adresse",
    metaDescription: "INKA est une plateforme gratuite de jeux d’adresse proposant l’Igisoro, le Dame et le Biyari. Jouez, rencontrez d’autres joueurs et partagez une compétition respectueuse.",
    playerLabel: "Joueur",
    normalizedAdvantageLabel: "Avantage de jeu normalisé",
    playerACapturesLabel: "Pièces capturées par le joueur A",
    playerBCapturesLabel: "Pièces capturées par le joueur B",
    opponentCalculatingMove: "L’adversaire réfléchit…",
    freeSkillCompetitionNotice: "Compétition d’adresse gratuite. Aucun pari ni risque financier.",
    matchFinishedHonorMessage: "La partie s’est terminée dans le respect et l’esprit sportif.",
    youLabel: "Vous",
    saveBioLabel: "Enregistrer la bio",
    specializesInLabel: "Spécialité",
    winsLabel: "victoires",
    gameStreamInProgress: "Partie en cours",
    turnLabel: "Tour",

    // Convenience Aliases
    nav_play: 'Jouer',
    nav_spectator: 'Arène en Direct',
    nav_schedule: 'Disponibilité',
    nav_honors: 'Honneurs & Trophées',
    nav_rules: 'Règles & Esprit',
    nav_community: 'Joueurs',
    hero_desc: 'La communauté rwandaise de jeux d’adresse traditionnels : Igisoro, Dames, et Billard.',
    the_three_games: 'Les Trois Jeux d’Adresse',
    game_dame: 'Dames (Dame)',
    game_igisoro: 'Igisoro (Mancala)',
    game_biyari: 'Biyari (Billard Huit)',
    dame_rule: '10 pièces par camp sur plateau 8×8',
    igisoro_rule: 'Plateau traditionnel de 32 fosses et 64 graines',
    biyari_rule: 'Billard américain à huit boules sur tapis vert',
    dame_captures: 'Prises',
    seeds_count: 'Graines Contrôlées',
    biyari_potted: 'Boules Empochées',
    play_dame: 'Jouer aux Dames',
    play_igisoro: 'Jouer à l’Igisoro',
    play_biyari: 'Jouer au Biyari',
    live_opponents: 'Joueurs Disponibles Actuellement',
    status_available: 'Disponible pour jouer',
    challenge: 'Défier',
    challenge_player: 'Défier le Joueur',
    select_game: 'Choisir le Jeu',
    time_control: 'Cadence de Jeu',
    time_casual: 'Convivial (Sans limite)',
    time_30s: '30s Rapide',
    time_60s: '60s Standard',
    fair_play: 'Fair-Play & Esprit Sportif',
    zero_wagering_rule: 'Zéro pari d’argent ni mise financière.',
    sportsmanship_awarded: 'Des points d’honneur sont accordés aux deux joueurs.',
    send_challenge: 'Envoyer l’Invitation',
    incoming_call: 'Invitation de Match en Direct',
    honor_rating: 'Score d’Honneur',
    match_history: 'Historique des Matchs',
    rules_title: 'Principes et Règles d’INKA',
    rules_desc: 'Règles authentiques, calcul de l’avantage et charte sans aucun pari.',
    schedule_time: 'Disponibilité et Planification',
    live_arena: 'Arène des Spectateurs en Direct',
    spectator_comments_hidden: 'Les commentaires des spectateurs sont masqués aux joueurs en cours de partie.',
    stop_game: 'Conclure la Partie Dignement',
    inka_philosophy: 'Sur INKA, toute conclusion se fait dans le respect mutuel et l’honneur.',
    continue_playing: 'Poursuivre la Partie',
    confirm_stop: 'Confirmer la Fin',
    draw: 'Proposer Nulle',
    lead_advantage: 'mène avec un avantage de',
    equal_standing: 'Égalité Parfaite',
    score_advantage: 'Avantage Tactique',
    spectators_watching: 'spectateurs en direct',
    live_spectators: 'Spectateurs en Direct',
  },
};

/**
 * Validates that all translation schemas have identical keys across languages.
 * Throws an error or returns a report if any key is missing or empty.
 */
export function validateTranslations(): {
  isValid: boolean;
  missingInRw: string[];
  missingInFr: string[];
  emptyValues: string[];
} {
  const enKeys = Object.keys(translations.en) as (keyof TranslationSchema)[];
  const rwKeys = new Set(Object.keys(translations.rw));
  const frKeys = new Set(Object.keys(translations.fr));

  const missingInRw: string[] = [];
  const missingInFr: string[] = [];
  const emptyValues: string[] = [];

  for (const k of enKeys) {
    if (!rwKeys.has(k)) missingInRw.push(k);
    if (!frKeys.has(k)) missingInFr.push(k);

    if (!translations.en[k] || translations.en[k].trim() === '') emptyValues.push(`en.${k}`);
    if (!translations.rw[k] || translations.rw[k].trim() === '') emptyValues.push(`rw.${k}`);
    if (!translations.fr[k] || translations.fr[k].trim() === '') emptyValues.push(`fr.${k}`);
  }

  return {
    isValid: missingInRw.length === 0 && missingInFr.length === 0 && emptyValues.length === 0,
    missingInRw,
    missingInFr,
    emptyValues,
  };
}
