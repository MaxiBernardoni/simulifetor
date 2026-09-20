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
  { id: 'developer', sector: 'tecnología', minAge: 20, minEdu: 3, minSmarts: 60, levels: [
    { title: 'Programador/a junior', salary: 24000 }, { title: 'Programador/a semi senior', salary: 40000 }, { title: 'Senior', salary: 65000 }, { title: 'CTO', salary: 120000 },
  ] },
  { id: 'lawyer', sector: 'legal', minAge: 24, minEdu: 3, minSmarts: 65, noRecord: true, levels: [
    { title: 'Pasante de estudio', salary: 20000 }, { title: 'Abogado/a', salary: 38000 }, { title: 'Socio/a', salary: 80000 }, { title: 'Juez/a', salary: 110000 },
  ] },
  { id: 'doctor', sector: 'salud', minAge: 26, minEdu: 3, minSmarts: 75, noRecord: true, levels: [
    { title: 'Médico/a residente', salary: 26000 }, { title: 'Médico/a', salary: 55000 }, { title: 'Especialista', salary: 95000 }, { title: 'Director/a de hospital', salary: 150000 },
  ] },
];
