import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from './src/store/gameStore';
import type { Tab } from './src/store/gameStore';
import { Icon } from './src/ui/Icon';
import { PromptModal } from './src/ui/PromptModal';
import { colors } from './src/ui/theme';
import { LifeScreen } from './src/ui/screens/LifeScreen';
import { ActivitiesScreen } from './src/ui/screens/ActivitiesScreen';
import { WorkScreen } from './src/ui/screens/WorkScreen';
import { PeopleScreen } from './src/ui/screens/PeopleScreen';
import { AssetsScreen } from './src/ui/screens/AssetsScreen';
import { MoreScreen } from './src/ui/screens/MoreScreen';
import { DeathScreen } from './src/ui/screens/DeathScreen';
import { StartScreen } from './src/ui/screens/StartScreen';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'life', label: 'Vida', icon: 'Activity' },
  { id: 'activities', label: 'Actividades', icon: 'Zap' },
  { id: 'work', label: 'Trabajo', icon: 'Briefcase' },
  { id: 'people', label: 'Gente', icon: 'Users' },
  { id: 'assets', label: 'Finanzas', icon: 'Wallet' },
  { id: 'more', label: 'Más', icon: 'Menu' },
];

function Main() {
  const ready = useGame((s) => s.ready);
  const life = useGame((s) => s.life);
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const load = useGame((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  if (!ready) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!life) return <StartScreen />;

  // Con decisiones pendientes se muestra el modal por encima; si murió y no queda nada pendiente, resumen.
  if (!life.alive && life.pending.length === 0) return <DeathScreen />;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {tab === 'life' && <LifeScreen />}
        {tab === 'activities' && <ActivitiesScreen />}
        {tab === 'work' && <WorkScreen />}
        {tab === 'people' && <PeopleScreen />}
        {tab === 'assets' && <AssetsScreen />}
        {tab === 'more' && <MoreScreen />}
      </View>
      <View style={s.tabbar}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Pressable key={t.id} style={s.tab} onPress={() => setTab(t.id)}>
              <Icon name={t.icon} size={22} color={active ? colors.accent : colors.muted} />
              <Text style={[s.tabLabel, { color: active ? colors.accent : colors.muted }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <PromptModal />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <Main />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, paddingTop: 8, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 2 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});
