import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { formatMoney } from '../../engine/format';
import { Card, SectionTitle } from '../components';
import { colors, space } from '../theme';

const CLASS = { 1: 'Humilde', 2: 'Clase media', 3: 'Acomodada' } as const;

function Line({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text style={{ color: color ?? colors.text, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export function AssetsScreen() {
  const life = useGame((st) => st.life)!;
  const debt = life.money < 0;
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Finanzas</Text>
      <Card style={{ marginTop: space.md }}>
        <Text style={{ color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{debt ? 'Deuda' : 'Dinero'}</Text>
        <Text style={{ color: debt ? colors.bad : colors.money, fontSize: 34, fontWeight: '800', marginTop: 4 }}>{formatMoney(life.money)}</Text>
        {debt ? <Text style={{ color: colors.muted, marginTop: 4 }}>Las deudas crecen 8% por año. Pasados los $40.000 de deuda, quebrás.</Text> : null}
      </Card>

      <SectionTitle>Ingresos</SectionTitle>
      <Card>
        <Line label="Sueldo bruto" value={life.job ? formatMoney(life.job.salary) : '—'} />
        <Line label="Jubilación" value={life.pension ? formatMoney(life.pension) : '—'} />
        <Line label="Impuestos" value="20%" />
      </Card>

      <SectionTitle>Perfil</SectionTitle>
      <Card>
        <Line label="Origen familiar" value={CLASS[life.wealthClass]} />
        <Line label="Antecedentes penales" value={life.flags.criminal_record ? 'Sí' : 'No'} color={life.flags.criminal_record ? colors.bad : undefined} />
        <Line label="Enfermedad crónica" value={life.flags.chronic ? 'Sí' : 'No'} color={life.flags.chronic ? colors.warn : undefined} />
        <Line label="Adicción" value={life.flags.substance ? 'Sí' : 'No'} color={life.flags.substance ? colors.warn : undefined} />
        <Line label="Quiebra" value={life.flags.bankrupt ? 'Sí' : 'No'} color={life.flags.bankrupt ? colors.bad : undefined} />
        <Line label="Mascota" value={life.flags.pet ? 'Sí' : 'No'} />
      </Card>
      <Text style={{ color: colors.muted, marginTop: space.lg, fontSize: 12 }}>Propiedades, autos e inversiones llegan en la próxima fase.</Text>
    </ScrollView>
  );
}
