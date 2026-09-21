import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGame } from './src/store/gameStore';
import type { Tab } from './src/store/gameStore';
import { Header } from './src/ui/components';
import { PromptModal } from './src/ui/PromptModal';
import { AchievementToast } from './src/ui/Toast';
import { FadeIn } from './src/ui/anim';
import { colors } from './src/ui/theme';
import { LifeScreen } from './src/ui/screens/LifeScreen';
import { ActivitiesScreen } from './src/ui/screens/ActivitiesScreen';
import { WorkScreen } from './src/ui/screens/WorkScreen';
import { PeopleScreen } from './src/ui/screens/PeopleScreen';
import { AssetsScreen } from './src/ui/screens/AssetsScreen';
import { MoreScreen } from './src/ui/screens/MoreScreen';
import { DeathScreen } from './src/ui/screens/DeathScreen';
import { StartScreen } from './src/ui/screens/StartScreen';
import { CreateScreen } from './src/ui/screens/CreateScreen';

const TITLES: Record<Exclude<Tab, 'life'>, string> = {
  activities: 'Actividades',
  work: 'Ocupación',
  people: 'Relaciones',
  assets: 'Activos',
  more: 'Menú',
};

function Main() {
  const ready = useGame((s) => s.ready);
  const life = useGame((s) => s.life);
  const creating = useGame((s) => s.creating);
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const cancelCreate = useGame((s) => s.cancelCreate);
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
  if (creating) {
    return (
      <View style={s.root}>
        <Header title="Nueva vida" onBack={life ? cancelCreate : undefined} />
        <CreateScreen />
      </View>
    );
  }
  if (!life) return <StartScreen />;

  // Con decisiones pendientes se muestra el modal por encima; si murió y no queda nada pendiente, resumen.
  if (!life.alive && life.pending.length === 0) {
    return (
      <View style={s.root}>
        <Header title="Fin de la vida" />
        <DeathScreen />
      </View>
    );
  }

  return (
    <View style={s.root}>
      {tab === 'life' ? (
        <LifeScreen />
      ) : (
        <>
          <Header title={TITLES[tab]} onBack={() => setTab('life')} />
          <FadeIn key={tab} from={18} duration={260} style={{ flex: 1 }}>
            {tab === 'activities' && <ActivitiesScreen />}
            {tab === 'work' && <WorkScreen />}
            {tab === 'people' && <PeopleScreen />}
            {tab === 'assets' && <AssetsScreen />}
            {tab === 'more' && <MoreScreen />}
          </FadeIn>
        </>
      )}
      <PromptModal />
      <AchievementToast />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Main />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
