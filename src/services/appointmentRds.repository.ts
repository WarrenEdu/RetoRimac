import mysql, { ResultSetHeader } from 'mysql2/promise';

export class AppointmentRdsRepository {
  constructor(private config: any) {}

  async storeAppointment(appointmentData: any) {
    const connection = await mysql.createConnection(this.config);
    const sched = appointmentData.scheduleId;
    const [rows] = await connection.execute(
      `INSERT INTO appointments (insuredId, scheduleId, centerId, specialtyId, medicId, date, countryISO) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentData.insuredId,
        sched.id,
        sched.centerId,
        sched.specialtyId,
        sched.medicId,
        sched.date,
        appointmentData.countryISO
      ]
    );
    await connection.end();
    return (rows as ResultSetHeader).insertId;
  }
}
