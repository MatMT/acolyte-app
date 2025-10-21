import { PrismaClient } from '@prisma/client'; // usa output por defecto
const prisma = new PrismaClient();

async function main() {
  // ========== ROLES ==========
  await prisma.users.createMany({
    data: [
      { full_name: 'Carlos Gómez', email: 'coordinador@parroquia.com', password_hash: 'hash1', role: 'coordinador' },
      { full_name: 'Juan Pérez', email: 'juan@parroquia.com', password_hash: 'hash2', role: 'acolito' },
      { full_name: 'Luis Martínez', email: 'luis@parroquia.com', password_hash: 'hash3', role: 'acolito' },
      { full_name: 'Ana López', email: 'ana@parroquia.com', password_hash: 'hash4', role: 'acolito' },
      { full_name: 'María Torres', email: 'maria@parroquia.com', password_hash: 'hash5', role: 'acolito' },
      { full_name: 'José Rivera', email: 'jose@parroquia.com', password_hash: 'hash6', role: 'acolito' },
      { full_name: 'Elena Castro', email: 'elena@parroquia.com', password_hash: 'hash7', role: 'acolito' },
      { full_name: 'Miguel Salinas', email: 'miguel@parroquia.com', password_hash: 'hash8', role: 'acolito' },
      { full_name: 'Rosa Aguilar', email: 'rosa@parroquia.com', password_hash: 'hash9', role: 'acolito' }
    ]
  });

  // ========== EVENTOS ==========
  await prisma.events.createMany({
    data: [
      { title: 'Misa Dominical 1', type: 'ordinaria', description: 'Misa de domingo por la mañana', event_datetime: new Date('2025-10-19T08:00:00'), created_by_id: 1 },
      { title: 'Misa Dominical 2', type: 'ordinaria', description: 'Misa de domingo por la tarde', event_datetime: new Date('2025-10-19T17:00:00'), created_by_id: 1 },
      { title: 'Misa Solemne San Miguel', type: 'solemne', description: 'Celebración especial patronal', event_datetime: new Date('2025-09-29T10:00:00'), created_by_id: 1 }
    ]
  });

  // ========== ASIGNACIONES ==========
  await prisma.event_assignments.createMany({
    data: [
      { event_id: 1, acolyte_id: 2, status: 'asignado' },
      { event_id: 1, acolyte_id: 3, status: 'asignado' },
      { event_id: 1, acolyte_id: 4, status: 'asignado' },
      { event_id: 1, acolyte_id: 5, status: 'asignado' },
      { event_id: 2, acolyte_id: 6, status: 'asignado' },
      { event_id: 2, acolyte_id: 7, status: 'asignado' },
      { event_id: 2, acolyte_id: 8, status: 'asignado' },
      { event_id: 2, acolyte_id: 9, status: 'asignado' },
      { event_id: 3, acolyte_id: 2, status: 'asignado' },
      { event_id: 3, acolyte_id: 3, status: 'asignado' },
      { event_id: 3, acolyte_id: 4, status: 'asignado' },
      { event_id: 3, acolyte_id: 5, status: 'asignado' }
    ]
  });

  // ========== HISTORIAL ==========
  await prisma.assignment_history.createMany({
    data: [
      { assignment_id: 1, changed_by: 2, previous_status: 'asignado', new_status: 'rechazado', change_reason: 'No puede asistir por estudios' },
      { assignment_id: 1, changed_by: 1, previous_status: 'rechazado', new_status: 'reemplazo_propuesto', change_reason: 'Propuesto reemplazo por José Rivera' },
      { assignment_id: 9, changed_by: 6, previous_status: 'asignado', new_status: 'rechazado', change_reason: 'Motivo personal' },
      { assignment_id: 9, changed_by: 1, previous_status: 'rechazado', new_status: 'reemplazo_aceptado', change_reason: 'Elena cubrirá el puesto' }
    ]
  });

  // ========== ASISTENCIAS ==========
  await prisma.event_assignments.updateMany({
    where: { assignment_id: { in: [2,3,4] } },
    data: { attendance_status: 'puntual', attendance_marked_by: 1, attendance_marked_at: new Date(), status: 'asistencia_marcada' }
  });

  await prisma.event_assignments.updateMany({
    where: { assignment_id: { in: [6] } },
    data: { attendance_status: 'tardia', attendance_marked_by: 2, attendance_marked_at: new Date(), status: 'asistencia_marcada' }
  });

  await prisma.event_assignments.updateMany({
    where: { assignment_id: { in: [7,8,10] } },
    data: { attendance_status: 'puntual', attendance_marked_by: 1, attendance_marked_at: new Date(), status: 'asistencia_marcada' }
  });

  // ========== NOTIFICACIONES ==========
  await prisma.notifications.createMany({
    data: [
      { recipient_id: 1, message: 'Juan Pérez ha rechazado su asignación para la Misa Dominical 1', related_event_id: 1 },
      { recipient_id: 6, message: 'Has sido propuesto como reemplazo en la Misa Dominical 1', related_event_id: 1 },
      { recipient_id: 1, message: 'José Rivera fue marcado como tardío en la Misa de la tarde', related_event_id: 2 }
    ]
  });

  console.log('Seeders insertados correctamente!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());