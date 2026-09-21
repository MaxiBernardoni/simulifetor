import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { formatMoney } from '../../engine/format';
import { assetValue, canBuy, loanCapacity, netWorth } from '../../engine/assets';
import { CATALOG, INVEST_STEPS, LOAN_STEPS } from '../../content/assets';
import { Button, Card, Row, SectionTitle } from '../components';
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

function ButtonRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>{children}</View>;
}

function Small({ label, onPress, disabled, variant }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'ghost' | 'danger' }) {
  return (
    <View style={{ minWidth: 92 }}>
      <Button label={label} onPress={onPress} disabled={disabled} variant={variant ?? 'ghost'} />
    </View>
  );
}

export function AssetsScreen() {
  const life = useGame((st) => st.life)!;
  const g = useGame.getState();
  const blocked = life.pending.length > 0 || !life.alive;
  const debt = life.money < 0;
  const capacity = loanCapacity(life);
  const houses = CATALOG.filter((c) => c.kind === 'house');
  const cars = CATALOG.filter((c) => c.kind === 'car');

  const shop = (list: typeof CATALOG) =>
    list.map((it) => {
      const cash = canBuy(life, it.id, false);
      const fin = canBuy(life, it.id, true);
      return (
        <Card key={it.id} style={{ marginBottom: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{it.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>{formatMoney(it.price)}</Text>
          {cash && fin ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{cash}</Text> : null}
          <ButtonRow>
            <Small label="Comprar" variant="primary" disabled={blocked || !!cash} onPress={() => g.buy(it.id, false)} />
            <Small label="Financiar" disabled={blocked || !!fin} onPress={() => g.buy(it.id, true)} />
          </ButtonRow>
        </Card>
      );
    });

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Finanzas</Text>
      <Card style={{ marginTop: space.md }}>
        <Text style={{ color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{debt ? 'Deuda' : 'Dinero'}</Text>
        <Text style={{ color: debt ? colors.bad : colors.money, fontSize: 34, fontWeight: '800', marginTop: 4 }}>{formatMoney(life.money)}</Text>
        {debt ? <Text style={{ color: colors.muted, marginTop: 4 }}>Las deudas crecen 8% por año. Pasados los $40.000 de deuda, quebrás.</Text> : null}
        <Line label="Patrimonio neto" value={formatMoney(netWorth(life))} />
      </Card>

      <SectionTitle>Ingresos</SectionTitle>
      <Card>
        <Line label="Sueldo bruto" value={life.job ? formatMoney(life.job.salary) : '—'} />
        <Line label="Jubilación" value={life.pension ? formatMoney(life.pension) : '—'} />
        <Line label="Impuestos" value="20%" />
      </Card>

      <SectionTitle>Mis bienes · {formatMoney(assetValue(life))}</SectionTitle>
      {life.assets.length === 0 ? (
        <Text style={{ color: colors.muted }}>No tenés propiedades ni autos. Pagás alquiler ($7.000 por año).</Text>
      ) : (
        life.assets.map((a) => (
          <Row
            key={a.id}
            icon={a.kind === 'house' ? 'House' : 'Zap'}
            title={a.name}
            subtitle={`Vale ${formatMoney(a.value)} · comprado en ${a.boughtYear}`}
            disabled={blocked}
            onPress={() => g.sell(a.id)}
            right={<Text style={{ color: colors.accent, fontWeight: '700' }}>Vender</Text>}
          />
        ))
      )}

      <SectionTitle>Vivienda</SectionTitle>
      {shop(houses)}
      <SectionTitle>Autos</SectionTitle>
      {shop(cars)}

      <SectionTitle>Banco</SectionTitle>
      <Card>
        <Line label="Préstamo actual" value={formatMoney(life.loan)} color={life.loan > 0 ? colors.warn : undefined} />
        <Line label="Podés pedir hasta" value={formatMoney(capacity)} />
        <Text style={{ color: colors.muted, fontSize: 12 }}>Interés 6% anual. Se paga automáticamente el 10% por año.</Text>
        <ButtonRow>
          {LOAN_STEPS.map((n) => (
            <Small key={n} label={`+${formatMoney(n)}`} disabled={blocked || n > capacity} onPress={() => g.loan(n)} />
          ))}
        </ButtonRow>
        {life.loan > 0 ? (
          <ButtonRow>
            <Small label="Pagar $5.000" disabled={blocked || life.money < 1} onPress={() => g.repay(5000)} />
            <Small label="Pagar todo" disabled={blocked || life.money < 1} onPress={() => g.repay(life.loan)} />
          </ButtonRow>
        ) : null}
      </Card>

      <SectionTitle>Inversiones</SectionTitle>
      <Card>
        <Line label="Invertido" value={formatMoney(life.invested)} />
        <Text style={{ color: colors.muted, fontSize: 12 }}>Rinde entre -25% y +40% por año. Sin garantías.</Text>
        <ButtonRow>
          {INVEST_STEPS.map((n) => (
            <Small key={n} label={`Invertir ${formatMoney(n)}`} disabled={blocked || life.age < 18 || life.money < n} onPress={() => g.invest(n)} />
          ))}
        </ButtonRow>
        {life.invested > 0 ? (
          <ButtonRow>
            <Small label="Retirar todo" variant="primary" disabled={blocked} onPress={g.withdraw} />
          </ButtonRow>
        ) : null}
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
    </ScrollView>
  );
}
