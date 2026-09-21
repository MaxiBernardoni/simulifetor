import type { Delta } from '../engine/types';

// Todas las escenas ilustradas disponibles (deben existir en src/ui/art/Scene.tsx).
export const SCENE_KEYS = [
  'family_home',
  'school',
  'office',
  'construction',
  'money_win',
  'money_loss',
  'love',
  'breakup',
  'wedding',
  'baby',
  'party',
  'hospital',
  'street_crime',
  'court',
  'prison',
  'historical',
  'old_age',
  'playground',
  'tech',
  'travel',
  'mystery',
  'graveyard',
  'car',
  'bank',
  'graduation',
  'gym',
  'casino',
  'therapy',
  'friends',
  'fight',
  'pet',
  'study',
  'random',
] as const;
export type SceneKey = (typeof SCENE_KEYS)[number];

// Escena ilustrada para cada evento (por id); si no hay, se elige por etiqueta.
const EVENT_SCENE: Record<string, string> = {
  // infancia
  'child.first_words': 'baby', 'child.walking': 'baby', 'child.fear_dark': 'mystery', 'child.imaginary_friend': 'playground',
  'child.first_day': 'school', 'child.make_friend': 'playground', 'child.bully': 'fight', 'child.pet': 'pet',
  'child.stole_candy': 'random', 'child.broken_arm': 'hospital', 'child.parents_fight': 'fight', 'child.gifted': 'school',
  'child.sibling_born': 'baby', 'child.grandparent_dies': 'graveyard', 'child.school_play': 'school', 'child.flu': 'hospital',
  'child.lucky_toy': 'party', 'child.moved': 'family_home',
  // adolescencia
  'teen.first_kiss': 'love', 'teen.smoke_offer': 'street_crime', 'teen.alcohol_party': 'party', 'teen.skip_class': 'school',
  'teen.cheat_exam': 'study', 'teen.acne': 'random', 'teen.growth_spurt': 'random', 'teen.first_job': 'office', 'teen.fight': 'fight',
  'teen.parents_divorce': 'breakup', 'teen.first_love': 'love', 'teen.tattoo_fake_id': 'street_crime', 'teen.social_media': 'tech',
  'teen.friend_betray': 'breakup', 'teen.new_friend': 'friends', 'teen.driving': 'car', 'teen.gang': 'street_crime',
  'teen.expelled': 'school', 'teen.dropout_offer': 'school',
  // trabajo y carrera
  'work.layoffs': 'money_loss', 'work.affair_offer': 'love', 'work.embezzle': 'bank', 'work.unemployed': 'money_loss',
  'work.office_party': 'party', 'work.remote': 'tech', 'work.burnout': 'therapy', 'work.harassment': 'fight',
  'career.training': 'study', 'career.mentor': 'study', 'career.strike': 'fight', 'career.malpractice': 'hospital',
  'career.big_case': 'court', 'career.tech_layoffs': 'money_loss', 'career.startup': 'tech', 'career.grateful_student': 'school',
  'career.tip_jackpot': 'money_win', 'career.work_accident': 'construction', 'career.big_deal': 'money_win',
  'career.audit_pressure': 'bank', 'career.dream_job': 'money_win',
  // dinero
  'money.lottery': 'casino', 'money.inheritance': 'money_win', 'money.unexpected_bill': 'money_loss', 'money.scam_email': 'tech',
  'money.crypto': 'tech', 'money.car_breaks': 'car', 'money.found_wallet': 'money_win', 'money.friend_loan': 'friends',
  'money.tax_audit': 'bank', 'money.bonus': 'money_win', 'money.debt_collector': 'money_loss', 'money.identity_theft': 'tech',
  'money.house_repairs': 'family_home', 'money.car_crash': 'car', 'money.car_stolen': 'car', 'money.house_boom': 'family_home',
  'money.stock_tip': 'bank', 'money.startup_invest': 'friends', 'money.side_gig': 'construction', 'money.charity': 'family_home',
  'money.bank_calls': 'bank',
  // amor y familia
  'love.meet_stranger': 'love', 'love.proposal': 'wedding', 'love.partner_cheats': 'breakup', 'love.temptation': 'love',
  'love.breakup': 'breakup', 'love.pregnancy': 'baby', 'love.divorce': 'breakup', 'love.date_disaster': 'breakup',
  'love.ex_returns': 'love', 'love.midlife': 'car', 'love.date_success': 'love', 'love.anniversary': 'love',
  'family.sibling_help': 'friends', 'family.child_trouble': 'school', 'family.reunion': 'family_home', 'family.parent_ill': 'hospital',
  'family.grandchild': 'baby', 'family.kid_leaves': 'family_home', 'family.parent_advice': 'family_home',
  // salud
  'health.depression': 'therapy', 'health.gym_fit': 'gym', 'health.addiction': 'street_crime',
  // crimen y justicia
  'crime.dui': 'car', 'crime.witness': 'court', 'crime.home_robbery': 'street_crime',
  'court.reentry': 'friends', 'court.police_bribe': 'bank', 'court.witness_threat': 'fight',
  // historia
  'hist.crisis_1982': 'money_loss', 'hist.hyperinflation_1989': 'money_loss', 'hist.crisis_2001': 'money_loss',
  'hist.internet_1998': 'tech', 'hist.smartphones_2008': 'tech', 'hist.ai_2023': 'tech', 'hist.blackout_2015': 'mystery',
  // azar y vejez
  'random.free_trip': 'travel', 'random.viral_video': 'tech', 'random.old_friend': 'friends', 'random.cult': 'mystery',
  'random.noisy_neighbor': 'party', 'random.mysterious_letter': 'mystery', 'random.dream_job_meme': 'money_win',
  'random.moved_city': 'car', 'random.identity_crisis': 'therapy', 'random.pet_dies': 'graveyard', 'random.scholarship': 'graduation',
  'old.bucket_list': 'travel', 'old.memory': 'therapy', 'old.fall': 'hospital',
  // relaciones
  'rel.friend_help': 'car', 'rel.friend_wedding': 'wedding', 'rel.friend_conflict': 'fight', 'rel.friend_moves': 'travel',
  'rel.friend_bail': 'court', 'rel.friend_success': 'money_win', 'rel.partner_jealous': 'fight', 'rel.partner_promotion': 'money_win',
  'rel.partner_illness': 'hospital', 'rel.partner_surprise': 'love', 'rel.partner_debt': 'money_loss', 'rel.moving_in': 'family_home',
  'rel.in_laws': 'family_home', 'rel.sibling_rivalry': 'fight', 'rel.sibling_wedding': 'wedding', 'rel.mother_visit': 'family_home',
  'rel.father_health': 'hospital', 'rel.child_first_steps': 'baby', 'rel.child_award': 'school', 'rel.child_rebel': 'fight',
  'rel.child_moves_out': 'family_home', 'rel.ex_gossip': 'breakup',
  // dinastía
  'dyn.parents_letter': 'mystery', 'dyn.heirloom': 'family_home', 'dyn.family_business': 'bank', 'dyn.scandal': 'court',
  'dyn.pressure': 'therapy', 'dyn.name_opens_doors': 'money_win', 'dyn.sibling_dispute': 'fight',
};

const TAG_SCENE: [string, string][] = [
  ['dynasty', 'family_home'], ['court', 'court'], ['jail', 'prison'], ['crime', 'street_crime'], ['justice', 'court'], ['health', 'hospital'],
  ['love', 'love'], ['rel', 'friends'], ['work', 'office'], ['money', 'money_win'], ['family', 'family_home'],
  ['school', 'school'], ['child', 'playground'], ['teen', 'friends'], ['tech', 'tech'], ['historical', 'historical'],
  ['old', 'old_age'], ['random', 'random'],
];

export function sceneForEvent(id: string, tags?: string[]): string {
  if (EVENT_SCENE[id]) return EVENT_SCENE[id];
  for (const [tag, scene] of TAG_SCENE) if (tags?.includes(tag)) return scene;
  return 'random';
}

const ACTIVITY_SCENE: Record<string, string> = {
  gym: 'gym', doctor: 'hospital', therapy: 'therapy', meditate: 'therapy', cosmetic: 'hospital', party: 'party', drink: 'party',
  drugs: 'street_crime', hookup: 'love', travel: 'travel', casino: 'casino', read: 'study', study: 'study', tattoo: 'street_crime',
  make_friends: 'friends', find_partner: 'love', adopt_pet: 'pet', odd_jobs: 'construction', work_hard: 'office', ask_raise: 'office',
  shoplift: 'street_crime', robbery: 'street_crime', scam: 'street_crime', sell_drugs: 'street_crime', street_fight: 'fight',
  vandalism: 'street_crime', hacking: 'tech', bank_robbery: 'bank', murder: 'street_crime', jail_work: 'prison',
  jail_escape: 'prison', jail_gym: 'prison', jail_read: 'prison', jail_riot: 'prison',
};

export function sceneForActivity(id: string): string {
  return ACTIVITY_SCENE[id] ?? 'random';
}

const PERSON_SCENE: Record<string, string> = {
  talk: 'friends', spend_time: 'friends', gift: 'party', argue: 'fight', ask_money: 'money_win', night_together: 'love',
  propose: 'wedding', have_baby: 'baby', break_up: 'breakup', reconnect: 'love', party_friend: 'party', play: 'playground',
  scold: 'family_home', hug: 'love', apologize: 'friends', give_money: 'money_win', advice: 'family_home', cheat: 'street_crime',
  divorce: 'breakup', cut_off: 'breakup', help_study: 'study',
  flirt: 'love', love_letter: 'love', confess: 'love', date: 'love', romantic_surprise: 'love', kiss: 'love', lover_night: 'love',
  make_official: 'love', jealous_scene: 'fight', annoy: 'fight', defend: 'fight', trip: 'travel', cook_dinner: 'family_home',
  make_peace: 'friends',
};

export function sceneForPersonAction(id: string): string {
  return PERSON_SCENE[id] ?? 'friends';
}

/** Ajusta la escena al resultado: buenas o malas noticias. */
export function refineScene(scene: string, deltas: Delta[]): string {
  const d = (k: string) => deltas.find((x) => x.key === k)?.amount ?? 0;
  if (scene === 'money_win' && d('money') < 0) return 'money_loss';
  if (scene === 'money_loss' && d('money') > 0) return 'money_win';
  if ((scene === 'love' || scene === 'friends') && d('happiness') <= -4) return 'breakup';
  if (scene === 'party' && d('health') <= -6) return 'hospital';
  if (scene === 'casino' && d('money') < 0) return 'money_loss';
  return scene;
}
