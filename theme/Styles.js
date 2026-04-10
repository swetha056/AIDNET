import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  navyDeep:    '#0047AB',   // primary background (Royal Blue)
  navyMid:     '#0056b3',   
  navyLight:   '#007AFF',   
  navyBorder:  '#B0C4DE',   
  white:       '#FFFFFF',
  offWhite:    '#F4F7FA',   
  cardWhite:   '#FFFFFF',   
  cardBorder:  '#E8EDF4',   
  red:         '#C0202A',   
  redSoft:     '#C0202A',   
  redSubtle:   '#FFF0F0',   
  gold:        '#C9A84C',   
  goldLight:   '#F5E6B4',   
  goldGlow:    '#E8C96A',   
  textDark:    '#0047AB',   
  textMid:     '#4A6080',   
  textLight:   '#8FA5BE',   
  green:       '#2EAA6B',   
  greenSubtle: '#E8F8F0',
};

export const styles = StyleSheet.create({
  // ── GLOBAL LAYOUT ─────────────────────────────────────────────────────────
  container: { 
    flex: 1, 
    backgroundColor: C.offWhite, 
    paddingTop: 50 
  },

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  loginPage: { 
    flex: 1, 
    backgroundColor: C.navyDeep, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 30,
    elevation: 30,
    shadowColor: C.navyDeep,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  centerLogoText: { 
    fontSize: 30, 
    fontWeight: '900', 
    color: C.navyDeep, 
    textAlign: 'center', 
    marginBottom: 25, 
    letterSpacing: 6 
  },
  loginHeaderSection: { marginBottom: 28 },
  loginMainTitle: { fontSize: 26, fontWeight: '900', color: C.navyDeep },
  loginSubtitle: { fontSize: 13, color: C.textLight, marginTop: 3 },

  roleTabs: { 
    flexDirection: 'row', 
    marginBottom: 24, 
    backgroundColor: C.offWhite, 
    borderRadius: 10, 
    padding: 4, 
    borderWidth: 1, 
    borderColor: C.cardBorder 
  },
  roleTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 7 },
  roleTabActive: { 
    backgroundColor: C.navyDeep, 
    elevation: 4, 
    shadowColor: C.navyDeep, 
    shadowOpacity: 0.3, 
    shadowOffset: { width: 0, height: 2 } 
  },
  roleTabText: { color: C.textLight, fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },
  roleTabTextActive: { color: C.gold },

  inputGroup: { borderBottomWidth: 1, borderBottomColor: C.cardBorder, paddingBottom: 2, marginBottom: 4 },
  inputLabelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  inputLabel: { fontSize: 10, fontWeight: '900', color: C.textLight, marginLeft: 5, letterSpacing: 1.5 },
  input: { fontSize: 15, fontWeight: '700', color: C.navyDeep, height: 35, outlineStyle: 'none' },
  inputContainer: {},

  loginButtonContainer: { alignSelf: 'stretch', marginTop: 28 },
  loginGradientBtn: { 
    paddingVertical: 15, 
    borderRadius: 10, 
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  loginBtnText: { color: C.white, fontWeight: '900', fontSize: 15, letterSpacing: 1.5 },

  footerBrandingCenter: { marginTop: 28, alignItems: 'center' },
  footerBrandingText: { fontSize: 10, fontWeight: '800', color: C.textLight },
  footerSubText: { fontSize: 9, color: C.textLight, letterSpacing: 1.5, marginTop: 4 },

  // ── HEADER (Dashboard) ────────────────────────────────────────────────────
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 14,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    backgroundColor: C.white,
  },
  headerText: { 
    fontSize: 17, 
    fontWeight: '900', 
    color: C.navyDeep, 
    letterSpacing: 1.5 
  },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: C.offWhite, 
    borderWidth: 1, 
    borderColor: C.cardBorder, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 0.8, shadowRadius: 6 },
  stealthIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: C.offWhite, justifyContent: 'center', alignItems: 'center' },

  // ── CARDS ─────────────────────────────────────────────────────────────────
  content: { padding: 18, flex: 1 },
  card: { 
    backgroundColor: C.white, 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 14, 
    elevation: 3,
    shadowColor: C.navyDeep,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  cardHeaderFlex: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  packetTitle: { fontSize: 16, fontWeight: '900', color: C.navyDeep },
  packetType: { fontSize: 11, fontWeight: 'bold', color: C.gold, letterSpacing: 0.5 },

  actionBtn: { 
    backgroundColor: C.navyDeep, 
    padding: 13, 
    borderRadius: 9, 
    alignItems: 'center', 
    marginTop: 10 
  },
  actionBtnText: { color: C.white, fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },

  // ── SOS PANIC BUTTON ──────────────────────────────────────────────────────
  panicContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosButtonWrapper: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center' },
  progressRing: { position: 'absolute', width: 216, height: 216, borderRadius: 108 },
  panicButton: { 
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 15,
    backgroundColor: C.navyDeep,
    borderWidth: 6,
    borderColor: C.redSoft,
    shadowColor: C.navyDeep,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
  },
  panicInner: { width: 151, height: 151, borderRadius: 75.5, backgroundColor: C.navyDeep, justifyContent: 'center', alignItems: 'center' },
  panicText: { fontSize: 44, fontWeight: '900', color: C.gold, letterSpacing: 2 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 28 },
  emergencyItem: { 
    width: width/2 - 30, 
    backgroundColor: C.white, 
    padding: 15, 
    margin: 8, 
    borderRadius: 12, 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: C.cardBorder,
    elevation: 2,
    shadowColor: C.navyDeep,
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  emergencyItemText: { marginTop: 6, fontWeight: '800', color: C.navyDeep, fontSize: 11, letterSpacing: 0.5 },

  // ── SOS STATUS ────────────────────────────────────────────────────────────
  statusSection: { flex: 1, justifyContent: 'center', paddingHorizontal: 5 },
  statusBadge: { 
    backgroundColor: C.redSoft, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 4, 
    alignSelf: 'flex-start', 
    marginBottom: 8, 
    fontSize: 9, 
    color: C.white, 
    fontWeight: '900',
    letterSpacing: 1
  },
  statusMain: { fontSize: 24, fontWeight: '900', color: C.navyDeep, marginBottom: 8 },
  statusSub: { color: C.textMid, fontSize: 13, lineHeight: 20 },
  cancelBtn: { 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 10, 
    backgroundColor: C.offWhite, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: C.cardBorder 
  },
  cancelText: { color: C.textLight, fontWeight: '800', fontSize: 11, letterSpacing: 1.5 },

  compassCircle: { 
    width: 42, 
    height: 42, 
    borderRadius: 9, 
    backgroundColor: C.navyDeep, 
    borderWidth: 1, 
    borderColor: C.navyBorder, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  silentOverlay: { flex: 1, backgroundColor: C.navyDeep, justifyContent: 'center', alignItems: 'center' },
  silentHint: { color: C.textLight, fontSize: 14 },

  // ── SIDEBAR / DRAWER ──────────────────────────────────────────────────────
  settingsOverlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(11,31,58,0.75)', 
    zIndex: 999, 
    flexDirection: 'row' 
  },
  sidebarDismissArea: { flex: 1 },
  sideDrawer: { 
    backgroundColor: C.white, 
    width: '85%', 
    maxWidth: 320, 
    height: '100%', 
    padding: 25, 
    paddingTop: 60,
    elevation: 30,
    shadowColor: C.navyDeep,
    shadowOpacity: 0.15,
    borderRightWidth: 1,
    borderRightColor: C.cardBorder,
  },
  settingsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 28, 
    paddingBottom: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: C.offWhite 
  },
  settingsContent: { paddingBottom: 50 },
  settingsInputGroup: { marginBottom: 20 },
  settingsLabel: { fontSize: 10, fontWeight: '900', color: C.textLight, marginBottom: 6, letterSpacing: 1.5 },
  settingsInput: { 
    borderBottomWidth: 1, 
    borderBottomColor: C.cardBorder, 
    paddingVertical: 10, 
    fontSize: 15, 
    fontWeight: '700', 
    color: C.navyDeep 
  },
  saveBtn: { 
    backgroundColor: C.navyDeep, 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 20,
    elevation: 4,
    shadowColor: C.navyDeep,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutBtnSettings: { 
    padding: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: C.redSoft, 
    backgroundColor: 'rgba(192,32,42,0.1)', 
    alignItems: 'center', 
    marginTop: 12 
  },

  // ── PICKER / CHOICE ───────────────────────────────────────────────────────
  pickerTrigger: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: C.cardBorder, 
    paddingVertical: 10 
  },
  pickerText: { fontSize: 15, fontWeight: '700', color: C.navyDeep },

  choiceOverlay: { 
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(11,31,58,0.55)', 
    zIndex: 2000, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 25 
  },
  choiceCard: { 
    width: '100%', 
    backgroundColor: C.white, 
    borderRadius: 16, 
    padding: 22, 
    elevation: 25,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  choiceHeader: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: C.gold, 
    textAlign: 'center', 
    marginBottom: 15, 
    letterSpacing: 2 
  },
  choiceItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.offWhite, alignItems: 'center' },
  choiceText: { fontSize: 15, fontWeight: '700', color: C.navyDeep },

  // ── MENU ITEMS ─────────────────────────────────────────────────────────────
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: C.offWhite 
  },
  menuItemText: { fontSize: 15, fontWeight: '700', color: C.navyDeep, marginLeft: 14 },

  // ── GUIDELINES ─────────────────────────────────────────────────────────────
  guidelineBox: { 
    backgroundColor: C.offWhite, 
    padding: 14, 
    borderRadius: 10, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: C.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
  },
  guideTitle: { fontSize: 12, fontWeight: '900', color: C.navyDeep, marginBottom: 5, letterSpacing: 0.5 },
  guideText: { fontSize: 12, color: C.textMid, lineHeight: 19 },

  checkpointItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: C.offWhite 
  },
  checkpointText: { fontSize: 13, fontWeight: '700', color: C.navyDeep, marginLeft: 12, flex: 1 },
  progressBarBg: { height: 5, backgroundColor: C.cardBorder, borderRadius: 3, marginTop: 20 },
  progressBarFill: { height: '100%', backgroundColor: C.green, borderRadius: 3 },

  // ── QUICK PROFILE CARD ─────────────────────────────────────────────────────
  quickProfileCard: { 
    padding: 18, 
    marginBottom: 30, 
    borderLeftWidth: 4, 
    borderLeftColor: C.gold,
    backgroundColor: C.white,
  },
  quickProfileTitle: { fontSize: 15, fontWeight: '900', color: C.navyDeep, letterSpacing: 0.5 },
  quickProfileSub: { fontSize: 11, fontWeight: 'bold', color: C.gold, marginTop: 4 },
  allergyWarning: { fontSize: 9, fontWeight: '800', color: C.redSoft, marginTop: 4, letterSpacing: 0.5 },
  quickEditBtn: { padding: 8, backgroundColor: C.offWhite, borderRadius: 7, borderWidth: 1, borderColor: C.cardBorder },
  quickProfileLine: { height: 1, backgroundColor: C.offWhite, marginVertical: 12 },
  quickProfileFooter: { fontSize: 10, fontWeight: '700', color: C.textLight, letterSpacing: 1.5 },

  expandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.offWhite, marginTop: 10 },
  expandText: { fontSize: 10, fontWeight: '800', color: C.gold, marginRight: 5, letterSpacing: 0.5 },

  // ── EXPERT DETAILS ─────────────────────────────────────────────────────────
  expertDetailBox: { 
    backgroundColor: C.offWhite, 
    borderRadius: 10, 
    padding: 14, 
    marginTop: 8, 
    borderWidth: 1, 
    borderColor: C.cardBorder,
    borderLeftWidth: 3,
    borderLeftColor: C.navyLight
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.white },
  detailLabel: { fontSize: 9, fontWeight: '900', color: C.textLight, letterSpacing: 1 },
  detailValue: { fontSize: 10, fontWeight: '800', color: C.navyDeep },
  statusBadgeExpert: { 
    backgroundColor: C.offWhite, 
    paddingHorizontal: 9, 
    paddingVertical: 3, 
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.cardBorder, 
  },
  statusBadgeText: { fontSize: 8, fontWeight: '900', color: C.navyDeep, letterSpacing: 0.5 },

  // ── FULL SCREEN OVERLAY ─────────────────────────────────────────────────────
  fullScreenOverlay: { 
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: C.offWhite, 
    zIndex: 1001, 
    paddingHorizontal: 20, 
    paddingTop: 60 
  },
  fullScreenHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 22,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.gold,
  },
  fullScreenContent: { paddingBottom: 100 },
  sectionHeader: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: C.gold, 
    letterSpacing: 2, 
    marginBottom: 12, 
    marginTop: 8 
  },

  allergySection: { marginVertical: 10 },
  allergyInputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.white, 
    borderRadius: 10, 
    paddingLeft: 10, 
    borderWidth: 1, 
    borderColor: C.cardBorder 
  },
  addAllergyBtn: { 
    backgroundColor: C.navyDeep, 
    padding: 10, 
    borderTopRightRadius: 9, 
    borderBottomRightRadius: 9 
  },
  allergyTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  allergyTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: C.white, 
    borderWidth: 1, 
    borderColor: C.cardBorder, 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    marginRight: 8, 
    marginBottom: 8 
  },
  allergyTagText: { fontSize: 12, fontWeight: 'bold', color: C.navyDeep },
});
