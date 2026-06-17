/* =====================================================================
   Nuclear Isotope Periodic Table — app.js
   Data: IAEA ENSDF · Medical DB: EANM/SNMMI/IAEA 2024
   ===================================================================== */

/* ─── COMPREHENSIVE MEDICAL ISOTOPE DATABASE ─────────────────────────
   Keys: "Z_A" or "Z_Am" for isomers
   type: diagnostic | therapy | theranostic
   status: established | development
   modality: PET | SPECT | Therapy | PET+Therapy | etc.
   ──────────────────────────────────────────────────────────────────── */
const MEDICAL_DB = {

/* ═══ PET DIAGNOSTICS ════════════════════════════════════════════════ */
"9_18":{type:"diagnostic",status:"established",modality:"PET",name:"F-18",
  apps:["¹⁸F-FDG PET — cancer, cardiac, brain (most used NM procedure worldwide, ~10M+/year)","¹⁸F-NaF PET — bone metastases","¹⁸F-PSMA-1007 (prostate) — EMA 2023","¹⁸F-fluciclovine (prostate recurrence) — FDA 2016","¹⁸F-florbetapir/florbetaben/flutemetamol — amyloid PET (Alzheimer's)","¹⁸F-FES — estrogen receptor imaging"],
  note:"Most widely used medical radionuclide. Cyclotron-produced ¹⁸O(p,n)¹⁸F."},

"11_11":{type:"diagnostic",status:"established",modality:"PET",name:"C-11",
  apps:["¹¹C-choline PET (prostate cancer recurrence)","¹¹C-methionine (brain tumors, glioma)","¹¹C-PiB — amyloid PET for Alzheimer's (research)","¹¹C-acetate (hepatocellular carcinoma)","¹¹C-raclopride (dopamine D2 receptor imaging)"],
  note:"T½=20.4 min. On-site cyclotron essential. Wide research use for receptor imaging."},

"6_11":{type:"diagnostic",status:"established",modality:"PET",name:"C-11",
  apps:["see ¹¹C — same isotope (Z=6, A=11)"],note:"Alias — see C-11."},

"7_13":{type:"diagnostic",status:"established",modality:"PET",name:"N-13",
  apps:["¹³N-ammonia cardiac PET (myocardial perfusion) — gold standard","Renal perfusion imaging (research)"],
  note:"T½=9.97 min. On-site cyclotron essential. Excellent cardiac imaging agent."},

"8_15":{type:"diagnostic",status:"established",modality:"PET",name:"O-15",
  apps:["¹⁵O-water PET (cerebral/myocardial blood flow) — gold standard","¹⁵O-CO₂ (blood volume)","¹⁵O-O₂ (cerebral metabolic rate of oxygen)"],
  note:"T½=2.04 min. On-site cyclotron essential. Reference standard for perfusion."},

"31_68":{type:"diagnostic",status:"established",modality:"PET",name:"Ga-68",
  apps:["⁶⁸Ga-DOTATATE/DOTATOC PET (neuroendocrine tumors) — FDA 2016/EMA approved","⁶⁸Ga-PSMA-11 (prostate cancer) — FDA 2020","⁶⁸Ga-FAPI (fibroblast activation protein) — cancer imaging","⁶⁸Ga-DOTA-bombesin (prostate, breast)","⁶⁸Ga-pentixafor (CXCR4 imaging in lymphoma/myeloma)","⁶⁸Ga-chloride (hepatocellular carcinoma)"],
  note:"T½=68 min. Generator-produced (⁶⁸Ge/⁶⁸Ga, t½=271d). Revolutionized neuroendocrine tumor imaging."},

"37_82":{type:"diagnostic",status:"established",modality:"PET",name:"Rb-82",
  apps:["⁸²Rb-chloride cardiac PET (myocardial perfusion) — FDA approved","Used as K⁺ analog for cardiac perfusion","High-volume cardiac centers: replaces ²⁰¹Tl SPECT"],
  note:"T½=75 s. Generator-produced (⁸²Sr/⁸²Rb, t½=25.3d). Approved generator use in USA/EU."},

"29_61":{type:"theranostic",status:"development",modality:"PET",name:"Cu-61",
  apps:["⁶¹Cu-DOTATATE PET for neuroendocrine tumors","⁶¹Cu-PSMA PET (prostate cancer)","⁶¹Cu-SAR-bisPSMA (phase I/II clinical trials, ANSTO)","PET imaging partner in copper theranostic triad: ⁶¹Cu(PET)↔⁶⁴Cu(PET+therapy)↔⁶⁷Cu(therapy)","Theranostic companion for ⁶⁷Cu-targeted therapy"],
  note:"T½=3.34h, β+ 61%, EC 39%. Ideal same-day PET imaging. Cyclotron: ⁶¹Ni(p,n)⁶¹Cu. Active trials: EANM, ANSTO (Australia), Peter MacCallum Cancer Centre."},

"29_64":{type:"theranostic",status:"development",modality:"PET+Therapy",name:"Cu-64",
  apps:["⁶⁴Cu-DOTATATE PET/CT (neuroendocrine tumors) — FDA 2020 (Detectnet)","⁶⁴Cu-PSMA PET (prostate cancer)","⁶⁴Cu-SAR-bisPSMA clinical trials","⁶⁴Cu-ATSM (hypoxia imaging)","Low-energy β⁻ → radiotoxicity in tumor cells at therapeutic doses"],
  note:"T½=12.7h. β+ 17.9%, EC 43%, β- 39%. Unique dual-mode: PET imaging AND targeted therapy. FDA-cleared as Detectnet 2020."},

"40_89":{type:"diagnostic",status:"development",modality:"PET",name:"Zr-89",
  apps:["⁸⁹Zr-trastuzumab (HER2+ breast cancer imaging) — multiple clinical trials","⁸⁹Zr-cetuximab, ⁸⁹Zr-bevacizumab (immuno-PET)","⁸⁹Zr-DFO-antibody platform (antibody drug development)","Pre-treatment biodistribution for ADC therapies","Long T½ perfectly matches IgG antibody pharmacokinetics (~5 days)"],
  note:"T½=78.4h. ImmunoPET pioneer. Multiple FDA IND approvals. Key tool for antibody-drug-conjugate development."},

"21_44":{type:"theranostic",status:"development",modality:"PET+Therapy",name:"Sc-44",
  apps:["⁴⁴Sc-DOTATOC PET (neuroendocrine tumors)","⁴⁴Sc-PSMA PET (prostate cancer)","Theranostic partner to ⁴⁷Sc therapy (scandium theranostic pair)","⁴⁴Sc-DOTA-folate PET (folate receptor imaging)"],
  note:"T½=3.97h, β+ 94.3%. Near-ideal PET emitter. T½ matches tumor uptake kinetics. Being developed as Ga-68 alternative. ISOLDE/CERN, PSI production."},

"53_124":{type:"diagnostic",status:"development",modality:"PET",name:"I-124",
  apps:["PET dosimetry for ¹³¹I radioiodine therapy (thyroid cancer)","⁴¹²⁴I-MIBG PET dosimetry","Pre-treatment imaging of iodide-avid tissues","Thyroid cancer PET/CT staging"],
  note:"T½=4.18d. Allows quantitative pre-treatment dosimetry before ¹³¹I therapy. Non-pure β+ (complex spectrum)."},

"39_86":{type:"diagnostic",status:"development",modality:"PET",name:"Y-86",
  apps:["⁸⁶Y-DOTATOC PET dosimetry for ⁹⁰Y-PRRT","Pre-treatment biodistribution for Y-90 therapies","⁸⁶Y-DOTA-antibody PET"],
  note:"T½=14.74h. β+ emitter for PET quantification before Y-90 therapy. Complex γ spectrum; limited availability."},

"31_66":{type:"diagnostic",status:"development",modality:"PET",name:"Ga-66",
  apps:["⁶⁶Ga-DOTATOC PET (neuroendocrine tumors) — longer imaging windows than ⁶⁸Ga","Research use for longer-T½ PET with Ga-labeled agents"],
  note:"T½=9.49h. Longer T½ allows delayed imaging. High positron energy (4.15 MeV) gives higher radiation dose."},

/* ═══ SPECT DIAGNOSTICS ═════════════════════════════════════════════ */
"43_99m":{type:"diagnostic",status:"established",modality:"SPECT",name:"Tc-99m",
  apps:["Bone scintigraphy (skeletal metastases, fractures)","Myocardial perfusion SPECT (MIBI, tetrofosmin)","Renal SPECT (GFR measurement, DMSA renal cortex)","Sentinel lymph node mapping (breast, melanoma)","Pulmonary ventilation/perfusion (PE diagnosis)","Thyroid imaging","Hepatobiliary scintigraphy (HIDA scan)","Brain perfusion/CSF studies","White blood cell labeling (infection/inflammation)",">40 million procedures/year worldwide"],
  note:"T½=6h, 140 keV γ (89%). Most widely used nuclear medicine agent. Generator-produced ⁹⁹Mo/⁹⁹ᵐTc. IDEAL imaging characteristics."},

"53_123":{type:"diagnostic",status:"established",modality:"SPECT",name:"I-123",
  apps:["¹²³I-NaI thyroid imaging (Graves', thyroid cancer)","¹²³I-MIBG SPECT (pheochromocytoma, neuroblastoma, NET)","¹²³I-ioflupane (DaTSCAN) — Parkinson's/dopamine transporter","¹²³I-hippuran (renal tubular function)"],
  note:"T½=13.2h, 159 keV γ (83%). Excellent SPECT characteristics. Cyclotron-produced."},

"81_201":{type:"diagnostic",status:"established",modality:"SPECT",name:"Tl-201",
  apps:["²⁰¹Tl chloride cardiac SPECT (myocardial perfusion) — being replaced by ⁹⁹ᵐTc","Parathyroid adenoma localization","Thyroid imaging","Tumor viability imaging"],
  note:"T½=73.1h. Historically important cardiac SPECT agent. Now largely replaced by ⁹⁹ᵐTc for myocardial perfusion."},

"31_67":{type:"diagnostic",status:"established",modality:"SPECT",name:"Ga-67",
  apps:["⁶⁷Ga-citrate SPECT (infection, lymphoma, sarcoidosis)","Fever of unknown origin","Lymphoma staging (being replaced by ¹⁸F-FDG PET)","Soft tissue infection and osteomyelitis"],
  note:"T½=78.3h, 93/185/300 keV γ lines. Historically important. Largely replaced by PET but still used for infections."},

"49_111":{type:"diagnostic",status:"established",modality:"SPECT",name:"In-111",
  apps:["¹¹¹In-pentetreotide (OctreoScan) — NET imaging (largely replaced by ⁶⁸Ga-DOTATATE PET)","¹¹¹In-labeled WBC (infection imaging)","¹¹¹In-capromab pendetide (ProstaScint) — prostate","¹¹¹In-DTPA antibody labeling platform","Radiolabeling of nanoparticles and liposomes for biodistribution"],
  note:"T½=67.3h, 171+245 keV γ. Workhorse SPECT label. OctreoScan largely replaced by ⁶⁸Ga-DOTATATE PET."},

"49_113m":{type:"diagnostic",status:"established",modality:"SPECT",name:"In-113m",
  apps:["¹¹³ᵐIn-DTPA renal imaging","¹¹³ᵐIn-transferrin (plasma volume)","Used in multidose generator systems for renal/liver imaging"],
  note:"T½=1.66h, 392 keV (IT). From ¹¹³Sn/¹¹³ᵐIn generator. Limited but established use."},

"36_81m":{type:"diagnostic",status:"established",modality:"SPECT",name:"Kr-81m",
  apps:["Pulmonary ventilation imaging (V/Q scanning for PE)","Lung ventilation scintigraphy","Regional ventilation studies in COPD"],
  note:"T½=13.1s, 190 keV (IT). Generator-produced. Ultra-short T½ allows continuous inhalation. Still used in specialized centers."},

"50_117m":{type:"therapy",status:"development",modality:"Therapy",name:"Sn-117m",
  apps:["⁴¹¹⁷ᵐSn(4+)-DTPA bone pain palliation (phase II/III trials)","Palliative therapy for bone metastases","Auger electron + conversion electron emitter for targeted bone therapy"],
  note:"T½=14d, 159 keV γ (87%, for imaging) + Auger/CE for therapy. Rare theranostic candidate where one isotope does both."},

"65_155":{type:"diagnostic",status:"development",modality:"SPECT",name:"Tb-155",
  apps:["SPECT imaging companion in terbium theranostic quadruplet","⁴¹⁵⁵Tb-DOTATATE SPECT (neuroendocrine tumors)","Theranostic partner: ¹⁴⁹Tb(α) + ¹⁵²Tb(PET) + ¹⁵⁵Tb(SPECT) + ¹⁶¹Tb(β⁻/Auger)"],
  note:"T½=5.32d, 86.5 + 105.3 keV γ (ideal SPECT). Part of the unique terbium theranostic quadruplet from CERN/ISOLDE."},

"82_203":{type:"diagnostic",status:"development",modality:"SPECT",name:"Pb-203",
  apps:["SPECT dosimetry companion to ²¹²Pb alpha therapy","Pre-treatment biodistribution for ²¹²Pb-DOTAMTATE (PRRT)","Pb-203/Pb-212 theranostic pair for neuroendocrine tumors"],
  note:"T½=51.9h, 279 keV γ. Non-radioactive Pb analog for pre-treatment imaging before Pb-212 alpha therapy."},

/* ═══ TARGETED ALPHA THERAPY ═════════════════════════════════════════ */
"88_223":{type:"therapy",status:"established",modality:"Alpha Therapy",name:"Ra-223",
  apps:["²²³Ra-dichloride (Xofigo) — bone metastases in castration-resistant prostate cancer","FDA/EMA approved 2013 — first approved targeted alpha therapy","Extends overall survival in mCRPC with bone mets","Osteomimetic: targets areas of high bone turnover","α-decay chain: 4 alpha particles + 2 beta particles"],
  note:"T½=11.4d. α emitter (5.7 MeV). Short-range (~100 µm) minimizes bone marrow toxicity. Landmark clinical success of TAT."},

"89_225":{type:"therapy",status:"development",modality:"Alpha Therapy",name:"Ac-225",
  apps:["²²⁵Ac-PSMA-617 (prostate cancer) — phase III TATCIST/ALPHA trials","²²⁵Ac-DOTATOC (neuroendocrine tumors)","²²⁵Ac-anti-CD33 (acute myeloid leukemia)","Daughters include ³ additional α emitters: Bi-213, Fr-221, At-217 (4-α cascade)"],
  note:"T½=9.92d. Generates cascade of 4 alpha particles per decay chain. Global supply shortage being addressed by ORNL, TRIUMF, ITG. Biggest current priority in targeted alpha therapy."},

"83_213":{type:"therapy",status:"development",modality:"Alpha Therapy",name:"Bi-213",
  apps:["²¹³Bi-DOTA-substance P (glioblastoma — intratumoral injection)","²¹³Bi-anti-CD33 (acute myeloid leukemia)","²¹³Bi-DOTAMTATE (neuroendocrine tumors)","Generator-produced from ²²⁵Ac"],
  note:"T½=45.6 min. α emitter (8.4 MeV). Generator-produced. Short T½ requires rapid administration post-labeling."},

"85_211":{type:"therapy",status:"development",modality:"Alpha Therapy",name:"At-211",
  apps:["²¹¹At-MABG (neuroblastoma) — phase I completed","²¹¹At-BC8 anti-CD45 (bone marrow conditioning for AML)","²¹¹At-astatinated antibodies (various cancers)","²¹¹At-NaAt thyroid ablation"],
  note:"T½=7.21h. α emitter (5.87/7.45 MeV). Cyclotron-produced (²⁰⁹Bi(α,2n)²¹¹At). Production complex; few global sites. Significant clinical development."},

"83_212":{type:"therapy",status:"development",modality:"Alpha Therapy",name:"Bi-212",
  apps:["²¹²Bi-DOTAMTATE (neuroendocrine tumors)","²¹²Bi-anti-HER2 (breast cancer)","Usually obtained from ²¹²Pb generator"],
  note:"T½=60.6 min. α + β emitter. Used via ²¹²Pb→²¹²Bi generator systems. Short T½ limits distribution."},

"82_212":{type:"therapy",status:"development",modality:"Alpha Therapy (in vivo generator)",name:"Pb-212",
  apps:["²¹²Pb-DOTAMTATE (PRRT for neuroendocrine tumors) — AlphaMedix, phase II/III","²¹²Pb-PSMA (prostate cancer) — clinical trials","In vivo α generator: decays to ²¹²Bi (α) → ²⁰⁸Tl","Lead-212/Lead-203 theranostic pair: ²⁰³Pb for imaging, ²¹²Pb for therapy"],
  note:"T½=10.64h. In vivo Pb-212/Bi-212 generator. Longer T½ than Bi-212 allows broader distribution. DOTAMTATE phase III recruiting."},

"90_227":{type:"therapy",status:"development",modality:"Alpha Therapy",name:"Th-227",
  apps:["²²⁷Th-PSMA (prostate cancer) — THOR-226 clinical trials (Bayer)","²²⁷Th-DOTATATE (neuroendocrine tumors)","²²⁷Th-anti-mesothelin antibody","²²⁷Th-anti-HER2 (breast/gastric cancer)"],
  note:"T½=18.7d. α emitter. Longer T½ matches antibody pharmacokinetics well. Strong clinical pipeline via Bayer (Algenpanheliox program). Daughter Ra-223 also therapeutic."},

/* ═══ TARGETED BETA THERAPY ═════════════════════════════════════════ */
"71_177":{type:"theranostic",status:"established",modality:"PRRT+SPECT",name:"Lu-177",
  apps:["¹⁷⁷Lu-DOTATATE (Lutathera) — neuroendocrine tumors, FDA/EMA approved 2017/2018","¹⁷⁷Lu-PSMA-617 (Pluvicto) — mCRPC, FDA/EMA approved 2022","¹⁷⁷Lu-DOTATOC (NET, multiple indications)","¹⁷⁷Lu-DOTA-trastuzumab (HER2+ breast cancer, trials)","¹⁷⁷Lu-DOTA-bombesin (prostate/breast, phase II)","¹⁷⁷Lu-AlbuMed (albumin-binding radioligand, trials)"],
  note:"T½=6.71d, β⁻ (0.5 MeV max) + γ (208/113 keV for SPECT imaging). Theranostic: therapy AND imaging in one agent. The dominant targeted radiotherapy agent in clinical use."},

"71_177m":{type:"therapy",status:"development",modality:"Therapy",name:"Lu-177m",
  apps:["Lu-177m-DOTATATE (neuroendocrine tumors — radiosurgery doses)","Research: higher-dose alternative when Lu-177g therapy is insufficient"],
  note:"T½=160.4d. Higher-energy β⁻ + multiple γ. Very long T½ allows protracted irradiation. Requires specialized radiation protection. Limited clinical use."},

"53_131":{type:"theranostic",status:"established",modality:"Therapy+Imaging",name:"I-131",
  apps:["¹³¹I-NaI — thyroid cancer ablation (post-thyroidectomy) — gold standard","¹³¹I-NaI — hyperthyroidism treatment (Graves', toxic nodule)","¹³¹I-MIBG (Azedra) — pheochromocytoma/paraganglioma, FDA 2018","¹³¹I-MIBG (Iobenguane I 131) — high-risk neuroblastoma, FDA 2023","¹³¹I-tositumomab (Bexxar) — lymphoma (withdrawn US but still EU)","¹³¹I-epratuzumab (lymphoma, trials)"],
  note:"T½=8.02d. β⁻ (0.61 MeV, 90%) + γ (364 keV, 81%). Theranostic: high γ allows post-treatment SPECT dosimetry. First radionuclide therapy ever used (1941)."},

"39_90":{type:"therapy",status:"established",modality:"Therapy",name:"Y-90",
  apps:["⁹⁰Y-DOTATOC (neuroendocrine tumors — PRRT)","⁹⁰Y-ibritumomab tiuxetan (Zevalin) — B-cell lymphoma, FDA 2002","⁹⁰Y-labeled microspheres (TheraSphere/SIR-Spheres) — hepatocellular carcinoma (SIRT/TARE)","⁹⁰Y-DOTA-biotin (pre-targeted RIT)","High-energy pure β⁻ emitter — no γ (requires ¹⁸F-FDG PET or ⁸⁶Y for imaging)"],
  note:"T½=64.1h, pure β⁻ (2.28 MeV max). No gamma — bremsstrahlung imaging possible. SIR-Spheres: 4M+ patients treated. Second only to ¹³¹I in total doses administered."},

"62_153":{type:"therapy",status:"established",modality:"Therapy",name:"Sm-153",
  apps:["¹⁵³Sm-EDTMP (Quadramet) — bone pain palliation in multiple metastases, FDA 1997","Prostate cancer, breast cancer, osteosarcoma bone mets","²⁰⁶ keV γ allows SPECT dosimetry"],
  note:"T½=46.3h. β⁻ + γ (103 keV). Bone-seeking; replaces ³²P for pain palliation with imaging capability."},

"75_186":{type:"therapy",status:"established",modality:"Therapy",name:"Re-186",
  apps:["¹⁸⁶Re-HEDP bone pain palliation","¹⁸⁶Re-lipiodol (hepatocellular carcinoma, locoregional)","137 keV γ allows SPECT imaging post-therapy"],
  note:"T½=3.72d. β⁻ + γ. Rhenium chemistry mimics technetium — easy labeling. Bone-seeking agent for pain palliation."},

"75_188":{type:"therapy",status:"development",modality:"Therapy",name:"Re-188",
  apps:["¹⁸⁸Re-HEDP bone pain palliation","¹⁸⁸Re-lipiodol (hepatocellular carcinoma)","¹⁸⁸Re-labeled antibodies and peptides","Generator-produced (¹⁸⁸W/¹⁸⁸Re, T½(W-188)=69.4d)"],
  note:"T½=17.0h. Higher-energy β⁻ than ¹⁸⁶Re. Generator availability attractive for developing countries (WHO program)."},

"32_77":{type:"therapy",status:"development",modality:"Auger+Beta Therapy",name:"Ge-77",
  apps:["Auger electron emitter for targeted cancer therapy research","Generator-produced from ⁷⁷As"],
  note:"T½=11.3h (⁷⁷As, the actual therapeutic agent from Ge-77 decay is As-77). Mild β⁻ for localized therapy."},

"33_77":{type:"therapy",status:"development",modality:"Therapy",name:"As-77",
  apps:["⁷⁷As-DOTA antibody therapy (pre-clinical/early clinical)","Partner to ⁷²As / ⁷²Se (theranostic pair)","β⁻ emitter suitable for peptide receptor radionuclide therapy"],
  note:"T½=38.8h. β⁻ (0.68 MeV max). Similar chemistry to P → phosphate mimicry possible."},

"21_47":{type:"therapy",status:"development",modality:"Therapy",name:"Sc-47",
  apps:["⁴⁷Sc-DOTATOC (neuroendocrine tumors) — theranostic pair with ⁴⁴Sc","⁴⁷Sc-PSMA therapy (prostate)","⁴⁷Sc-DOTA-folate (folate receptor+ tumors)","Scandium theranostic pair: ⁴⁴Sc(PET)↔⁴⁷Sc(therapy)"],
  note:"T½=3.35d, β⁻ (0.44 MeV) + γ (159 keV). Ideal SPECT imaging. Produced at Paul Scherrer Institute (PSI), ILL Grenoble."},

"65_161":{type:"therapy",status:"development",modality:"Beta+Auger Therapy",name:"Tb-161",
  apps:["¹⁶¹Tb-DOTATATE (neuroendocrine tumors) — phase I/II (Violet trial)","¹⁶¹Tb-PSMA (prostate cancer) — phase I","Auger electrons → short-range DNA damage complementing β⁻","Terbium theranostic quadruplet partner to ¹⁵⁵Tb (SPECT)"],
  note:"T½=6.89d. β⁻ + Auger electrons + γ. Auger electrons (4x more than Lu-177) may provide superiority for micrometastases. CERN/ISOLDE production. Serious Lu-177 competitor."},

"67_166":{type:"therapy",status:"development",modality:"Therapy",name:"Ho-166",
  apps:["¹⁶⁶Ho-DOTMP bone pain palliation","¹⁶⁶Ho-radioembolization (liver) — QuiremSpheres, CE Mark","¹⁶⁶Ho-PSMA (prostate cancer, phase I)","In vivo imaging possible via γ (81 keV) and MRI-visible"],
  note:"T½=26.8h. β⁻ (1.84 MeV) + γ (81 keV). Unique: MRI-visible holmium. Liver radioembolization CE-marked."},

"70_169":{type:"therapy",status:"established",modality:"Radiation Synovectomy",name:"Yb-169",
  apps:["Radiation synovectomy for knee joints (alongside Er-169, Y-90)"],
  note:"T½=32.0d. Used in radiation synovectomy for arthritis. Primarily European use."},

"68_169":{type:"therapy",status:"established",modality:"Radiation Synovectomy",name:"Er-169",
  apps:["Radiation synovectomy for small joints (fingers, wrists)","Rheumatoid arthritis — finger/toe joint treatment","Established alternative to surgery for synovitis"],
  note:"T½=9.39d. β⁻ emitter. Short range — ideal for small joint synovectomy. Widely used in Europe."},

"66_165":{type:"therapy",status:"established",modality:"Radiation Synovectomy",name:"Dy-165",
  apps:["Radiation synovectomy (medium joints: ankle, wrist, elbow)"],
  note:"T½=2.33h. Very short T½ allows same-day treatment and rapid radiation clearance."},

"91_32":{type:"therapy",status:"established",modality:"Therapy",name:"P-32",
  apps:["³²P-phosphate (polycythemia vera, essential thrombocythemia)","Intracavitary treatment (pleural/peritoneal effusions)","³²P-chromic phosphate colloidal (ovarian cancer intracavitary)","Radiation synovectomy (knee) — legacy use"],
  note:"T½=14.3d. Pure β⁻ (1.71 MeV). One of oldest radionuclide therapies. Bone marrow suppression limits use."},

"16_32":{type:"therapy",status:"established",modality:"Therapy",name:"P-32",
  apps:["³²P polycythemia vera and essential thrombocythemia","Colloidal chromic phosphate for intracavitary use"],
  note:"T½=14.3d. Pure β⁻ (1.71 MeV). First generation myelosuppressive radiotherapy."},

"16_89":{type:"therapy",status:"established",modality:"Therapy",name:"Sr-89",
  apps:["⁸⁹Sr-chloride (Metastron) — bone pain palliation in prostate/breast cancer mets","Osteomimetic agent: targets bone metastases selectively","FDA approved 1993"],
  note:"T½=50.5d. Pure β⁻ (1.49 MeV). Bone-seeking. Widely used for bone pain palliation before era of targeted therapy."},

"38_89":{type:"therapy",status:"established",modality:"Therapy",name:"Sr-89",
  apps:["⁸⁹Sr-chloride (Metastron) — bone pain palliation (prostate, breast)","FDA approved 1993; widely used worldwide","Selectively concentrates at bone metastases"],
  note:"T½=50.5d. Pure β⁻ (1.49 MeV max). Key bone-seeking therapeutic agent."},

"46_103":{type:"therapy",status:"established",modality:"Brachytherapy",name:"Pd-103",
  apps:["Pd-103 brachytherapy seeds — low-dose-rate (LDR) prostate cancer","Uveal melanoma brachytherapy","Used as alternative to I-125 seeds"],
  note:"T½=16.99d. Low-energy photons (21 keV avg). Short range ideal for LDR seed implant brachytherapy."},

"77_192":{type:"therapy",status:"established",modality:"Brachytherapy",name:"Ir-192",
  apps:["HDR brachytherapy (high-dose-rate) — prostate, cervix, breast, bronchus, esophagus","LDR wire/ribbon brachytherapy — widely used worldwide","Most common HDR brachytherapy source globally","Intravascular brachytherapy (coronary in-stent restenosis — largely obsolete)"],
  note:"T½=73.8d. β⁻ + γ (300–600 keV). Most widely used brachytherapy source. Afterloading systems (MicroSelectron, GammaMed)."},

"53_125":{type:"therapy",status:"established",modality:"Brachytherapy",name:"I-125",
  apps:["LDR brachytherapy seeds — prostate cancer (most common application)","Uveal melanoma (ocular plaque brachytherapy)","Brain tumors — gliasite balloon catheter","Lung/liver/pancreas tumor ablation seeds","Most commonly used permanent seed implant source"],
  note:"T½=59.4d. Very low energy γ (27.5 keV avg). Short range: dose falls off rapidly → spares surrounding tissue."},

"55_137":{type:"therapy",status:"established",modality:"Brachytherapy",name:"Cs-137",
  apps:["LDR brachytherapy (legacy) — now mainly gynecological","Tandem and ring applicators (cervical cancer)","Calibration source for dosimetry","Being phased out in favor of Ir-192 HDR"],
  note:"T½=30.2y. γ 662 keV. Long half-life; legacy brachytherapy source. Mostly replaced by Ir-192."},

"44_106":{type:"therapy",status:"established",modality:"Brachytherapy",name:"Ru-106",
  apps:["Ocular/ophthalmic plaque brachytherapy — uveal melanoma","Choroidal melanoma surface brachytherapy","Eye-sparing treatment for selected posterior uveal melanoma"],
  note:"T½=373.6d. β⁻ emitter (via Rh-106 daughter). Very short range in tissue. CE mark and widespread use in ophthalmic brachytherapy."},

/* ═══ TERBIUM THERANOSTIC QUADRUPLET ═══════════════════════════════ */
"65_149":{type:"therapy",status:"development",modality:"Alpha Therapy",name:"Tb-149",
  apps:["¹⁴⁹Tb-DOTATOC alpha therapy (neuroendocrine tumors)","Part of terbium theranostic quadruplet: ¹⁴⁹Tb(α)↔¹⁵²Tb(PET)↔¹⁵⁵Tb(SPECT)↔¹⁶¹Tb(β⁻/Auger)","Preclinical and early phase I — CERN/ISOLDE"],
  note:"T½=4.12h. α emitter (3.97 MeV) + some β+. Only currently available α emitter with similar chemistry to β⁻ partner ¹⁶¹Tb. Very limited production."},

"65_152":{type:"diagnostic",status:"development",modality:"PET",name:"Tb-152",
  apps:["PET imaging companion to ¹⁶¹Tb therapy","¹⁵²Tb-DOTATATE PET (neuroendocrine tumors)","Part of terbium theranostic quadruplet"],
  note:"T½=17.5h. β+ emitter (20%). PET imaging via ⁴⁴⁴ keV positrons. CERN/ISOLDE production. Unique: same chemistry as other Tb isotopes."},

/* ═══ SPECIAL/EMERGING ══════════════════════════════════════════════ */
"35_76":{type:"diagnostic",status:"development",modality:"PET",name:"Br-76",
  apps:["⁷⁶Br-labeled antibodies and peptides for PET imaging","Long T½ matches antibody pharmacokinetics","Theranostic partner to ⁷⁷Br (therapy)"],
  note:"T½=16.1h. β+ emitter. Used for antibody labeling where I-124 is unsuitable. Complex γ spectrum."},

"94_200":{type:"diagnostic",status:"development",modality:"PET",name:"Pu-200",
  apps:["Research PET tracer for actinide biodistribution studies"],
  note:"Very limited research use."},

"69_167":{type:"diagnostic",status:"development",modality:"SPECT",name:"Tm-167",
  apps:["¹⁶⁷Tm-DOTATATE SPECT (neuroendocrine tumors) — emerging","Theranostic pair consideration with ¹⁷⁰Tm"],
  note:"T½=9.25d. Multiple γ lines. Proposed as SPECT complement in Tm theranostic pair."},

"69_170":{type:"therapy",status:"development",modality:"Therapy",name:"Tm-170",
  apps:["¹⁷⁰Tm-DOTATATE targeted therapy","Thulium theranostic pair with ¹⁶⁷Tm-imaging"],
  note:"T½=128.6d. β⁻ (0.97 MeV max). Long T½ for extended irradiation. Reactor-produced."},

"42_99":{type:"diagnostic",status:"established",modality:"Generator",name:"Mo-99",
  apps:["Mo-99 is the PARENT of Tc-99m — the most important medical radionuclide generator","⁹⁹Mo/⁹⁹ᵐTc generator system powers >40M imaging procedures/year","Critical supply chain vulnerability — global shortage crisis 2009-2010 prompted OECD NMI","Production: nuclear reactors (ILL, HFR, BR2, Safari-1)"],
  note:"T½=65.9h. β⁻ → ⁹⁹ᵐTc. The most critical radionuclide in nuclear medicine — not used directly but as Tc-99m generator parent."},

"32_68":{type:"diagnostic",status:"established",modality:"Generator",name:"Ge-68",
  apps:["⁶⁸Ge/⁶⁸Ga generator — produces ⁶⁸Ga PET agent on-site","Generator T½=270.9d allows 1-year+ use","Alternative to cyclotron for ⁶⁸Ga production","Key infrastructure for ⁶⁸Ga-DOTATATE and PSMA-11 PET"],
  note:"T½=270.9d. Not used directly — ⁶⁸Ge generator parent for ⁶⁸Ga. Allows PET without on-site cyclotron."},

"56_133":{type:"diagnostic",status:"established",modality:"SPECT",name:"Ba-133",
  apps:["Used as calibration/QA source for nuclear medicine imaging equipment","Not a therapeutic agent — detector calibration"],
  note:"T½=10.5y. γ lines used for camera calibration. Not clinical therapeutic use."},

"27_58":{type:"diagnostic",status:"development",modality:"PET",name:"Co-58",
  apps:["Research tracer for cobalt biochemistry","Vitamin B12 absorption studies (Schilling test — historic)"],
  note:"T½=70.9d. Historically used for B12 absorption testing. Largely replaced by non-radioactive assays."},

/* ═══ ADDITIONAL MEDICAL ISOTOPES FROM LITERATURE SEARCH ═══════════ */
"29_67":{type:"therapy",status:"development",modality:"Beta Therapy",name:"Cu-67",
  apps:["⁶⁷Cu-SAR-bisPSMA (prostate) — clinical trials (ANSTO, Australia)","⁶⁷Cu-DOTATATE (neuroendocrine tumors) — theranostic with ⁶¹Cu/⁶⁴Cu","⁶⁷Cu-trastuzumab (HER2+ breast cancer, trials)","⁶⁷Cu-J591 anti-PSMA antibody","Copper theranostic triad: ⁶¹Cu(PET day0)↔⁶⁴Cu(PET+dose)↔⁶⁷Cu(therapy)"],
  note:"T½=61.8h. β⁻ (0.57 MeV max) + γ (185/93 keV). SPECT imaging possible. Ideal paired with ⁶¹Cu/⁶⁴Cu PET. Cyclotron or reactor produced."},

"79_198":{type:"therapy",status:"development",modality:"Brachytherapy+Beta",name:"Au-198",
  apps:["¹⁹⁸Au colloidal gold — intracavitary and interstitial brachytherapy","¹⁹⁸Au nanoshell-based photothermal + radiation therapy (research)","Liver tumor treatment (historical interstitial)","Prostate brachytherapy seeds (research)"],
  note:"T½=2.69d. β⁻ + γ (412 keV). Gamma enables post-treatment imaging. Research in nanoparticle-based delivery."},

"14_32":{type:"therapy",status:"established",modality:"Therapy",name:"P-32",
  apps:["see Phosphorus-32 — Z=15"],note:"Redirect — see Z=15."},

"15_32":{type:"therapy",status:"established",modality:"Therapy",name:"P-32",
  apps:["Polycythemia vera treatment (oral administration)","Essential thrombocythemia","Palliative bone marrow suppression","³²P-chromic phosphate peritoneal/pleural instillation"],
  note:"T½=14.3d. Pure β⁻ (1.71 MeV). One of the original radionuclide therapy agents, used since 1940s."},

"63_152":{type:"therapy",status:"development",modality:"Auger Therapy",name:"Eu-152",
  apps:["Research Auger electron emitter for targeted therapy","Low-energy Auger electrons for DNA double-strand break induction"],
  note:"T½=13.5y. Auger emitter research. Limited clinical work."},

"50_113":{type:"diagnostic",status:"established",modality:"SPECT",name:"Sn-113",
  apps:["¹¹³Sn/¹¹³ᵐIn generator — produces In-113m for SPECT","Generator parent — not used directly"],
  note:"T½=115d. Generator parent for In-113m. Historically important generator system."},

"47_111":{type:"therapy",status:"development",modality:"Beta Therapy",name:"Ag-111",
  apps:["¹¹¹Ag-DOTATATE (neuroendocrine tumors) — early phase clinical trials","Targeted radiotherapy for solid tumors via peptide conjugates","Theranostic candidate paired with ¹⁰⁹Cd/¹¹¹ᵐAg SPECT imaging","Phase I research at multiple European centers"],
  note:"T½=7.45d, β⁻ (1.04 MeV max) + γ (342 keV for SPECT). Emerging SPECT-theranostic. Similar chemistry to Lu-177 but with silver chelation."},

"24_51":{type:"diagnostic",status:"established",modality:"SPECT/Renal",name:"Cr-51",
  apps:["⁵¹Cr-EDTA — gold standard for GFR (glomerular filtration rate) measurement","⁵¹Cr-labeled red blood cells (RBC volume and survival studies)","Established renal function test in nephrology","Protein-losing enteropathy diagnosis (⁵¹Cr-albumin)"],
  note:"T½=27.7d, γ 320 keV. Isotope dilution technique gives most accurate GFR. Key in nephrology and transplant medicine. Now partially replaced by non-radioactive methods."},

"34_75":{type:"diagnostic",status:"established",modality:"SPECT/GI",name:"Se-75",
  apps:["⁷⁵Se-SeHCAT (selenium homocholic acid taurine) — bile acid malabsorption diagnosis","Widely used in UK and Europe for chronic diarrhea diagnosis","⁷⁵Se-selenomethionine — historical pancreas and parathyroid imaging","⁷⁵Se-selenocholesterol — adrenal cortex imaging (legacy)"],
  note:"T½=119.8d, γ 136+265+401 keV. SeHCAT test: patient swallows capsule, retention measured at 3h and 7 days by whole-body SPECT. Standard test for bile acid malabsorption in many European countries."},

"60_147":{type:"therapy",status:"established",modality:"Brachytherapy",name:"Pm-147",
  apps:["¹⁴⁷Pm ophthalmic brachytherapy plaques — pterygium treatment","Radioactive eye applicators for ocular surface therapy","Pure β⁻ emitter: short tissue range ideal for surface application"],
  note:"T½=2.62y, pure β⁻ (0.22 MeV). Very low energy — ideal for superficial ophthalmic therapy with minimal deep tissue dose. Established use in Europe for pterygium."},

"77_194":{type:"therapy",status:"development",modality:"Brachytherapy",name:"Ir-194",
  apps:["¹⁹⁴Ir (HDR wires) — high-dose-rate brachytherapy research","Higher photon energy alternative to Ir-192 for deeper tumors","Research programs; not in widespread clinical use"],
  note:"T½=19.3h, β⁻ + γ (328 keV). Short T½ limits distribution. Research interest as higher-energy alternative to Ir-192 brachytherapy."},

};

/* ─── ELEMENT CATEGORIES ─────────────────────────────────────────── */
const CAT = {
  1:'alkali',2:'alkali-earth',
  3:'alkali',4:'alkali-earth',5:'metalloid',6:'nonmetal',7:'nonmetal',8:'nonmetal',9:'halogen',10:'noble',
  11:'alkali',12:'alkali-earth',13:'posttrans',14:'metalloid',15:'nonmetal',16:'nonmetal',17:'halogen',18:'noble',
  19:'alkali',20:'alkali-earth',31:'posttrans',32:'metalloid',33:'metalloid',34:'nonmetal',35:'halogen',36:'noble',
  37:'alkali',38:'alkali-earth',49:'posttrans',50:'posttrans',51:'metalloid',52:'metalloid',53:'halogen',54:'noble',
  55:'alkali',56:'alkali-earth',81:'posttrans',82:'posttrans',83:'posttrans',84:'posttrans',85:'halogen',86:'noble',
  87:'alkali',88:'alkali-earth',113:'posttrans',114:'posttrans',115:'posttrans',116:'posttrans',117:'halogen',118:'noble',
};
function getCat(Z) {
  if (CAT[Z]) return CAT[Z];
  if ((Z>=21&&Z<=30)||(Z>=39&&Z<=48)||(Z>=72&&Z<=80)||(Z>=104&&Z<=112)) return 'transition';
  if ((Z>=57&&Z<=71)) return 'lanthanide';
  if ((Z>=89&&Z<=103)) return 'actinide';
  return 'transition';
}

/* ─── ELEMENT GRID LAYOUT ───────────────────────────────────────── */
const PT_LAYOUT = [];
// Period 1: H, [gap 16], He
PT_LAYOUT.push({Z:1,row:1,col:1},{Z:2,row:1,col:18});
// Period 2-3
for(let z=3;z<=10;z++) PT_LAYOUT.push({Z:z,row:2,col:z===3?1:z===4?2:z+8});
for(let z=11;z<=18;z++) PT_LAYOUT.push({Z:z,row:3,col:z===11?1:z===12?2:z+2});
// Period 4-5 (full with d-block)
for(let z=19;z<=36;z++) PT_LAYOUT.push({Z:z,row:4,col:z<=20?z-18:z-18});
for(let z=37;z<=54;z++) PT_LAYOUT.push({Z:z,row:5,col:z<=38?z-36:z-36});
// Period 6 (main group + d, La placeholder)
for(let z=55;z<=57;z++) PT_LAYOUT.push({Z:z,row:6,col:z-54});
for(let z=72;z<=86;z++) PT_LAYOUT.push({Z:z,row:6,col:z-68});
// Period 7 (main group + d, Ac placeholder)
for(let z=87;z<=89;z++) PT_LAYOUT.push({Z:z,row:7,col:z-86});
for(let z=104;z<=118;z++) PT_LAYOUT.push({Z:z,row:7,col:z-100});
// Lanthanides row 9
for(let z=57;z<=71;z++) PT_LAYOUT.push({Z:z,row:9,col:z-54});
// Actinides row 10
for(let z=89;z<=103;z++) PT_LAYOUT.push({Z:z,row:10,col:z-86});

/* ─── DECAY MODE HELPERS ─────────────────────────────────────────── */
const DM_COLORS = {
  'A':'#f85149','ALPHA':'#f85149',
  'B-':'#3fb950','BM':'#3fb950',
  'B+':'#d2a8ff','BP':'#d2a8ff','EC':'#d2a8ff','EC+B+':'#d2a8ff','B+EC':'#d2a8ff',
  'IT':'#ffa657',
  'SF':'#ff7b72',
  'P':'#79c0ff',
  'N':'#56d364',
  'B-N':'#56d364','B-2N':'#56d364',
  'ECP':'#d2a8ff','ECA':'#f85149',
};
function getDmColor(mode) {
  if (!mode) return '#8b949e';
  const m = mode.toUpperCase().replace(/\s/g,'');
  if (DM_COLORS[m]) return DM_COLORS[m];
  if (m.startsWith('B-')) return '#3fb950';
  if (m.startsWith('B+') || m.includes('EC')) return '#d2a8ff';
  if (m.includes('A') || m.includes('ALPHA')) return '#f85149';
  if (m === 'IT') return '#ffa657';
  if (m === 'SF') return '#ff7b72';
  return '#8b949e';
}
function getChipClass(decayModes) {
  if (!decayModes || !decayModes.length) return '';
  const m = decayModes[0].mode.toUpperCase();
  if (m.includes('A') && !m.includes('B')) return 'chip-alpha';
  if (m.startsWith('B-')) return 'chip-betam';
  if (m.startsWith('B+') || m.includes('EC')) return 'chip-betap';
  if (m === 'IT') return 'chip-it';
  if (m === 'SF') return 'chip-sf';
  if (m === 'P') return 'chip-p';
  if (m.includes('N')) return 'chip-n';
  return '';
}

/* ─── COPY HELPER ────────────────────────────────────────────────── */
function copyVal(val, btn) {
  navigator.clipboard.writeText(String(val)).then(()=>{
    const orig = btn.textContent;
    btn.textContent = '✓'; btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
  });
}

/* ─── FORMAT HELPERS ─────────────────────────────────────────────── */
function fmtSci(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (n >= 1e15) return (n/1e15).toPrecision(4) + ' PBq/g';
  if (n >= 1e12) return (n/1e12).toPrecision(4) + ' TBq/g';
  if (n >= 1e9)  return (n/1e9).toPrecision(4)  + ' GBq/g';
  if (n >= 1e6)  return (n/1e6).toPrecision(4)  + ' MBq/g';
  if (n >= 1e3)  return (n/1e3).toPrecision(4)  + ' kBq/g';
  return n.toPrecision(4) + ' Bq/g';
}
function fmtCi(bq) {
  if (bq === null || bq === undefined || isNaN(bq)) return '—';
  const ci = bq / 3.7e10;
  if (ci >= 1e9) return (ci/1e9).toPrecision(4) + ' GCi/g';
  if (ci >= 1e6) return (ci/1e6).toPrecision(4) + ' MCi/g';
  if (ci >= 1e3) return (ci/1e3).toPrecision(4) + ' kCi/g';
  if (ci >= 1)   return ci.toPrecision(4) + ' Ci/g';
  if (ci >= 1e-3) return (ci*1e3).toPrecision(4) + ' mCi/g';
  return ci.toPrecision(4) + ' Ci/g';
}
function fmtHlSec(sec) {
  if (!sec) return null;
  const s = parseFloat(sec);
  if (isNaN(s)) return null;
  return s.toPrecision(6);
}

/* ─── MAIN APP STATE ─────────────────────────────────────────────── */
let DATA = null;
let selectedZ = null;
let selectedIso = null;

/* ─── CHECK MEDICAL STATUS ───────────────────────────────────────── */
function getMedInfo(Z, A, isomer) {
  const key = `${Z}_${A}${isomer ? 'm' : ''}`;
  return MEDICAL_DB[key] || null;
}
function getElementMedStatus(el) {
  let hasDiag=false, hasTher=false, hasThera=false;
  for (const iso of el.isotopes) {
    const med = getMedInfo(iso.Z, iso.A, iso.isomer);
    if (!med) continue;
    if (med.type === 'diagnostic') hasDiag = true;
    else if (med.type === 'therapy') hasTher = true;
    else if (med.type === 'theranostic') hasThera = true;
  }
  if (hasDiag && hasTher) return 'med-mixed';
  if (hasThera) return 'med-thera';
  if (hasDiag) return 'med-diag';
  if (hasTher) return 'med-ther';
  return null;
}

/* ─── BUILD PERIODIC TABLE GRID ─────────────────────────────────── */
function buildGrid() {
  const grid = document.getElementById('pt-grid');
  grid.innerHTML = '';

  // Max row/col from layout
  const maxRow = 10, maxCol = 18;
  const cells = {};
  PT_LAYOUT.forEach(({Z, row, col}) => { cells[`${row}_${col}`] = Z; });

  for (let row = 1; row <= maxRow; row++) {
    if (row === 8) {
      // spacer row between main table and lanthanide/actinide rows
      const sep = document.createElement('div');
      sep.className = 'pt-sep'; sep.style.gridColumn = '1/-1';
      grid.appendChild(sep);
    }
    if (row === 9) {
      // Lanthanide label
      const lbl = document.createElement('div');
      lbl.style.cssText = 'grid-column:1/3;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:var(--text3);';
      lbl.textContent = 'Ln'; grid.appendChild(lbl);
    }
    if (row === 10) {
      const lbl = document.createElement('div');
      lbl.style.cssText = 'grid-column:1/3;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:var(--text3);';
      lbl.textContent = 'An'; grid.appendChild(lbl);
    }
    for (let col = (row >= 9 ? 3 : 1); col <= maxCol; col++) {
      const Z = cells[`${row}_${col}`];
      const cell = document.createElement('div');
      if (!Z || !DATA[Z]) {
        cell.className = 'pt-gap';
        cell.style.cssText = 'background:transparent;border:none;';
      } else {
        const el = DATA[Z];
        const cat = getCat(Z);
        const medStatus = getElementMedStatus(el);
        cell.className = `el-cell cat-${cat}${medStatus ? ' ' + medStatus : ''}`;
        cell.dataset.z = Z;

        const zDiv = document.createElement('div'); zDiv.className = 'z'; zDiv.textContent = Z;
        const symDiv = document.createElement('div'); symDiv.className = 'sym'; symDiv.textContent = el.symbol;
        const wtDiv = document.createElement('div'); wtDiv.className = 'wt';
        // Find most abundant isotope mass or most stable
        const stable = el.isotopes.filter(i => i.half_life === 'STABLE');
        wtDiv.textContent = stable.length ? '' : ''; // just leave as category color

        cell.appendChild(zDiv);
        cell.appendChild(symDiv);

        // Medical dot
        if (medStatus) {
          const dot = document.createElement('div'); dot.className = 'med-dot';
          const c = medStatus === 'med-diag' ? 'var(--med-diag)' : medStatus === 'med-ther' ? 'var(--med-ther)' : medStatus === 'med-thera' ? 'var(--med-thera)' : 'var(--dec-it)';
          dot.style.background = c;
          cell.appendChild(dot);
        }

        cell.addEventListener('click', () => selectElement(Z));
      }
      grid.appendChild(cell);
    }
  }
}

/* ─── DECAY MODE COLOR BAR LEGEND ───────────────────────────────── */
function buildDecayLegend(isotopes) {
  const modes = new Set();
  for (const iso of isotopes) {
    for (const dm of iso.decay_modes || []) {
      const m = dm.mode.toUpperCase();
      if (m.startsWith('B-')) modes.add('B-');
      else if (m.includes('EC+B+') || m.includes('B+') || m.includes('EC')) modes.add('EC/β+');
      else if (m.startsWith('A') || m === 'ALPHA') modes.add('α');
      else if (m === 'IT') modes.add('IT');
      else if (m === 'SF') modes.add('SF');
      else if (m === 'P') modes.add('p');
      else if (m.includes('N')) modes.add('β⁻n');
    }
  }
  const stableCount = isotopes.filter(i => i.half_life === 'STABLE').length;
  if (stableCount > 0) modes.add('Stable');

  const legend = document.getElementById('decay-legend');
  legend.innerHTML = '<span class="leg-title">Decay modes present:</span>';

  const MODE_INFO = {
    'Stable': {color:'#8b949e', label:'Stable'},
    'β⁻':    {color:'#3fb950', label:'β⁻ (beta minus)'},
    'B-':     {color:'#3fb950', label:'β⁻ (beta minus)'},
    'EC/β+':  {color:'#d2a8ff', label:'EC/β⁺ (electron capture / beta plus)'},
    'α':      {color:'#f85149', label:'α (alpha)'},
    'IT':     {color:'#ffa657', label:'IT (isomeric transition)'},
    'SF':     {color:'#ff7b72', label:'SF (spontaneous fission)'},
    'p':      {color:'#79c0ff', label:'p (proton emission)'},
    'β⁻n':   {color:'#56d364', label:'β⁻n (beta-n)'},
  };

  const ORDER = ['Stable','B-','EC/β+','α','IT','SF','p','β⁻n'];
  ORDER.forEach(key => {
    if (!modes.has(key)) return;
    const info = MODE_INFO[key] || {color:'#8b949e', label: key};
    const item = document.createElement('div'); item.className = 'leg-item';
    item.innerHTML = `<div class="leg-swatch" style="background:${info.color}"></div><span class="leg-label">${info.label}</span>`;
    legend.appendChild(item);
  });

  // Also add medical legend
  const medTypes = new Set();
  // check for medical isotopes in this element
  if (selectedZ && DATA[selectedZ]) {
    for (const iso of DATA[selectedZ].isotopes) {
      const med = getMedInfo(iso.Z, iso.A, iso.isomer);
      if (med) medTypes.add(med.type);
    }
  }
  if (medTypes.size > 0) {
    const sep = document.createElement('span');
    sep.style.cssText = 'border-left:1px solid var(--border);margin:0 4px;height:14px;display:inline-block;';
    legend.appendChild(sep);
    const medLabel = document.createElement('span');
    medLabel.style.cssText = 'color:var(--text2);font-weight:600;';
    medLabel.textContent = 'Medical:';
    legend.appendChild(medLabel);
    if (medTypes.has('diagnostic')) {
      const item = document.createElement('div'); item.className = 'leg-item';
      item.innerHTML = `<div class="leg-swatch" style="background:var(--med-diag)"></div><span class="leg-label">◎ Diagnostic</span>`;
      legend.appendChild(item);
    }
    if (medTypes.has('therapy')) {
      const item = document.createElement('div'); item.className = 'leg-item';
      item.innerHTML = `<div class="leg-swatch" style="background:var(--med-ther)"></div><span class="leg-label">⚡ Therapy</span>`;
      legend.appendChild(item);
    }
    if (medTypes.has('theranostic')) {
      const item = document.createElement('div'); item.className = 'leg-item';
      item.innerHTML = `<div class="leg-swatch" style="background:var(--med-thera)"></div><span class="leg-label">☯ Theranostic</span>`;
      legend.appendChild(item);
    }
  }
}

/* ─── SELECT ELEMENT ─────────────────────────────────────────────── */
function selectElement(Z) {
  selectedZ = Z;
  selectedIso = null;
  const el = DATA[Z];
  if (!el) return;

  // Update grid selection
  document.querySelectorAll('.el-cell').forEach(c => c.classList.remove('selected'));
  const cell = document.querySelector(`.el-cell[data-z="${Z}"]`);
  if (cell) cell.classList.add('selected');

  // Show strip section
  const stripWrap = document.getElementById('strip-wrap');
  stripWrap.style.display = 'block';

  // Header
  document.getElementById('strip-el-name').textContent = `${el.name} (${el.symbol})`;
  const stable = el.isotopes.filter(i => i.half_life === 'STABLE').length;
  const total = el.isotopes.length;
  document.getElementById('strip-el-info').textContent = `Z=${Z} · ${total} isotopes · ${stable} stable`;

  // Build decay legend
  buildDecayLegend(el.isotopes);

  // Build isotope chips
  const strip = document.getElementById('iso-strip');
  strip.innerHTML = '';
  for (const iso of el.isotopes) {
    const chip = document.createElement('div');
    const isStable = iso.half_life === 'STABLE';
    const chipClass = isStable ? '' : getChipClass(iso.decay_modes);
    const med = getMedInfo(iso.Z, iso.A, iso.isomer);
    const medClass = med ? (med.type === 'diagnostic' ? 'med-diag' : med.type === 'therapy' ? 'med-ther' : 'med-thera') : '';
    chip.className = `iso-chip ${chipClass} ${medClass}`.trim();
    chip.dataset.a = iso.A;
    chip.dataset.isomer = iso.isomer ? '1' : '0';

    const massLabel = iso.A + (iso.isomer ? `<sup>m</sup>` : '');
    let hlText = '';
    if (isStable) hlText = '♦ stable';
    else if (iso.half_life_fmt && iso.half_life_fmt !== 'STABLE') hlText = iso.half_life_fmt;
    else if (iso.half_life) hlText = iso.half_life + (iso.half_life_unit ? ' ' + iso.half_life_unit : '');

    let lbl = '';
    if (isStable) {
      lbl = `<div class="ic-lbl ic-stable">STABLE</div>`;
    } else {
      const modeStr = iso.decay_modes.length ? iso.decay_modes.map(d => d.mode).join('+').substring(0,8) : '?';
      lbl = `<div class="ic-lbl ic-rad">${modeStr}</div>`;
    }

    let medBadge = '';
    if (med) {
      const sym = med.type === 'diagnostic' ? '◎' : med.type === 'therapy' ? '⚡' : '☯';
      const estab = med.status === 'established' ? '✓' : '…';
      medBadge = `<div class="med-badge">${sym}${estab}</div>`;
    }

    chip.innerHTML = `${medBadge}<div class="ic-mass">${massLabel}</div><div class="ic-hl">${hlText}</div>${lbl}`;
    chip.addEventListener('click', () => selectIsotope(Z, iso.A, iso.isomer));
    strip.appendChild(chip);
  }

  // Reset detail
  document.getElementById('detail').innerHTML = '<div class="detail-empty">← Click an isotope chip above to view full data</div>';
}

/* ─── SELECT ISOTOPE ─────────────────────────────────────────────── */
function selectIsotope(Z, A, isomer) {
  selectedIso = {Z, A, isomer};
  const el = DATA[Z];
  const iso = el.isotopes.find(i => i.A === A && !!i.isomer === !!isomer);
  if (!iso) return;

  // Update chip selection
  document.querySelectorAll('.iso-chip').forEach(c => c.classList.remove('selected'));
  const chips = document.querySelectorAll('.iso-chip');
  chips.forEach(c => {
    if (parseInt(c.dataset.a) === A && (c.dataset.isomer === '1') === !!isomer) c.classList.add('selected');
  });

  const isStable = iso.half_life === 'STABLE';
  const med = getMedInfo(Z, A, isomer);
  const isoLabel = `${iso.symbol}-${A}${isomer ? 'm' : ''}`;

  let html = '';

  // ── Medical banner (if applicable)
  if (med) {
    const typeClass = med.type;
    const typeSym = med.type === 'diagnostic' ? '◎' : med.type === 'therapy' ? '⚡' : '☯';
    const typeLabel = med.type.charAt(0).toUpperCase() + med.type.slice(1);
    const statusTag = med.status === 'established'
      ? '<span class="med-type-tag tag-estab">✓ Established</span>'
      : '<span class="med-type-tag tag-dev">⚗ In Development</span>';
    const typeTag = med.type === 'diagnostic'
      ? '<span class="med-type-tag tag-diag">◎ Diagnostic</span>'
      : med.type === 'therapy' ? '<span class="med-type-tag tag-ther">⚡ Therapy</span>'
      : '<span class="med-type-tag tag-thera">☯ Theranostic</span>';
    const modalityBadge = med.modality ? `<span style="font-size:0.65rem;color:var(--text2);background:var(--bg4);border:1px solid var(--border);padding:2px 6px;border-radius:4px;">${med.modality}</span>` : '';
    const appsHtml = (med.apps || []).map(a => `<li>${a}</li>`).join('');
    const noteHtml = med.note ? `<div class="med-note">ℹ️ ${med.note}</div>` : '';
    html += `<div class="med-banner ${typeClass}">
      <h4>${typeSym} ${isoLabel} — Medical Radionuclide ${typeTag} ${statusTag} ${modalityBadge}</h4>
      <ul class="med-apps">${appsHtml}</ul>
      ${noteHtml}
    </div>`;
  }

  // ── Identity card
  html += `<div class="dc">
    <h3>🔬 Identity — ${isoLabel}</h3>
    <div class="dc-row"><span class="dc-label">Symbol</span><span class="dc-val">${iso.symbol}-${A}${isomer?'<sup>m</sup>':''}</span></div>
    <div class="dc-row"><span class="dc-label">Protons (Z)</span><span class="dc-val">${iso.Z}</span></div>
    <div class="dc-row"><span class="dc-label">Neutrons (N)</span><span class="dc-val">${iso.N}</span></div>
    <div class="dc-row"><span class="dc-label">Mass number (A)</span><span class="dc-val">${A}</span></div>
    ${iso.jp ? `<div class="dc-row"><span class="dc-label">Spin / Parity</span><span class="dc-val">${iso.jp}</span></div>` : ''}
    ${iso.abundance ? `<div class="dc-row"><span class="dc-label">Natural abundance</span><span class="dc-val">${iso.abundance}%</span></div>` : ''}
    ${iso.atomic_mass ? `<div class="dc-row"><span class="dc-label">Atomic mass</span><span class="dc-val">${iso.atomic_mass} u <button class="copy-btn" onclick="copyVal('${iso.atomic_mass}', this)">📋</button></span></div>` : ''}
    <div class="dc-row"><span class="dc-label">Status</span><span class="dc-val">${isStable ? '🟢 <b style="color:var(--dec-stable)">STABLE</b>' : '🔴 Radioactive'}</span></div>
  </div>`;

  // ── Radioactive properties
  if (!isStable) {
    let hlFmt = iso.half_life_fmt || (iso.half_life + (iso.half_life_unit ? ' ' + iso.half_life_unit : ''));
    let hlSec = fmtHlSec(iso.half_life_sec);
    const sa_bq = iso.specific_activity_Bq_g;
    const sa_bq_raw = sa_bq ? sa_bq.toExponential(4) : null;
    const sa_bq_fmt = fmtSci(sa_bq);
    const sa_ci_fmt = fmtCi(sa_bq);

    html += `<div class="dc">
      <h3>⏱ Radioactive Properties</h3>
      <div class="dc-row"><span class="dc-label">Half-life (T½)</span>
        <span class="dc-val">${hlFmt}
          <button class="copy-btn" onclick="copyVal('${hlFmt}', this)">📋</button>
        </span>
      </div>`;
    if (hlSec) {
      html += `<div class="dc-row"><span class="dc-label">Half-life (seconds)</span>
        <span class="dc-val">${hlSec} s
          <button class="copy-btn" onclick="copyVal('${hlSec}', this)">📋</button>
        </span>
      </div>`;
    }
    if (sa_bq !== null && sa_bq !== undefined) {
      html += `<div class="dc-row"><span class="dc-label">Specific activity</span>
        <span class="dc-val">${sa_bq_fmt}
          <button class="copy-btn" onclick="copyVal('${sa_bq_raw}', this)">📋</button>
        </span>
      </div>
      <div class="dc-row"><span class="dc-label">Specific activity (Ci)</span>
        <span class="dc-val">${sa_ci_fmt}
          <button class="copy-btn" onclick="copyVal('${(sa_bq/3.7e10).toExponential(4)}', this)">📋</button>
        </span>
      </div>`;
    }
    html += `</div>`;

    // ── Decay modes
    if (iso.decay_modes && iso.decay_modes.length) {
      html += `<div class="dc"><h3>⚡ Decay Modes</h3>`;
      for (const dm of iso.decay_modes) {
        const color = getDmColor(dm.mode);
        const pct = dm.pct ? parseFloat(dm.pct) : null;
        const barWidth = pct ? Math.max(2, pct) : 50;
        const pctLabel = pct ? pct.toFixed(1) + '%' : 'n/a';
        html += `<div class="dm-row">
          <span class="dm-badge" style="color:${color};border-color:${color}40;">${dm.mode}</span>
          <div class="dm-bar-wrap"><div class="dm-bar" style="width:${barWidth}%;background:${color}80;"></div></div>
          <span class="dm-pct">${pctLabel}</span>
        </div>`;
      }
      html += `</div>`;
    }

    // ── Q-values
    if (iso.q_vals && Object.keys(iso.q_vals).length) {
      const qLabels = {qbm:'Q(β⁻)',qbm_n:'Q(β⁻n)',qa:'Q(α)',qec:'Q(EC/β⁺)'};
      html += `<div class="dc"><h3>⚡ Q-values</h3>`;
      for (const [k,v] of Object.entries(iso.q_vals)) {
        if (v) {
          const lbl = qLabels[k] || k;
          const num = parseFloat(v);
          html += `<div class="dc-row"><span class="dc-label">${lbl}</span>
            <span class="dc-val">${isNaN(num)?v:num.toFixed(1)} keV
              <button class="copy-btn" onclick="copyVal('${isNaN(num)?v:num.toFixed(1)}', this)">📋</button>
            </span>
          </div>`;
        }
      }
      html += `</div>`;
    }
  }

  // ── Gamma radiation card
  const g = iso.gamma;
  html += `<div class="dc"><h3>γ Gamma Radiation</h3>`;
  if (!g) {
    html += `<div class="gm-no">No gamma emission data in IAEA ENSDF for this nuclide${isStable?' (stable nuclide — no decay gammas)':'.'}</div>`;
  } else {
    const sumI = g.sum_i; const nLines = g.n_lines; const totalE = g.total_e_per_decay;
    const meanE = g.mean_e; const domE = g.dominant_e; const domI = g.dominant_i;

    html += `<div class="gm-summary">
      <div class="gm-box">
        <div class="gm-num">${nLines}</div>
        <div class="gm-unit">γ lines in ENSDF</div>
      </div>
      <div class="gm-box">
        <div class="gm-num">${sumI.toFixed(1)}<span style="font-size:0.6rem;font-weight:400">%</span></div>
        <div class="gm-unit">Σ intensity (per 100 decays)</div>
      </div>
      <div class="gm-box">
        <div class="gm-num">${totalE.toFixed(1)}<span style="font-size:0.6rem;font-weight:400"> keV</span></div>
        <div class="gm-unit">Total γ energy per decay</div>
      </div>
    </div>`;

    // Extra row with mean energy and dominant line
    html += `<div style="display:flex;gap:8px;margin-bottom:8px;font-size:0.72rem;color:var(--text2);">
      <span>Intensity-weighted mean E: <b style="color:var(--text)">${meanE} keV</b></span>
      <span style="margin-left:auto;">Dominant: <b style="color:var(--text)">${domE} keV</b> @ <b style="color:var(--text)">${domI}%</b></span>
    </div>`;

    // Copy total energy button
    html += `<div style="font-size:0.72rem;color:var(--text2);margin-bottom:8px;">
      Total keV/decay: <b style="color:var(--text)">${totalE.toFixed(3)}</b>
      <button class="copy-btn" onclick="copyVal('${totalE.toFixed(3)}', this)">📋</button>
      &nbsp;|&nbsp; Σ intensity: <b style="color:var(--text)">${sumI.toFixed(3)}</b>
      <button class="copy-btn" onclick="copyVal('${sumI.toFixed(3)}', this)">📋</button>
    </div>`;

    // Top gamma lines table
    if (g.top && g.top.length) {
      const maxI = g.top[0].i || 1;
      html += `<table class="gm-table">
        <thead><tr>
          <th>#</th><th>Energy (keV)</th><th>Unc.</th><th>Intensity (%)</th><th>Multipolarity</th><th>Decay type</th>
        </tr></thead><tbody>`;
      g.top.forEach((line, idx) => {
        const barW = Math.round(80 * line.i / maxI);
        const unc = line.unc_e ? `±${line.unc_e}` : '';
        html += `<tr>
          <td style="color:var(--text3)">${idx+1}</td>
          <td><b>${line.e.toFixed(3)}</b> <button class="copy-btn" onclick="copyVal('${line.e}', this)">📋</button></td>
          <td style="color:var(--text3);font-size:0.65rem">${unc}</td>
          <td>${line.i.toFixed(4)}<div class="gm-bar" style="width:${barW}px"></div></td>
          <td style="color:var(--text2)">${line.multi||'—'}</td>
          <td style="color:var(--text2)">${line.decay||'—'}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
      if (nLines > 12) {
        html += `<div style="font-size:0.68rem;color:var(--text3);margin-top:4px;">Showing top 12 of ${nLines} gamma lines by intensity.</div>`;
      }
    }
  }
  html += `</div>`;

  document.getElementById('detail').innerHTML = html;
}

/* ─── LOAD DATA & INIT ───────────────────────────────────────────── */

/* ─── SIDEBAR FILTER LOGIC ─────────────────────────────────────── */
const APP_KEYWORDS = {
  neuroendocrine: ['neuroendocrine','NET','DOTATATE','DOTATOC','somatostatin','carcinoid','paraganglioma','PRRT'],
  prostate: ['prostate','PSMA','mCRPC','castration'],
  thyroid: ['thyroid','radioiodine','NaI','iodide','Graves','thyroidectomy'],
  liver: ['liver','hepatocellular','HCC','SIRT','TARE','radioembolization','lipiodol'],
  bone: ['bone','skeletal','metastat','Metastron','HEDP','EDTMP','osteomimetic'],
  lymphoma: ['lymphoma','B-cell','ibritumomab','tositumomab','Bexxar','Zevalin'],
  breast: ['breast','trastuzumab','HER2'],
  cardiac: ['cardiac','myocardial','perfusion','heart','Rb-82','N-13','ammonia'],
  brain: ['brain','glioma','glioblastoma','cerebral','amyloid','Alzheimer','PiB','dopamine','Parkinson'],
  ovarian: ['ovarian','peritoneal','colloidal phosphate'],
  leukemia: ['leukemia','AML','CD33','CD45','myeloid','bone marrow'],
  melanoma: ['melanoma','ocular','uveal','ophthalmic','eye'],
  renal: ['renal','kidney','GFR','nephrology'],
  arthritis: ['synovit','arthritis','joint','synovectomy','synovial'],
  alzheimer: ['Alzheimer','amyloid','florbeta','PiB','dementia'],
};

let activeFilters = new Set();
let medFilterOn = false;

function matchesFilters(medInfo) {
  if (!activeFilters.size) return true;
  for (const f of activeFilters) {
    const [type, val] = f.split(':');
    if (type === 'status') {
      if (medInfo.status !== val) return false;
    } else if (type === 'type') {
      if (medInfo.type !== val) return false;
    } else if (type === 'modality') {
      const mod = (medInfo.modality || '').toLowerCase();
      const note = (medInfo.note || '').toLowerCase();
      if (val === 'PET' && !mod.includes('pet')) return false;
      if (val === 'SPECT' && !mod.includes('spect')) return false;
      if (val === 'Alpha' && !mod.includes('alpha') && !note.includes('alpha')) return false;
      if (val === 'Brachy' && !mod.includes('brachytherapy') && !mod.includes('brachy')) return false;
      if (val === 'Beta' && !mod.toLowerCase().includes('beta') && !note.includes('β⁻')) return false;
      if (val === 'Synov' && !mod.includes('synovectomy') && !mod.includes('synovis')) return false;
    } else if (type === 'app') {
      const keywords = APP_KEYWORDS[val] || [val];
      const text = JSON.stringify(medInfo).toLowerCase();
      if (!keywords.some(kw => text.includes(kw.toLowerCase()))) return false;
    }
  }
  return true;
}

function applyFilters() {
  if (!DATA) return;
  const filterOn = medFilterOn;

  // Count matching isotopes per filter option
  const counts = {};
  for (const key of Object.keys(MEDICAL_DB)) {
    const m = MEDICAL_DB[key];
    counts[`status:${m.status}`] = (counts[`status:${m.status}`]||0) + 1;
    counts[`type:${m.type}`] = (counts[`type:${m.type}`]||0) + 1;
  }

  // Update cells
  let matchCount = 0;
  document.querySelectorAll('.el-cell[data-z]').forEach(cell => {
    const Z = parseInt(cell.dataset.z);
    const el = DATA[Z];
    if (!el) return;

    if (!filterOn || !activeFilters.size) {
      cell.classList.remove('med-hidden');
      return;
    }

    // Does any isotope of this element match?
    const hasMatch = el.isotopes.some(iso => {
      const med = getMedInfo(iso.Z, iso.A, iso.isomer);
      return med && matchesFilters(med);
    });

    if (hasMatch) {
      cell.classList.remove('med-hidden');
      matchCount++;
    } else {
      cell.classList.add('med-hidden');
    }
  });

  if (filterOn && activeFilters.size) {
    document.getElementById('sb-match').textContent = `${matchCount} elements matching`;
  } else {
    document.getElementById('sb-match').textContent = '';
  }
}

function initSidebar() {
  const toggle = document.getElementById('med-toggle');
  toggle.addEventListener('change', () => {
    medFilterOn = toggle.checked;
    document.getElementById('sb-hint').style.display = medFilterOn ? 'none' : 'block';
    applyFilters();
  });

  document.querySelectorAll('.sb-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      if (activeFilters.has(f)) {
        activeFilters.delete(f);
        btn.classList.remove('active');
      } else {
        activeFilters.add(f);
        btn.classList.add('active');
      }
      if (activeFilters.size > 0 && !medFilterOn) {
        toggle.checked = true;
        medFilterOn = true;
        document.getElementById('sb-hint').style.display = 'none';
      }
      applyFilters();
    });
  });

  document.getElementById('sb-clear').addEventListener('click', () => {
    activeFilters.clear();
    document.querySelectorAll('.sb-filter').forEach(b => b.classList.remove('active'));
    applyFilters();
  });

  // Populate counts
  let estab=0,dev=0,diag=0,ther=0,thera=0;
  for (const m of Object.values(MEDICAL_DB)) {
    if (m.status==='established') estab++;
    else dev++;
    if (m.type==='diagnostic') diag++;
    else if (m.type==='therapy') ther++;
    else if (m.type==='theranostic') thera++;
  }
  const setC = (id, n) => { const el=document.getElementById(id); if(el) el.textContent=n; };
  setC('cnt-estab', estab);
  setC('cnt-dev', dev);
  setC('cnt-diag', diag);
  setC('cnt-ther', ther);
  setC('cnt-thera', thera);
}

async function init() {
  const detail = document.getElementById('detail');
  detail.innerHTML = '<div class="detail-empty">⏳ Loading nuclear data (3,391 isotopes)…</div>';
  try {
    const resp = await fetch('data.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    DATA = await resp.json();
    buildGrid();
    initSidebar();
    detail.innerHTML = '<div class="detail-empty">← Click an element to explore its isotopes</div>';
    console.log('Data loaded:', Object.keys(DATA).length, 'elements');
  } catch(e) {
    detail.innerHTML = `<div class="detail-empty" style="color:var(--dec-alpha)">❌ Error loading data.json: ${e.message}<br><br>
      Make sure you are serving this via a local web server:<br>
      <code style="background:var(--bg3);padding:4px 8px;border-radius:4px;">python3 -m http.server 8080</code><br>
      Then open <a href="http://localhost:8080" style="color:var(--link)">http://localhost:8080</a></div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
