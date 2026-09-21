import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { showAlert } from '../dialog';
import { useGame } from '../../store/gameStore';
import type { TreeNode, World, WorldData } from '../../engine/world';
import { buildForest, canSwitchTo, relationLabel, SWITCH_COOLDOWN_YEARS } from '../../engine/kinship';
import type { ForestUnit } from '../../engine/kinship';
import { formatMoney } from '../../engine/format';
import { Avatar } from '../Avatar';
import { Button, SectionTitle } from '../components';
import { Icon } from '../Icon';
import { colors, radius, space } from '../theme';

const AV = 52; // diámetro del avatar
const RING = 60; // avatar + anillo
const NW = 88; // ancho de cada persona
const NODE_H = 108; // alto aproximado de avatar + textos
const LINE = '#6B7480';
const LW = 2;

type Status = 'me' | 'ok' | 'locked' | 'dead';
const CLASS_LABEL = { 1: 'Humilde', 2: 'Clase media', 3: 'Acomodada' } as const;

function statusOf(w: World, curId: string, n: TreeNode): Status {
  if (n.id === curId) return 'me';
  if (!n.alive) return 'dead';
  const c = canSwitchTo(w, curId, n.id);
  return c.ok ? 'ok' : 'locked';
}

const RING_STYLE: Record<Status, { color: string; width: number; dashed?: boolean }> = {
  me: { color: colors.accent, width: 4 },
  ok: { color: '#2A9D6F', width: 3 },
  locked: { color: '#A8A08F', width: 2, dashed: true },
  dead: { color: '#9AA0A6', width: 2 },
};

function NodeView({
  node,
  w,
  curId,
  linked,
  onPress,
  match,
}: {
  node: TreeNode;
  w: World;
  curId: string;
  linked?: boolean;
  onPress: (id: string) => void;
  match?: (n: TreeNode, st: Status) => boolean;
}) {
  const st = statusOf(w, curId, node);
  const ring = RING_STYLE[st];
  const rel = relationLabel(w, curId, node.id);
  return (
    <Pressable onPress={() => onPress(node.id)} style={[s.node, match && !match(node, st) && { opacity: 0.25 }]}>
      <View>
        <View
          style={[
            s.ring,
            {
              borderColor: ring.color,
              borderWidth: ring.width,
              borderStyle: ring.dashed ? 'dashed' : 'solid',
              opacity: st === 'dead' ? 0.55 : st === 'locked' ? 0.85 : 1,
            },
          ]}
        >
          <View style={s.avatar}>
            <Avatar look={node.look} size={AV} />
          </View>
        </View>
        {st === 'locked' ? (
          <View style={[s.badge, { backgroundColor: '#8C8676' }]}>
            <Icon name="Lock" size={11} color="#fff" />
          </View>
        ) : st === 'dead' ? (
          <View style={[s.badge, { backgroundColor: '#6B7480' }]}>
            <Icon name="Ghost" size={11} color="#fff" />
          </View>
        ) : st === 'me' ? (
          <View style={[s.badge, { backgroundColor: colors.accent }]}>
            <Icon name="Star" size={11} color="#fff" />
          </View>
        ) : null}
        {linked ? (
          <View style={[s.badge, { left: -2, right: undefined, backgroundColor: '#9B5DE5' }]}>
            <Icon name="Link" size={11} color="#fff" />
          </View>
        ) : null}
      </View>
      <Text style={s.name} numberOfLines={1}>
        {node.name}
      </Text>
      <Text style={s.rel} numberOfLines={1}>
        {rel}
      </Text>
      <Text style={s.age} numberOfLines={1}>
        {node.alive ? `${node.age} años` : `† ${node.deathYear ?? ''}`}
      </Text>
    </Pressable>
  );
}

function Unit({
  u,
  w,
  curId,
  isChild,
  onPress,
  match,
}: {
  u: ForestUnit;
  w: World;
  curId: string;
  isChild: boolean;
  onPress: (id: string) => void;
  match?: (n: TreeNode, st: Status) => boolean;
}) {
  const hasKids = u.children.length > 0;
  const couple = !!u.partner;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', width: couple ? NW * 2 : NW }}>
        {couple ? (
          <View style={{ position: 'absolute', top: RING / 2, left: NW / 2, right: NW / 2, height: LW, backgroundColor: LINE }} />
        ) : null}
        {couple && isChild ? (
          <View style={{ position: 'absolute', top: 0, left: NW - LW / 2, height: RING / 2, width: LW, backgroundColor: LINE }} />
        ) : null}
        {hasKids ? (
          <View
            style={{
              position: 'absolute',
              top: couple ? RING / 2 : NODE_H,
              bottom: 0,
              left: couple ? NW - LW / 2 : NW / 2 - LW / 2,
              width: LW,
              backgroundColor: LINE,
            }}
          />
        ) : null}
        <NodeView node={u.head} w={w} curId={curId} onPress={onPress} match={match} />
        {u.partner ? <NodeView node={u.partner} w={w} curId={curId} linked={u.partnerLinked} onPress={onPress} match={match} /> : null}
      </View>
      {u.hiddenChildren > 0 ? <Text style={s.hint}>Sus hijos están en otra rama</Text> : null}
      {hasKids ? (
        <>
          <View style={{ width: LW, height: 16, backgroundColor: LINE }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {u.children.map((c, i) => {
              const first = i === 0;
              const last = i === u.children.length - 1;
              return (
                <View key={c.head.id} style={{ alignItems: 'center', paddingHorizontal: 4 }}>
                  {!first ? (
                    <View style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: LW, backgroundColor: LINE }} />
                  ) : null}
                  {!last ? (
                    <View style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: LW, backgroundColor: LINE }} />
                  ) : null}
                  <View style={{ width: LW, height: 16, backgroundColor: LINE }} />
                  <Unit u={c} w={w} curId={curId} isChild onPress={onPress} match={match} />
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

function NodeSheet({ id, wd, onClose }: { id: string | null; wd: WorldData; onClose: () => void }) {
  const life = useGame((st) => st.life);
  const switchCharacter = useGame((st) => st.switchCharacter);
  const w = wd.world;
  const n = id ? w.nodes[id] : undefined;
  if (!n) return null;
  const curId = w.currentId;
  const st = statusOf(w, curId, n);
  const check = canSwitchTo(w, curId, n.id);
  const rel = relationLabel(w, curId, n.id);
  const full = wd.lives[n.id];
  const partner = n.partnerId ? w.nodes[n.partnerId] : undefined;
  const kids = Object.values(w.nodes).filter((k) => k.fatherId === n.id || k.motherId === n.id).length;
  const scenarioLocked = !!life?.alive && life.scenario?.status === 'active';

  const go = () => {
    const err = switchCharacter(n.id);
    if (err) showAlert('No se puede cambiar', err);
    else onClose();
  };

  const tone = st === 'ok' ? '#2A9D6F' : st === 'me' ? colors.accent : colors.muted;
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => undefined}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View
              style={[
                s.ring,
                {
                  width: 78,
                  height: 78,
                  borderRadius: 39,
                  borderColor: RING_STYLE[st].color,
                  borderWidth: 3,
                  borderStyle: RING_STYLE[st].dashed ? 'dashed' : 'solid',
                },
              ]}
            >
              <View style={{ width: 68, height: 68, borderRadius: 34, overflow: 'hidden' }}>
                <Avatar look={n.look} size={68} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sTitle}>
                {n.name} {n.surname}
              </Text>
              <Text style={[s.sRel, { color: tone }]}>{rel}</Text>
              <Text style={s.sSub}>
                {n.alive
                  ? `${n.age} años · nació en ${n.birthYear}`
                  : `${n.birthYear} – ${n.deathYear} · murió de ${n.cause ?? 'causas naturales'}`}
              </Text>
            </View>
          </View>

          <View style={s.facts}>
            <Fact
              icon="BriefcaseBusiness"
              label={n.job ?? (n.alive ? (n.age < 18 ? 'Estudiante' : n.age >= 65 ? 'Jubilado/a' : 'Trabaja') : '—')}
            />
            <Fact icon="Coins" label={n.netWorth !== undefined ? formatMoney(n.netWorth) : CLASS_LABEL[n.wealthClass]} />
            {partner ? <Fact icon="Heart" label={`${n.married ? 'Casado/a con' : 'Pareja:'} ${partner.name}`} /> : null}
            {kids > 0 ? <Fact icon="Baby" label={`${kids} ${kids === 1 ? 'hijo/a' : 'hijos/as'}`} /> : null}
            {full ? (
              <Fact icon="Zap" label="Vive su propia vida (simulación completa)" />
            ) : n.alive && n.blood ? (
              <Fact icon="Hourglass" label="Vida simplificada hasta que la juegues" />
            ) : null}
          </View>

          <View style={[s.note, { borderColor: tone + '66', backgroundColor: tone + '14' }]}>
            <Icon name={st === 'ok' ? 'CircleCheck' : st === 'me' ? 'Star' : 'Lock'} size={18} color={tone} />
            <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 }}>
              {st === 'me'
                ? 'Este es tu personaje actual.'
                : st === 'ok'
                  ? 'Es pariente de sangre a hasta 2 generaciones: podés vivir su vida.'
                  : check.reason}
            </Text>
          </View>

          <View style={{ marginTop: 12, gap: 10 }}>
            {st === 'ok' ? (
              <Button label={`Vivir la vida de ${n.name}`} icon="Zap" variant="coral" onPress={go} disabled={scenarioLocked} />
            ) : null}
            {st === 'ok' && scenarioLocked ? (
              <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>
                No podés cambiar mientras hay un escenario en curso.
              </Text>
            ) : null}
            <Button label="Cerrar" variant="ghost" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Fact({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.fact}>
      <Icon name={icon} size={15} color={colors.muted} />
      <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{label}</Text>
    </View>
  );
}

export function FamilyTreeScreen() {
  const life = useGame((st) => st.life);
  const wd = useGame((st) => st.world);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<'tree' | 'news'>('tree');
  const [query, setQuery] = useState('');
  const [onlyPlayable, setOnlyPlayable] = useState(false);
  const markNewsRead = useGame((st) => st.markNewsRead);
  if (!life || !wd) return <Text style={{ padding: space.lg, color: colors.muted }}>Todavía no hay árbol.</Text>;

  const w = wd.world;
  const forest = buildForest(w);
  const total = Object.keys(w.nodes).length;
  const alive = Object.values(w.nodes).filter((n) => n.alive).length;
  const bots = Object.keys(wd.lives).length;
  const q = query.trim().toLowerCase();
  const match =
    q || onlyPlayable
      ? (n: TreeNode, st: Status) =>
          (!q || `${n.name} ${n.surname}`.toLowerCase().includes(q)) && (!onlyPlayable || st === 'ok' || st === 'me')
      : undefined;
  const news = (w.news ?? []).slice().reverse();
  const anyPlayable = Object.values(w.nodes).some((n) => n.id !== w.currentId && canSwitchTo(w, w.currentId, n.id).ok);
  const unread = (w.news ?? []).filter((n) => n.id > (w.newsSeen ?? 0)).length;

  if (tab === 'news') {
    return (
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 60 }}>
        <TabBar tab={tab} unread={0} onChange={setTab} />
        <Text style={s.sub}>Lo que pasó en la familia mientras vivías tu vida.</Text>
        {news.length === 0 ? (
          <Text style={[s.sub, { marginTop: space.lg }]}>
            Todavía no hay novedades. Cada año que pasa aparecen nacimientos, casamientos y despedidas.
          </Text>
        ) : null}
        {news.map((n) => (
          <View key={n.id} style={s.newsRow}>
            <Icon
              name={n.kind === 'birth' ? 'Baby' : n.kind === 'death' ? 'Ghost' : n.kind === 'wedding' ? 'Heart' : 'HeartCrack'}
              size={20}
              color={n.kind === 'death' ? '#6B7480' : n.kind === 'birth' ? '#2A9D6F' : '#E0517A'}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 19 }}>{n.text}</Text>
              <Text style={s.sub}>
                {n.year === w.year ? 'Este año' : `Hace ${w.year - n.year} ${w.year - n.year === 1 ? 'año' : 'años'}`}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingVertical: space.lg, paddingBottom: 60 }}>
        <View style={{ paddingHorizontal: space.lg }}>
          <TabBar
            tab={tab}
            unread={unread}
            onChange={(t) => {
              setTab(t);
              if (t === 'news') markNewsRead();
            }}
          />
          <Text style={s.title}>Familia {w.surname}</Text>
          <Text style={s.sub}>
            {total} personas · {alive} vivas · {bots} {bots === 1 ? 'personaje con vida propia' : 'personajes con vida propia'} · año{' '}
            {w.year}
          </Text>
          <View style={s.rule}>
            <Icon name="Scale" size={18} color="#B77A12" />
            <Text style={{ flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 }}>
              Solo podés vivir la vida de parientes de <Text style={{ fontWeight: '800' }}>sangre a hasta 2 generaciones</Text> de distancia
              (padres, abuelos, hermanos, hijos, nietos, tíos, sobrinos y primos). Los demás aparecen en el árbol pero están bloqueados.
              Entre un cambio y otro hay que esperar {SWITCH_COOLDOWN_YEARS} años (salvo que tu personaje muera).
            </Text>
          </View>
          <TextInput
            style={s.search}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre…"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
          />
          <Pressable onPress={() => setOnlyPlayable((v) => !v)} style={s.filter}>
            <Icon name={onlyPlayable ? 'CircleCheck' : 'Circle'} size={18} color={onlyPlayable ? '#2A9D6F' : colors.muted} />
            <Text style={{ color: colors.text, fontSize: 13 }}>Resaltar solo a quienes puedo jugar</Text>
          </Pressable>
          {!anyPlayable ? (
            <Text style={[s.sub, { marginTop: 10 }]}>
              Ahora no hay nadie a quien puedas cambiarte (por el enfriamiento o porque no hay parientes vivos elegibles).
            </Text>
          ) : null}
          <View style={s.legend}>
            <Legend color={colors.accent} label="Vos" />
            <Legend color="#2A9D6F" label="Podés jugar" />
            <Legend color="#A8A08F" label="Bloqueado" dashed />
            <Legend color="#9AA0A6" label="Fallecido" />
          </View>
        </View>

        {forest.map((u, i) => (
          <View key={u.head.id}>
            <View style={{ paddingHorizontal: space.lg }}>
              <SectionTitle icon="Users" color="#9B5DE5">
                {i === 0 ? 'Rama principal' : 'Otra rama'} · {u.head.surname}
              </SectionTitle>
            </View>
            <Branch>
              <Unit u={u} w={w} curId={w.currentId} isChild={false} onPress={setSelected} match={match} />
            </Branch>
          </View>
        ))}
        <Text style={[s.sub, { textAlign: 'center', marginTop: space.lg }]}>Deslizá hacia los costados para ver toda la rama.</Text>
      </ScrollView>
      <NodeSheet id={selected} wd={wd} onClose={() => setSelected(null)} />
    </>
  );
}

function TabBar({ tab, unread, onChange }: { tab: 'tree' | 'news'; unread: number; onChange: (t: 'tree' | 'news') => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: space.md }}>
      {(['tree', 'news'] as const).map((t) => (
        <Pressable key={t} onPress={() => onChange(t)} style={[s.tab, tab === t && s.tabOn]}>
          <Text style={[s.tabText, tab === t && { color: '#fff' }]}>{t === 'tree' ? 'Árbol' : 'Novedades'}</Text>
          {t === 'news' && unread > 0 ? (
            <View style={s.unread}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{unread}</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

/** Rama con scroll horizontal, centrada al abrirla (la pareja raíz queda a la vista). */
function Branch({ children }: { children: React.ReactNode }) {
  const ref = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator
      contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 8 }}
      onContentSizeChange={(cw) => ref.current?.scrollTo({ x: Math.max(0, (cw - width) / 2), animated: false })}
    >
      {children}
    </ScrollView>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: color, borderStyle: dashed ? 'dashed' : 'solid' }}
      />
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  title: { color: colors.nameBlue, fontSize: 24, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  rule: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF3D6',
    borderRadius: radius.md,
    padding: 12,
    marginTop: space.md,
    alignItems: 'flex-start',
  },
  tab: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  unread: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E76F51',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  newsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: space.md,
  },
  filter: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: space.md },
  node: { width: NW, alignItems: 'center' },
  ring: { width: RING, height: RING, borderRadius: RING / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  avatar: { width: AV, height: AV, borderRadius: AV / 2, overflow: 'hidden' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: { color: colors.text, fontWeight: '800', fontSize: 13, marginTop: 5 },
  rel: { color: colors.nameBlue, fontSize: 11, fontWeight: '700' },
  age: { color: colors.muted, fontSize: 10 },
  hint: { color: colors.muted, fontSize: 10, marginTop: 4, textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: space.lg,
    paddingBottom: 30,
  },
  sTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sRel: { fontSize: 14, fontWeight: '800', marginTop: 1 },
  sSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  facts: { marginTop: 14, gap: 7 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 14 },
});
