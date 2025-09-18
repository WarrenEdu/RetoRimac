import mysql, { ResultSetHeader } from 'mysql2/promise';

export class AppointmentRdsRepository {
  constructor(private config: any) {}

  async storeAppointment(appointmentData: any) {
    const connection = await mysql.createConnection(this.config);
    const [rows] = await connection.execute(
      `INSERT INTO appointments (insuredId, scheduleId, countryISO) VALUES (?, ?, ?)`,
      [appointmentData.insuredId, appointmentData.scheduleId, appointmentData.countryISO]
    );
    await connection.end();
    return (rows as ResultSetHeader).insertId;
  }
}
