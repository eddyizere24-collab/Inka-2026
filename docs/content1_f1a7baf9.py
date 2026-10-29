# -*- coding: utf-8 -*-
from helpers import *

def build():
    # =========================================================
    # 1. INTANGIRIRO
    # =========================================================
    H1("1. Intangiriro n'icyerekezo")
    LEAD("Iki gitabo kiragusobanurira intambwe ku yindi uko wakubaka application ya biyari (pool) "
         "imeze nk'iy'abanyamwuga, ku buryo umukinnyi wese yumva ko ari ku meza nyayo.")

    H2("1.1 Biyari yo ku rwego rw'isi iterwa n'iki?")
    P("Abantu babarirwa muri za miliyoni bakina biyari kuri telefone, ariko benshi muri bo bakina imikino isa. "
      "Icyo itandukaniraho ni utuntu duto cyane. Application yo ku rwego rw'isi yubakiye ku <b>nkingi eshanu</b>:")
    TBL([
        ["Inkingi", "Icyo bivuze", "Impamvu ari ingenzi"],
        ["<b>1. Physics nyayo</b>", "Umupira uzunguruka, ugonga undi, ugasubira ku mpande z'ameza nk'uko bigenda ku meza nyayo.",
         "Umukinnyi w'umunyamwuga amenya ako kanya physics y'impimbano. Iyo atayizeye, ava mu mukino."],
        ["<b>2. Kugenzura neza</b>", "Aim, imbaraga, uruziga (spin) n'uburebure bw'inkoni bigenzurwa neza ku gikoresho icyo ari cyo cyose.",
         "Biyari ni umukino w'ubusobanuro: ikosa rya 0.1° riragaragara ku ntera ya metero 2.5."],
        ["<b>3. Amashusho n'amajwi</b>", "Urumuri, ibyuma by'imipira, ijwi rya buri kugonga, imiterere y'icyumba.",
         "Ni byo bita \"game feel\": bituma wumva uri ku kibuga."],
        ["<b>4. Online ikora neza</b>", "Kubona uwo muhangana vuba, nta kubeshya (cheating), nta kuzimira k'umukino.",
         "Abakinnyi benshi bashaka guhangana n'abantu nyabo."],
        ["<b>5. Impamvu yo gusubira</b>", "Urutonde (ranking), amarushanwa, ibihembo, inshuti, ibintu byo gukusanya.",
         "Hatabayeho ibi, abakinnyi bakina iminsi mike bakagenda."],
    ], [2.2, 5, 4.6])
    NOTE("<b>Itegeko rya zahabu: physics ibanza.</b> Tangirira ku physics n'uburyo bwo kwerekeza (aim). "
         "Umukino ufite physics itari nziza ntujya uba mwiza, n'iyo amashusho yawo yaba meza gute. "
         "Amashusho meza ashyirwaho nyuma yo kumenya neza ko \"feel\" ari yo.", "tip")

    H2("1.2 Ibyemezo 6 byo gufata mbere yo gutangira")
    TBL([
        ["Icyemezo", "Inama"],
        ["Platform", "Tangira kuri <b>Android</b> (ni yo ikoreshwa cyane muri Afurika) na iOS; PC na WebGL byaza nyuma."],
        ["Ubwoko bw'imikino", "Tangira na <b>8-Ball</b>, wongereho <b>9-Ball</b>. Snooker na Carom biza nyuma kuko amategeko n'ubunini bw'ameza bitandukanye."],
        ["2D cyangwa 3D", "Hitamo <b>3D</b> (urumuri n'ibyiyumvo byiza) ariko ushyiremo n'uburyo bwo kureba hejuru (top-down) mu kwerekeza neza."],
        ["Intego y'ingenzi", "Kurushanwa kuri internet (PvP), gukina na AI, no gukina udafite internet (offline)."],
        ["Isoko", "Soft launch mu Rwanda n'Afurika y'Iburasirazuba, hanyuma isi yose. Indimi: Kinyarwanda, Icyongereza, Igifaransa, Igiswahili."],
        ["Itsinda n'ingengo y'imari", "Wenyine cyangwa itsinda rya 5–8. Reba igice cya 16 (gahunda y'imirimo)."],
    ], [2.2, 9.6])

    H2("1.3 Uko wakoresha iki gitabo")
    B(["Igice cya <b>3 n'icya 4</b> (ikoranabuhanga na physics) ni cyo gishingiro: ubisome neza mbere yo kwandika code.",
       "Ibice bya <b>6 kugeza ku cya 8</b> bivuga ibituma wumva uri ku kibuga (amashusho, kugenzura, amajwi).",
       "Igice cya <b>17</b> ni urutonde rusoza ushobora gucapa ukarukoresha mu igeragezwa ry'umukino.",
       "Imibare yatanzwe (urugero: coefficients) ni <b>indangagaciro zo gutangiriraho</b>; uzazikosora ugereranya n'ameza nyayo n'abakinnyi nyabo."])

    # =========================================================
    # 2. UBWOKO BW'IMIKINO N'AMEZA
    # =========================================================
    H1("2. Ubwoko bw'imikino n'ameza")
    LEAD("Mbere yo kwandika physics, ugomba kumenya neza ingano z'ameza n'imipira, kuko ari zo zizakoreshwa mu mibare yose.")

    H2("2.1 Ubwoko bw'imikino bwa biyari")
    TBL([
        ["Umukino", "Imipira", "Intego ngufi", "Icyo ugomba kumenya"],
        ["<b>8-Ball</b>", "15 + umupira w'umweru (cue ball)", "Injiza imipira yawe (1–7 cyangwa 9–15), hanyuma 8.", "Wamamaye cyane ku isi; ukwiye gutangirirwaho."],
        ["<b>9-Ball</b>", "9 + cue ball", "Kubanza gukubita umupira ufite nimero nto; 9 utsindisha.", "Wihuta, ukunzwe mu marushanwa."],
        ["<b>10-Ball</b>", "10 + cue ball", "Nka 9-Ball ariko ugomba \"gutangaza\" (call) buri gikubo.", "Ugoye kurusha 9-Ball."],
        ["<b>Straight Pool (14.1)</b>", "15 + cue ball", "Kugera ku manota yemeranyijwe (urugero 100).", "Hakenewe \"rack\" nshya mu mukino."],
        ["<b>Snooker</b>", "15 red, 6 z'amabara, cue ball", "Gukusanya amanota (red=1 … black=7).", "Ameza manini (12 ft), imipira mito, amategeko menshi."],
        ["<b>Carom / 3-Cushion</b>", "Imipira 3", "Gukubita imipira yombi no gukoza nibura impande 3.", "Nta myobo; physics y'impande ni yo y'ingenzi."],
    ], [2, 2.4, 4.2, 4.2])
    NOTE("<b>Inama:</b> Version 1.0 ikwiye kugira <b>8-Ball na 9-Ball gusa</b>. Byombi bikoresha ameza amwe n'imipira imwe, bityo physics yawe ntihinduka. "
         "Snooker na Carom bisaba ameza n'imipira bitandukanye, n'amategeko akomeye; ubishyire muri update zizakurikiraho.", "tip")

    H2("2.2 Ingano z'ameza n'imipira")
    P("Koresha <b>SI units</b> (metero, kilogramu, isegonda) mu code yose. Ntukavange santimetero na pixels muri physics: "
      "pixels ni iz'amashusho gusa (rendering). Ibi bikurinda amakosa y'ingano atagaragara.")
    TBL([
        ["Ameza", "Aho gukinirwa (uburebure × ubugari)", "Umupira (diameter / uburemere)", "Imyobo"],
        ["Pool 9-ft (WPA)", "2.54 m × 1.27 m", "57.15 mm / 156–170 g", "6: mfuruka ≈ 11.4–11.7 cm; hagati ≈ 12.7–13 cm"],
        ["Pool 8-ft", "≈ 2.24 m × 1.12 m", "57.15 mm", "6"],
        ["Pool 7-ft (bar)", "≈ 1.98 m × 0.99 m", "57.15 mm", "6 (imyobo irenga gato)"],
        ["Snooker 12-ft", "3.569 m × 1.778 m", "52.5 mm / ≈ 142 g", "6: mfuruka ≈ 8.5 cm; hagati ≈ 10 cm"],
        ["Carom (3-cushion)", "≈ 2.84 m × 1.42 m", "61.5 mm / 205–220 g", "Nta"],
    ], [2.4, 3.4, 3.2, 3.8])

    H2("2.3 Ibimenyetso n'imiterere y'ameza ya Pool")
    B(["<b>Sisitemu y'ibipimo:</b> shyira <i>origin</i> hagati y'ameza; <i>x</i> ni uburebure, <i>y</i> ni ubugari, <i>z</i> ni hejuru. Ku meza ya 9-ft: x ∈ [−1.27, +1.27] m, y ∈ [−0.635, +0.635] m.",
       "<b>Head spot</b> iri kuri x = −L/4; <b>foot spot</b> iri kuri x = +L/4 (aho umupira wa mbere w'amatsinda utangirira); <b>center spot</b> iri hagati. Umurongo wa <b>head string</b> unyura ku head spot.",
       "<b>Diamonds</b> ni utuntu 18 two'ishusho ku mpande z'ameza (3 hagati ya buri myobo ibiri). Ni zo zikoreshwa mu \"diamond system\" ry'abakinnyi mu gukina \"bank shots\"; zigomba kuba ahabigenewe neza.",
       "<b>Uburebure bw'ikiringiti (cushion nose):</b> ≈ 63.5% by'umurambararo w'umupira (≈ 36 mm). Ni ingenzi mu mibare yo gusubira ku mpande.",
       "<b>Nimero n'amabara y'imipira:</b> 1 umuhondo, 2 ubururu, 3 umutuku, 4 umuzingo (purple), 5 orange, 6 icyatsi, 7 maroon, 8 umukara; 9–15 ni \"stripes\" zifite amabara ya 1–7."])
    NOTE("Ushobora gutanga <b>ingano z'ameza nka \"data\"</b> (ScriptableObject/JSON) aho kuzishyira mu code. Ibi bigufasha kongeramo ameza ya 7-ft, 8-ft, 9-ft ndetse na snooker nyuma nta guhindura code ya physics.", "tech")

    # =========================================================
    # 3. IKORANABUHANGA
    # =========================================================
    H1("3. Ikoranabuhanga ugomba guhitamo")
    LEAD("Guhitamo neza tech stack mu ntangiriro bigabanya amezi y'akazi nyuma. Dore ibyo nkugira inama n'impamvu.")

    H2("3.1 Game engine")
    TBL([
        ["Engine", "Ibyiza", "Ibibi", "Ndakugira inama?"],
        ["<b>Unity 6 (C#)</b>", "Android/iOS/PC/WebGL; ubwoko bwinshi bwa assets; URP ikora neza kuri telefone; community nini; ubone abakozi byoroshye.",
         "Ingano ya build; reba ibiciro n'amategeko ya licence igihe cyose.", "<b>Yego</b> (iya mbere)."],
        ["Unreal Engine 5", "Amashusho meza cyane kuri PC/console.", "Iremereye kuri telefone zoroheje; build nini.", "Oya ku isoko rya Android yoroheje."],
        ["Godot 4", "Ni ubuntu, yoroheje, open-source.", "Ecosystem ntoya kuri 3D ya mobile n'ibikoresho by'ubucuruzi.", "Ushobora kuyikoresha niba ushaka 2D yoroheje."],
        ["Cocos Creator / Flutter+Flame", "Yoroheje cyane; nziza kuri 2D top-down.", "3D igoye cyangwa ntoya.", "Niba ushaka version ya 2D ya telefone zoroheje cyane."],
        ["Native (Kotlin/Swift + Vulkan/Metal)", "Kugenzura byuzuye.", "Akazi kaba kabiri (Android na iOS).", "Oya."],
    ], [2.4, 4, 3.4, 2.4])
    NOTE("<b>Icyifuzo cyanjye:</b> Unity 6 LTS + C# + URP (Universal Render Pipeline). "
         "Physics (core) wandikire muri <b>C# isanzwe itari iy'engine</b> (.NET Standard 2.1), ku buryo ushobora kuyikoresha no kuri seriveri.", "tip")

    H2("3.2 Kuki utagomba gukoresha physics ya Unity (PhysX) cyangwa Box2D?")
    B(["Ntizifite uburyo bwiza bwo gukora <b>sliding → rolling</b> (friction ya cloth ifitanye isano n'uruziga).",
       "Ntizishobora kwemeza ko <b>ibisubizo bizahora ari bimwe</b> kuri buri telefone (non-deterministic). Muri multiplayer, ibi byatera ko abakinnyi babiri babona ibintu bitandukanye.",
       "Umupira ugenda vuba ushobora <b>kunyura mu mupira cyangwa mu rukuta</b> (tunneling).",
       "Ntushobora kuyikoresha kuri seriveri nta kugura Unity headless (ihenze kandi iremereye)."])
    NOTE("Ikintu cy'ingenzi: <b>ujye wandika physics yawe bwite.</b> Imipira ni 16 gusa, bityo ntizisaba imbaraga nyinshi za CPU. "
         "Unity ikoreshwa gusa mu <b>kwerekana</b> (rendering), amajwi, UI no kwakira ibyo ukoze (input).", "warn")

    H2("3.3 Backend (seriveri) n'izindi serivisi")
    TBL([
        ["Igikenewe", "Amahitamo", "Icyo ndakugira inama"],
        ["Seriveri y'umukino (game server)", "C# (.NET), Go, Node.js/TypeScript; Nakama (open-source, Go); Photon; PlayFab; Colyseus",
         "<b>C# (.NET)</b> kugira ngo ukoreshe <i>physics core</i> imwe kuri client no kuri seriveri. Cyangwa <b>Nakama</b> n'ibikoresho byayo (matchmaking, leaderboards) hamwe na module ya C#/Go."],
        ["Real-time", "WebSocket (TCP), UDP/KCP, WebRTC", "<b>WebSocket</b>: biyari ni umukino ukinirwa mu byiciro (turn-based), nta kibazo cya latency nkuko bimeze muri shooter."],
        ["Ububiko bw'amakuru", "PostgreSQL, Redis, Firestore", "<b>PostgreSQL</b> (konti, ibyaguzwe, amateka) + <b>Redis</b> (matchmaking, leaderboards, sessions)."],
        ["Konti (auth)", "Guest, nimero ya telefone (OTP), Google, Apple, Facebook", "Tangira na <b>Guest + Google/Apple + telefone</b>. Menya ko Apple isaba \"Sign in with Apple\" iyo ushyizemo andi mahitamo yo kwinjira."],
        ["Analytics n'amakosa", "Firebase (Analytics, Crashlytics, Remote Config), GameAnalytics", "<b>Firebase</b>: yoroshye gutangira kandi ifite igihe cy'ubuntu kinini."],
        ["Kwishyura", "Google Play Billing, Apple IAP, mobile money", "Reba igice cya 15."],
        ["Hosting", "AWS (Cape Town), Google Cloud (Johannesburg), Azure (South Africa North)", "Hitamo <b>region iri hafi y'abakinnyi</b> (Afurika y'Epfo) kugira ngo ubukererwe (latency) bugabanuke."],
        ["Gutanga assets (CDN)", "CloudFront, Cloudflare, Google Cloud CDN", "Koresha CDN ku bintu bishya (cues, ameza) bitari muri APK."],
    ], [2.4, 4.2, 5.4])

    H2("3.4 Ibikoresho by'imirimo")
    B(["<b>3D:</b> Blender (ameza, imipira, inkoni) + Substance Painter / Quixel (textures).",
       "<b>UI/UX:</b> Figma.",
       "<b>Amajwi:</b> FMOD Studio (cyangwa Wwise) + Reaper/Audacity mu guhindura amajwi.",
       "<b>Code:</b> Git (GitHub/GitLab) + Git LFS; Rider cyangwa Visual Studio; ikizamini cya NUnit cyangwa Unity Test Framework.",
       "<b>CI/CD:</b> GitHub Actions / GameCI / Unity Build Automation + Fastlane (kohereza kuri Play Store na App Store).",
       "<b>Gucunga imirimo:</b> Linear, Jira cyangwa Trello."])

    H2("3.5 Imiterere ya software (layers)")
    P("Gabanya software mu byiciro bitandukanye. Icyiciro cy'hasi (Core) <b>ntigomba kumenya Unity</b>:")
    def lyr(txt, bg, fg=colors.white):
        return Paragraph("<font color='%s'><b>%s</b></font>" % (fg.hexval().replace("0x", "#"), txt), ST["cell"])
    rows = [
        [lyr("Presentation (Unity): amashusho, kamera, amajwi, UI, input, animations", FELT)],
        [lyr("Meta/Services: konti, matchmaking, ububiko, economy, store, tournaments", BLUE)],
        [lyr("AI: guhitamo gukubita, difficulty levels (ikoresha Core ya physics)", colors.HexColor("#8A5A12"))],
        [lyr("Rules Engine: amategeko ya 8-Ball/9-Ball, fouls, ball-in-hand (function ya \"pure\")", colors.HexColor("#6B3A7D"))],
        [lyr("CORE PHYSICS (C# isanzwe, deterministic): imipira, ameza, collisions, spin, imyobo", FELT_D)],
    ]
    t = Table(rows, colWidths=[CW])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (0, 0), FELT), ("BACKGROUND", (0, 1), (0, 1), BLUE),
                           ("BACKGROUND", (0, 2), (0, 2), colors.HexColor("#8A5A12")),
                           ("BACKGROUND", (0, 3), (0, 3), colors.HexColor("#6B3A7D")),
                           ("BACKGROUND", (0, 4), (0, 4), FELT_D),
                           ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                           ("LEFTPADDING", (0, 0), (-1, -1), 10), ("LINEBELOW", (0, 0), (-1, -2), 2, colors.white)]))
    story.append(t)
    SP(8)
    P("Core physics n'Rules Engine bikora kuri <b>client</b> (kwerekana vuba) no kuri <b>seriveri</b> (kwemeza ibisubizo bya nyuma). "
      "AI ikoresha Core imwe, ikayikoresha nta mashusho (headless) kugira ngo igerageze amagana y'imikubitire mu isegonda.")

    # =========================================================
    # 4. PHYSICS
    # =========================================================
    H1("4. Physics: umutima w'umukino")
    LEAD("Iki ni igice cy'ingenzi kuruta ibindi byose. Umukinnyi ntamenya ko wakoresheje shaders nziza, ariko amenya ako kanya "
         "ko umupira \"utagenda nk'uko ukwiye\". Hano hari uburyo bwuzuye bwo kubaka physics nyayo.")

    H2("4.1 Imiterere y'umupira (ball state)")
    P("Buri mupira ugomba kubika:")
    B(["<b>Umwanya</b> r = (x, y, z) m; <b>umuvuduko</b> v = (v<sub>x</sub>, v<sub>y</sub>, v<sub>z</sub>) m/s.",
       "<b>Umuvuduko wo kuzunguruka</b> ω = (ω<sub>x</sub>, ω<sub>y</sub>, ω<sub>z</sub>) rad/s. ω<sub>x</sub> na ω<sub>y</sub> bigena <i>kuzunguruka imbere/inyuma</i> (follow/draw) naho ω<sub>z</sub> ikaba <i>side spin</i> (\"english\").",
       "<b>Rotation (quaternion)</b> mu kwerekana: ni yo ituma imibare iri ku mupira izunguruka nyabyo.",
       "<b>Uko umupira ameze (motion state):</b> Stationary (uri hasi), Spinning (uzunguruka hamwe), Sliding (unyerera), Rolling (uzunguruka neza), Airborne (uri mu kirere), Pocketed (winjiye mu mwobo)."])
    CODE("""
struct Ball {
    public int Id;
    public Vec3 Pos;      // metero
    public Vec3 Vel;      // m/s
    public Vec3 Omega;    // rad/s  (x,y: kuzunguruka imbere/inyuma; z: side spin)
    public Quat Rot;      // kwerekana gusa (rendering)
    public MotionState State;  // Stationary, Spinning, Sliding, Rolling, Airborne, Pocketed
}
""", "C# \u2014 imiterere y'umupira")

    H2("4.2 Uburyo bwo gukora simulation")
    P("Hari uburyo bubiri bw'ingenzi:")
    TBL([
        ["Uburyo", "Uko bukora", "Ibyiza / Ibibi"],
        ["<b>Time-stepped</b> (fixed timestep)", "Simulation ikorwa mu duhe duto tungana (urugero 1/240 s). Buri ntambwe ireba collisions.",
         "Byoroshye kwandika. Bisaba <i>continuous collision detection</i> (CCD) no gukoresha timestep ntoya kugira ngo umupira ugenda vuba udasimbuka."],
        ["<b>Event-driven</b>", "Kubara <i>igihe nyacyo</i> cy'ikintu gikurikira (collision, igihe umupira uhinduka rolling, n'ibindi), ugasimbura igihe kugeza kuri cyo.",
         "Nta tunneling, byihuta cyane kandi byizewe kuri multiplayer. Bigoye kwandika gato."],
    ], [2.6, 4.8, 5])
    NOTE("<b>Ndakugira inama:</b> tangira na <b>fixed timestep</b> (1/240 s) ufite CCD ku mipira. Iyo ukimenye neza, wimukire kuri <b>event-driven</b> niba ushaka ibisubizo byizewe kurushaho no kwihuta kwa AI.", "tip")

    CODE("""
// Simulation ya shot imwe (Core library, nta Unity)
const double DT = 1.0 / 240.0;
const double MAX_TIME = 60.0;       // ntihagire shot irenza amasegonda 60

ShotReport Simulate(TableState s, Shot shot)
{
    ApplyCueStrike(s.CueBall, shot);        // kubara v0 na omega bivuye ku mwanya cue ikoraho
    var report = new ShotReport();
    double t = 0;

    while (!s.AllBallsAtRest() && t < MAX_TIME)
    {
        StepBalls(s, DT);                   // sliding / rolling / spinning
        ResolveBallBall(s, report);         // collisions z'imipira
        ResolveCushions(s, report);         // gusubira ku mpande
        ResolvePockets(s, report);          // kwinjira mu myobo
        t += DT;
    }
    return report;      // ikoreshwa na Rules Engine, na UI
}
""", "C# \u2014 loop y'ibanze")
    P("Mu ruhande rwa Unity, kora <b>simulation ku muvuduko wihariye</b> (fixed) uyitandukanyije n'igipimo cy'amashusho (frame rate). "
      "Mu kwerekana, <i>interpolate</i> hagati y'imyanya ibiri ya nyuma kugira ngo umupira ugende neza ku 60/120 fps.")

    H2("4.3 Imigendere y'umupira ku cloth: sliding → rolling")
    P("Iyo cue ikubise umupira, uwo mupira <b>ubanza kunyerera</b> (sliding) kuko ubuso bwawo bw'hasi buhura n'imyenda (cloth) bufite umuvuduko utandukanye n'uwo umupira ugenda. "
      "Hanyuma friction ikoresha uruziga rukagenda rwiyongera kugeza umupira <b>uzunguruka neza</b> (rolling) – ni cyo gituma umupira ukubiswe hagati usa n'uwacogoye, ukagwa ku muvuduko wa 5/7 w'uwa mbere.")
    P("Reka u ibe <b>umuvuduko w'aho umupira uhurira na cloth</b>: <b>u = v + R (ẑ × ω)</b>, ni ukuvuga u<sub>x</sub> = v<sub>x</sub> − R·ω<sub>y</sub>, u<sub>y</sub> = v<sub>y</sub> + R·ω<sub>x</sub>. "
      "Iyo u ≠ 0, umupira urimo <b>kunyerera</b>; iyo u = 0, urimo <b>kuzunguruka neza</b>.")
    TBL([
        ["Uko umupira ameze", "Itegeko ry'ingenzi"],
        ["<b>Sliding</b> (u ≠ 0)", "Friction ya cloth ihuza umupira n'umuvuduko: <b>a = −μ<sub>s</sub>·g·û</b>. Ku ruziga ibyo bivamo <b>du/dt = −(7/2)·μ<sub>s</sub>·g·û</b>. Igihe cyo kugera kuri rolling (gukubita hagati): <b>t = 2v<sub>0</sub> / (7μ<sub>s</sub>g)</b>; intera: <b>s = 12v<sub>0</sub>² / (49μ<sub>s</sub>g)</b>; umuvuduko wa nyuma: <b>5v<sub>0</sub>/7</b>."],
        ["<b>Rolling</b> (u = 0)", "Umupira ugenda buhoro bitewe na <i>rolling resistance</i>: <b>a = −μ<sub>r</sub>·g</b> (μ<sub>r</sub> ≈ 0.005–0.015). Uruziga rukurikiza umuvuduko: ω<sub>y</sub> = v<sub>x</sub>/R, ω<sub>x</sub> = −v<sub>y</sub>/R."],
        ["<b>Spinning</b> (v ≈ 0, ω<sub>z</sub> ≠ 0)", "Side spin igabanuka buhoro buhoro: ω<sub>z</sub> igabanywa n'agaciro gahoraho (tune; hafi 10–15 rad/s² ni intangiriro)."],
        ["<b>Stationary</b>", "Umupira wahagaze neza; ntukawukorere simulation kugira ngo wihute (\"sleeping\")."],
    ], [2.6, 9.4])
    CODE("""
// Intambwe imwe ya sliding/rolling (R = radius, G = 9.81)
Vec2 u = new Vec2(v.x - R*w.y, v.y + R*w.x);   // slip velocity ku cloth

if (u.Length > EPS) {                // SLIDING
    Vec2 uh = u.Normalized;
    v   -= uh * (MU_S * G * dt);                  // friction ihindura umuvuduko
    w.x += (5*MU_S*G/(2*R)) * (-uh.y) * dt;       // ... n'uruziga
    w.y += (5*MU_S*G/(2*R)) * ( uh.x) * dt;
    // niba u ihindutse ikimenyetso muri iyi ntambwe -> shyira u = 0 (itangira rolling)
} else {                             // ROLLING
    double sp = v.Length;
    sp = Math.Max(0, sp - MU_R * G * dt);         // rolling resistance
    v  = (sp > 0) ? v.Normalized * sp : Vec2.Zero;
    w.y =  v.x / R;   w.x = -v.y / R;             // uruziga rukurikiza umuvuduko
}
// side spin (w.z) igabanuka ukwayo
w.z -= Math.Sign(w.z) * Math.Min(Math.Abs(w.z), SPIN_DECEL * dt);
""", "C# \u2014 sliding / rolling (ibimenyetso byageragejwe: du/dt = \u2212(7/2)\u00b5g\u00fb)")

    H2("4.4 Gukubita umupira n'inkoni (cue strike)")
    P("Umukinnyi atanga: <b>icyerekezo</b> (aim), <b>imbaraga</b> (v<sub>0</sub>), <b>aho inkoni ikoraho</b> ku mupira (a = ibumoso/iburyo, b = hejuru/hasi, byombi bipimwa muri R) n'<b>uburebure bw'inkoni</b> (elevation θ). "
      "Ku gukubita kuri θ = 0 (inkoni iringaniye):")
    B(["<b>Side spin:</b> ω<sub>z</sub> = 5·v<sub>0</sub>·a / (2R²)",
       "<b>Top/back spin:</b> ω<sub>⊥</sub> = 5·v<sub>0</sub>·b / (2R²) (b &gt; 0 = follow, b &lt; 0 = draw)",
       "<b>Urugero:</b> v<sub>0</sub> = 2 m/s, a = 0.5R, R = 0.028575 m → ω<sub>z</sub> ≈ <b>88 rad/s</b> (hafi 14 imizingo mu isegonda).",
       "<b>Aho gukubita \"natural roll\":</b> iyo b = 0.4R (hejuru y'igicaro cy'umupira ho 2/5 by'umuzenguruko), umupira utangira kuzunguruka neza ako kanya nta kunyerera. Ni <b>igeragezwa ryiza</b> ry'imibare yawe."])
    TBL([
        ["Ingaruka", "Isobanuro", "Uko ubikora mu mukino"],
        ["<b>Miscue</b>", "Iyo inkoni ikoze kure cyane y'igicaro (|offset| &gt; ≈ 0.5R), inkoni inyerera ikajya hanze y'umupira.",
         "Shyiraho umupaka (≈ 0.5R). Hanze yawo, shyiraho ibyago bya miscue bizamuka uko urenga, hamwe n'ijwi n'ivumbi ry'ifu (chalk puff)."],
        ["<b>Squirt (deflection)</b>", "Umupira ujya gato ku ruhande ruhabanye n'aho wakubise iyo ukoresheje side spin.",
         "Shyiraho inguni ingana na k·(a/R); intangiriro ≈ 1–2° ku a = 0.5R, hanyuma ukosore. Inkoni zihenze zigabanya squirt."],
        ["<b>Swerve</b>", "Inzira y'umupira ikata gato iyo inkoni yazamuye kandi hari side spin.", "Biva ku <i>friction model</i> yawe iyo uyikoze neza; ntukongere formula yihariye."],
        ["<b>Mass\u00e9 / Jump</b>", "Inkoni izamuye (θ &gt; 20°) ituma umupira ukata inzira cyangwa usimbuka.", "Ongeraho nyuma (advanced); shyiramo impulse ya z (hasi/hejuru) n'impumyi ya cloth."],
    ], [2.2, 4.8, 5])

    H2("4.5 Guhura kw'imipira (ball–ball collision)")
    P("Imipira yose ingana mu buremere, bityo birorohera: umupira ukubise undi uhererekanya <b>igice cy'umuvuduko ku murongo uhuza ibigo byabo</b> (normal n). "
      "Igice gitambitse (tangent) kirakomeza, ni cyo gituma \"ghost ball\" ikora. Iyo <i>e = 1</i> kandi nta spin, cue ball itambitse itwara inguni ya 90° kuri object ball (\"90° rule\").")
    CODE("""
// A ikubise B. n = vector y'ubunini 1 ivuye kuri A ijya kuri B ku gihe cyo guhura
double vn = Vec2.Dot(A.Vel - B.Vel, n);          // umuvuduko wegera ku murongo wa n
if (vn > 0) {                                     // barimo kwegerana
    double J = (1 + E_BB) * M * vn / 2.0;         // impulse (imipira ingana)
    A.Vel -= n * (J / M);
    B.Vel += n * (J / M);

    // "Throw": friction hagati y'imipira (mu cyerekezo gihagaze kuri n)
    // Jt = min(MU_BB * J, impulse ikenewe ngo slip ihagarare)  -> igira ingaruka kuri spin n'inzira
}
""", "C# \u2014 collision y'imipira ibiri")
    B(["<b>E<sub>BB</sub> (restitution)</b> ≈ 0.93–0.98: umupira ugonze undi ntabura imbaraga nyinshi.",
       "<b>Throw</b> (friction hagati y'imipira, μ ≈ 0.03–0.08) ihindura gato inzira ya object ball; side spin ya cue ball nayo itera \"spin transfer\". Abakinnyi b'inararibonye barabyumva.",
       "<b>Break (gutangiza):</b> koresha ubusobanuro buhamye ku mipira 15 ifatanye (aho imipira myinshi ihura ako kanya). Koresha <i>sub-steps</i> cyangwa event-driven kugira ngo imipira idakatana."])

    H2("4.6 Gusubira ku mpande (cushions)")
    P("Ikiringiti (cushion) kigira <b>uburebure bw'aho gihura n'umupira</b> bungana ≈ 63.5% by'umurambararo w'umupira, bivuze ko gihura n'umupira <b>hejuru gato y'igicaro cyawo</b> (≈ 0.27R). "
      "Ibi bituma side spin ihindura inguni y'isubira, kandi umupira ukaba ukururwa hasi gato. Dore uko ukora:")
    B(["<b>Normal restitution</b> e<sub>c</sub>: ≈ 0.6–0.9, ikagabanuka uko umuvuduko wiyongera. Urugero rwo gutangiriraho: <font name='DVM'>e = clamp(0.90 − 0.02·v, 0.6, 0.9)</font>.",
       "<b>Friction y'impande</b> (μ ≈ 0.14–0.30) ihindura side spin ikayihindura inguni nshya n'uruziga rushya.",
       "<b>Imiterere y'impande:</b> kora impande nk'<i>imirongo</i> hamwe n'<i>uruziga ruto</i> ku mpera (\"knuckles\"). Ni zo zituma imipira \"ihondagura\" imyobo mu buryo nyabwo.",
       "<b>Icyitegererezo cy'ubushakashatsi:</b> Han (2005) cyangwa Mathavan et al. (2010) bifite imibare ikubiyemo spin n'uburebure bw'aho gukora. Tangira n'icyoroshye hanyuma ukigane."])

    H2("4.7 Imyobo (pockets)")
    B(["Buri mwobo ugira <b>agace ko gufata</b> (circle) hamwe n'impande z'imbere (<i>jaws</i>) zikozwe n'uruziga ruto.",
       "Umupira <b>winjira</b> iyo igicaro cyawo kinjiye mu gice cy'umwobo n'umuvuduko utazamuye cyane. Iyo uwuhonze ku mpande z'umwobo (jaws) uragaruka; imyobo yoroshye kurusha iy'ingorabahizi igaragaza itandukaniro.",
       "Umwobo wo <b>hagati (side pocket)</b> ukaze kurusha uwo mfuruka; shyiramo itandukaniro ry'ubugari mu mibare.",
       "Iyo umupira winjiye, <b>kora animation</b> ya \"rattle\", kugwa, no kunyura mu muyoboro w'imipira (ball return). Ni igice kinini cy'ibyiyumvo."])

    H2("4.8 Indangagaciro zo gutangiriraho (parameters)")
    TBL([
        ["Parameter", "Intangiriro", "Ubutumbuke busanzwe", "Icyitonderwa"],
        ["Ball diameter / R", "57.15 mm / 28.575 mm", "—", "WPA"],
        ["Ball mass (m)", "0.170 kg", "0.156–0.170", "Imipira yose ingana"],
        ["Sliding friction μ<sub>s</sub> (ball–cloth)", "0.20", "0.15–0.40", "Cloth nshya = ntoya; ishaje = nini"],
        ["Rolling resistance μ<sub>r</sub>", "0.010", "0.005–0.015", "Ni ryo rigena \"umuvuduko w'ameza\""],
        ["Ball–ball restitution E<sub>BB</sub>", "0.95", "0.92–0.98", "—"],
        ["Ball–ball friction μ<sub>bb</sub>", "0.06", "0.03–0.08", "Igena throw"],
        ["Cushion restitution e<sub>c</sub>", "0.75 (bigenda bitewe na v)", "0.6–0.9", "Hasi iyo umuvuduko uri hejuru"],
        ["Cushion friction μ<sub>c</sub>", "0.20", "0.14–0.30", "—"],
        ["Cushion nose height", "63.5% bya diameter", "62.5–64.5%", "≈ 36.3 mm"],
        ["Max cue-ball speed (break)", "≈ 12 m/s", "10–13", "Ba pro bakubita break ya 25–30 mph"],
        ["Fixed timestep", "1/240 s", "1/120–1/1000", "Gabanya niba ubona tunneling"],
        ["Gravity g", "9.81 m/s²", "—", "—"],
    ], [3.4, 2.7, 2.4, 3.5])
    NOTE("<b>Kora \"cloth presets\"</b> (Fast / Medium / Slow) uhindura gusa μ<sub>r</sub> na μ<sub>s</sub>; "
         "ni uburyo bworoshye bwo gutanga ameza atandukanye (urugero amazi y'amarushanwa ni yihuta kurusha ay'akabari).", "tip")

    H2("4.9 Gupima no kugereranya physics yawe")
    P("Ntushobora kumenya ko physics ari nziza utayipimye. Kora <b>unit tests</b> zibarirwa mu magana zishingiye ku bintu byizwi:")
    TBL([
        ["Igerageza", "Igisubizo gitegerejwe"],
        ["Gukubita hagati (b = 0), nta side spin", "Umupira unyerera hanyuma ukazunguruka; umuvuduko wa nyuma ≈ <b>5/7·v<sub>0</sub></b>."],
        ["Gukubita ku b = 0.4R", "Umupira utangira \"natural roll\" ako kanya (nta sliding)."],
        ["Stun shot (gukubita object ball imbere-imbere nta spin)", "Cue ball <b>ihita ihagarara</b> (hafi); object ball ikajyana umuvuduko."],
        ["90° rule", "Nta spin, cut ya none-head-on: cue ball ijya ≈ 90° kuri inzira ya object ball."],
        ["30° rule", "Gukata 1/2 ball n'umupira urimo kuzunguruka: cue ball iva mu murongo ≈ 30°."],
        ["Kubika imbaraga", "Imbaraga zose (kinetic + rotational) <b>ntizigomba kwiyongera</b> nyuma ya cue strike."],
        ["Kubika impulse", "Mu guhura k'imipira ibiri, impulse yose ibikwa (kuri n)."],
        ["Nta tunneling", "Ku muvuduko wa 15 m/s, nta mupira unyura mu wundi cyangwa mu rukuta."],
        ["Determinism", "Shot imwe (seed imwe) ikorerwa inshuro 10,000: <b>hash y'ibisubizo igomba kuba imwe</b> buri gihe."],
        ["Break", "Break ya 9-ft ku 12 m/s: imipira ≥ 4 ikubita impande; ikwirakwira mu buryo busanzwe (reba amashusho ya pro)."],
        ["Bank shots", "Diamond system ikora mu nzira zigaragara (nko mu 'two-rail' na 'three-rail' bank)."],
    ], [4.2, 7.8])
    P("<b>Gereranya n'ukuri:</b> shaka amashusho ya <i>high-speed</i> y'abakinnyi, hanyuma usabe abakinnyi nyabo (aho muri club yawe) gukina prototype ukabaza ibyo babona nk'ibyiza n'ibibi. "
      "Bashobora kumenya itandukaniro rya 5% ry'umuvuduko w'ameza.")
    NOTE("<b>Ibikoresho byo kwigiraho:</b> <b>pooltool</b> (open-source, Python) ni simulator ya biyari yubatse ku mibare ya physics ya biyari ushobora kwigiraho no gugereranya n'iyawe. "
         "Dr. Dave Alciatore (Colorado State University) afite ibisobanuro n'amashusho menshi kuri physics ya pool. Reba igice cya 18.", "info")
