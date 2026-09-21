import type { Career } from '../engine/types';

// Salarios anuales brutos en moneda genérica. Nivel 0 = entrada.
export const CAREERS: Career[] = [
  { id: 'cashier', sector: 'comercio', minAge: 16, minEdu: 0, levels: [
    { title: 'Cajero/a', salary: 9000 }, { title: 'Cajero/a senior', salary: 11000 }, { title: 'Encargado/a de local', salary: 16000 }, { title: 'Gerente de sucursal', salary: 28000 },
  ] },
  { id: 'waiter', sector: 'gastronomía', minAge: 16, minEdu: 0, levels: [
    { title: 'Mozo/a', salary: 8500 }, { title: 'Mozo/a estrella', salary: 12000 }, { title: 'Maître', salary: 18000 }, { title: 'Dueño/a de bodegón', salary: 32000 },
  ] },
  { id: 'cook', sector: 'gastronomía', minAge: 18, minEdu: 0, levels: [
    { title: 'Ayudante de cocina', salary: 9500 }, { title: 'Cocinero/a', salary: 14000 }, { title: 'Jefe/a de cocina', salary: 24000 }, { title: 'Chef ejecutivo/a', salary: 45000 },
  ] },
  { id: 'construction', sector: 'obra', minAge: 18, minEdu: 0, levels: [
    { title: 'Peón de obra', salary: 10000 }, { title: 'Albañil', salary: 14000 }, { title: 'Capataz', salary: 22000 }, { title: 'Contratista', salary: 38000 },
  ] },
  { id: 'driver', sector: 'transporte', minAge: 18, minEdu: 0, levels: [
    { title: 'Repartidor/a', salary: 9500 }, { title: 'Chofer', salary: 13000 }, { title: 'Camionero/a', salary: 19000 }, { title: 'Dueño/a de flota', salary: 40000 },
  ] },
  { id: 'sales', sector: 'ventas', minAge: 18, minEdu: 2, levels: [
    { title: 'Vendedor/a', salary: 12000 }, { title: 'Ejecutivo/a de cuentas', salary: 20000 }, { title: 'Gerente comercial', salary: 38000 }, { title: 'Director/a comercial', salary: 75000 },
  ] },
  { id: 'office', sector: 'oficina', minAge: 18, minEdu: 2, levels: [
    { title: 'Administrativo/a', salary: 13000 }, { title: 'Analista', salary: 20000 }, { title: 'Jefe/a de área', salary: 34000 }, { title: 'Gerente general', salary: 70000 },
  ] },
  { id: 'electrician', sector: 'oficios', minAge: 18, minEdu: 2, minSmarts: 35, levels: [
    { title: 'Ayudante de electricista', salary: 11000 }, { title: 'Electricista', salary: 17000 }, { title: 'Técnico/a matriculado/a', salary: 26000 }, { title: 'Empresa de instalaciones', salary: 48000 },
  ] },
  { id: 'police', sector: 'seguridad', minAge: 20, minEdu: 2, noRecord: true, levels: [
    { title: 'Cadete', salary: 12000 }, { title: 'Oficial', salary: 18000 }, { title: 'Sargento', salary: 26000 }, { title: 'Comisario/a', salary: 48000 },
  ] },
  { id: 'nurse', sector: 'salud', minAge: 21, minEdu: 3, minSmarts: 45, levels: [
    { title: 'Enfermero/a', salary: 18000 }, { title: 'Enfermero/a jefe', salary: 26000 }, { title: 'Supervisor/a de guardia', salary: 38000 }, { title: 'Directora/or de enfermería', salary: 55000 },
  ] },
  { id: 'teacher', sector: 'educación', minAge: 22, minEdu: 3, minSmarts: 45, levels: [
    { title: 'Docente', salary: 16000 }, { title: 'Docente titular', salary: 22000 }, { title: 'Vicedirector/a', salary: 32000 }, { title: 'Director/a de escuela', salary: 45000 },
  ] },
  { id: 'accountant', sector: 'finanzas', minAge: 22, minEdu: 3, minSmarts: 50, levels: [
    { title: 'Auxiliar contable', salary: 18000 }, { title: 'Contador/a', salary: 30000 }, { title: 'Socio/a de estudio', salary: 55000 }, { title: 'CFO', salary: 95000 },
  ] },
  { id: 'developer', sector: 'tecnología', since: 1975, minAge: 20, minEdu: 3, minSmarts: 60, levels: [
    { title: 'Programador/a junior', salary: 24000 }, { title: 'Programador/a semi senior', salary: 40000 }, { title: 'Senior', salary: 65000 }, { title: 'CTO', salary: 120000 },
  ] },
  { id: 'lawyer', sector: 'legal', minAge: 24, minEdu: 3, minSmarts: 65, noRecord: true, levels: [
    { title: 'Pasante de estudio', salary: 20000 }, { title: 'Abogado/a', salary: 38000 }, { title: 'Socio/a', salary: 80000 }, { title: 'Juez/a', salary: 110000 },
  ] },
  { id: 'doctor', sector: 'salud', minAge: 26, minEdu: 3, minSmarts: 75, noRecord: true, levels: [
    { title: 'Médico/a residente', salary: 26000 }, { title: 'Médico/a', salary: 55000 }, { title: 'Especialista', salary: 95000 }, { title: 'Director/a de hospital', salary: 150000 },
  ] },
  { id: 'mechanic', sector: 'oficios', minAge: 18, minEdu: 0, levels: [
    { title: 'Ayudante de taller', salary: 9500 }, { title: 'Mecánico/a', salary: 15000 }, { title: 'Jefe/a de taller', salary: 24000 }, { title: 'Dueño/a de concesionaria', salary: 60000 },
  ] },
  { id: 'hairdresser', sector: 'servicios', minAge: 16, minEdu: 0, levels: [
    { title: 'Ayudante de peluquería', salary: 8500 }, { title: 'Peluquero/a', salary: 13000 }, { title: 'Estilista', salary: 20000 }, { title: 'Dueño/a de salón', salary: 36000 },
  ] },
  { id: 'firefighter', sector: 'seguridad', minAge: 20, minEdu: 2, noRecord: true, levels: [
    { title: 'Bombero/a', salary: 13000 }, { title: 'Bombero/a especialista', salary: 19000 }, { title: 'Jefe/a de cuartel', salary: 30000 }, { title: 'Comandante', salary: 50000 },
  ] },
  { id: 'journalist', sector: 'medios', minAge: 20, minEdu: 3, minSmarts: 50, levels: [
    { title: 'Cronista', salary: 14000 }, { title: 'Periodista', salary: 22000 }, { title: 'Editor/a', salary: 38000 }, { title: 'Director/a de medio', salary: 75000 },
  ] },
  { id: 'architect', sector: 'construcción', minAge: 23, minEdu: 3, minSmarts: 60, levels: [
    { title: 'Arquitecto/a junior', salary: 20000 }, { title: 'Arquitecto/a', salary: 36000 }, { title: 'Jefe/a de proyectos', salary: 62000 }, { title: 'Socio/a de estudio', salary: 105000 },
  ] },
  { id: 'engineer', sector: 'ingeniería', minAge: 23, minEdu: 3, minSmarts: 65, levels: [
    { title: 'Ingeniero/a junior', salary: 24000 }, { title: 'Ingeniero/a', salary: 42000 }, { title: 'Ingeniero/a senior', salary: 70000 }, { title: 'Director/a técnico/a', salary: 115000 },
  ] },
  { id: 'psychologist', sector: 'salud', minAge: 24, minEdu: 3, minSmarts: 60, levels: [
    { title: 'Psicólogo/a junior', salary: 15000 }, { title: 'Psicólogo/a', salary: 28000 }, { title: 'Terapeuta reconocido/a', salary: 52000 }, { title: 'Director/a de clínica', salary: 85000 },
  ] },
  { id: 'pilot', sector: 'transporte', minAge: 24, minEdu: 3, minSmarts: 60, noRecord: true, levels: [
    { title: 'Copiloto', salary: 35000 }, { title: 'Piloto', salary: 65000 }, { title: 'Comandante', salary: 100000 }, { title: 'Jefe/a de pilotos', salary: 140000 },
  ] },
  { id: 'professor', sector: 'educación', minAge: 26, minEdu: 3, minSmarts: 70, levels: [
    { title: 'Ayudante de cátedra', salary: 14000 }, { title: 'Profesor/a adjunto/a', salary: 26000 }, { title: 'Profesor/a titular', salary: 44000 }, { title: 'Decano/a', salary: 72000 },
  ] },
  { id: 'pharmacist', sector: 'salud', minAge: 22, minEdu: 3, minSmarts: 55, levels: [
    { title: 'Auxiliar de farmacia', salary: 15000 }, { title: 'Farmacéutico/a', salary: 27000 }, { title: 'Director/a técnico/a', salary: 44000 }, { title: 'Dueño/a de farmacia', salary: 78000 },
  ] },
  // ── Profesiones de época ──
  { id: 'telegraphist', sector: 'comunicaciones', until: 1978, minAge: 16, minEdu: 1, levels: [
    { title: 'Aprendiz de telégrafo', salary: 9000 }, { title: 'Telegrafista', salary: 13000 }, { title: 'Jefe/a de central', salary: 21000 }, { title: 'Director/a de correos', salary: 36000 },
  ] },
  { id: 'phone_operator', sector: 'comunicaciones', until: 1990, minAge: 16, minEdu: 1, levels: [
    { title: 'Telefonista', salary: 9000 }, { title: 'Supervisor/a de central', salary: 13500 }, { title: 'Jefe/a de línea', salary: 20000 }, { title: 'Gerente de telefonía', salary: 38000 },
  ] },
  { id: 'typist', sector: 'oficina', until: 1998, minAge: 16, minEdu: 1, levels: [
    { title: 'Mecanógrafo/a', salary: 8500 }, { title: 'Secretario/a', salary: 12500 }, { title: 'Secretario/a ejecutivo/a', salary: 19000 }, { title: 'Jefe/a de administración', salary: 32000 },
  ] },
  { id: 'callcenter', sector: 'servicios', since: 1992, until: 2060, minAge: 18, minEdu: 1, levels: [
    { title: 'Operador/a de call center', salary: 9500 }, { title: 'Coordinador/a de turno', salary: 13000 }, { title: 'Supervisor/a de plataforma', salary: 20000 }, { title: 'Gerente de atención', salary: 36000 },
  ] },
  { id: 'community_manager', sector: 'medios', since: 2008, minAge: 18, minEdu: 2, levels: [
    { title: 'Community manager junior', salary: 12000 }, { title: 'Community manager', salary: 18000 }, { title: 'Jefe/a de contenidos', salary: 32000 }, { title: 'Director/a de marca', salary: 60000 },
  ] },
  { id: 'app_delivery', sector: 'transporte', since: 2014, minAge: 18, minEdu: 0, levels: [
    { title: 'Repartidor/a de apps', salary: 8500 }, { title: 'Repartidor/a top', salary: 11000 }, { title: 'Coordinador/a de flota', salary: 17000 }, { title: 'Gerente de operaciones', salary: 32000 },
  ] },
  { id: 'influencer', sector: 'medios', since: 2010, minAge: 16, minEdu: 0, levels: [
    { title: 'Creador/a de contenido', salary: 7000 }, { title: 'Influencer', salary: 22000 }, { title: 'Influencer verificado/a', salary: 60000 }, { title: 'Celebridad de redes', salary: 140000 },
  ] },
  { id: 'data_scientist', sector: 'tecnología', since: 2012, minAge: 22, minEdu: 3, minSmarts: 65, levels: [
    { title: 'Analista de datos', salary: 26000 }, { title: 'Científico/a de datos', salary: 45000 }, { title: 'Líder de datos', salary: 72000 }, { title: 'Director/a de IA', salary: 125000 },
  ] },
  { id: 'prompt_engineer', sector: 'tecnología', since: 2024, minAge: 18, minEdu: 2, levels: [
    { title: 'Entrenador/a de modelos', salary: 15000 }, { title: 'Ingeniero/a de prompts', salary: 30000 }, { title: 'Arquitecto/a de agentes', salary: 55000 }, { title: 'Jefe/a de automatización', salary: 95000 },
  ] },
  { id: 'drone_operator', sector: 'transporte', since: 2030, minAge: 18, minEdu: 2, levels: [
    { title: 'Piloto de drones', salary: 14000 }, { title: 'Operador/a de flotas aéreas', salary: 22000 }, { title: 'Jefe/a de logística aérea', salary: 36000 }, { title: 'Director/a de tráfico aéreo', salary: 62000 },
  ] },
  { id: 'vr_designer', sector: 'medios', since: 2035, minAge: 18, minEdu: 2, levels: [
    { title: 'Modelador/a de mundos virtuales', salary: 16000 }, { title: 'Diseñador/a de experiencias', salary: 30000 }, { title: 'Director/a creativo/a virtual', salary: 55000 }, { title: 'Arquitecto/a de metaversos', salary: 100000 },
  ] },
];
