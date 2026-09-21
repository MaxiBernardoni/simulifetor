import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { activityStatus, canEnrollUniversity } from '../../engine/actions';
import { allActivities, getCareer } from '../../engine/registry';
import { formatMoney } from '../../engine/format';
import { Bar, Button, Card, Row, SectionTitle } from '../components';
import { colors, space } from '../theme';

const EDU = ['Sin estudios', 'Primaria completa', 'Secundaria completa', 'Título universitario'];
const ENROLLED = { primary: 'Primaria', secondary: 'Secundaria', university: 'Universidad' } as const;

export function WorkScreen() {
  const life = useGame((st) => st.life)!;
  const g = useGame.getState();
  const blocked = life.pending.length > 0 || !life.alive;
  const jobActs = allActivities()
    .filter((a) => a.category === 'trabajo')
    .map((a) => ({ a, st: activityStatus(life, a) }))
    .filter((x) => x.st.visible);

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>

      <SectionTitle icon="GraduationCap" color="#3A86B4">Educación</SectionTitle>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{EDU[life.edu.level]}</Text>
        {life.edu.enrolled ? (
          <>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Cursando {ENROLLED[life.edu.enrolled]} · año {life.edu.years}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 8, marginBottom: 4 }}>Promedio: {life.edu.gpa}</Text>
            <Bar value={life.edu.gpa} color={colors.smarts} />
          </>
        ) : (
          <Text style={{ color: colors.muted, marginTop: 4 }}>No estás estudiando.</Text>
        )}
        <View style={{ gap: 8, marginTop: 12 }}>
          {canEnrollUniversity(life) ? (
            <Button label="Inscribirme en la universidad" icon="GraduationCap" onPress={g.enroll} disabled={blocked} />
          ) : null}
          {life.edu.enrolled === 'university' ? (
            <Button label="Abandonar la universidad" variant="danger" onPress={g.dropUni} disabled={blocked} />
          ) : null}
        </View>
      </Card>

      <SectionTitle icon="BriefcaseBusiness" color="#0E7C7B">Trabajo</SectionTitle>
      {life.job ? (
        <Card>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{life.job.title}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>
            {formatMoney(life.job.salary)} por año · Jefe/a: {life.job.boss.split(' ')[0]}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 10, marginBottom: 4 }}>Rendimiento: {life.job.performance}</Text>
          <Bar value={life.job.performance} color={life.job.performance > 60 ? colors.good : life.job.performance > 30 ? colors.warn : colors.bad} />
          <View style={{ marginTop: 12 }}>
            {jobActs.map(({ a, st }) => (
              <Row key={a.id} icon={a.icon} tint="#0E7C7B" title={a.label} subtitle={st.reason ?? a.desc} disabled={blocked || !!st.reason} onPress={() => g.activity(a.id)} />
            ))}
            <Button label="Renunciar" variant="danger" onPress={g.quitJob} disabled={blocked} />
          </View>
        </Card>
      ) : life.flags.retired ? (
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Jubilado/a</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>Cobrás {formatMoney(life.pension)} al año.</Text>
        </Card>
      ) : (
        <Card>
          <Text style={{ color: colors.muted, marginBottom: 12 }}>
            {life.jailYears > 0 ? 'No podés trabajar estando preso.' : life.age < 14 ? 'Todavía sos muy chico/a para trabajar.' : 'Estás sin trabajo.'}
          </Text>
          <Button label="Buscar trabajo" icon="Briefcase" onPress={g.searchJobs} disabled={blocked || life.jailYears > 0 || life.age < 14 || life.usedThisYear.includes('search_job')} />
          {life.usedThisYear.includes('search_job') && life.offers.length === 0 ? (
            <Text style={{ color: colors.muted, marginTop: 10 }}>Ya buscaste este año. Sin resultados.</Text>
          ) : null}
        </Card>
      )}

      {life.offers.length > 0 ? (
        <>
          <SectionTitle icon="Handshake" color="#2A9D6F">Ofertas disponibles</SectionTitle>
          {life.offers.map((id) => {
            const c = getCareer(id);
            if (!c) return null;
            return (
              <Row
                key={id}
                icon="BriefcaseBusiness"
                tint="#2A9D6F"
                title={c.levels[0].title}
                subtitle={`${c.sector} · ${formatMoney(c.levels[0].salary)} por año`}
                disabled={blocked}
                onPress={() => g.takeJob(id)}
              />
            );
          })}
        </>
      ) : null}
    </ScrollView>
  );
}
