import { SQSEvent } from 'aws-lambda';
import { EventBridge } from 'aws-sdk';
import { AppointmentRdsRepository } from '../services/appointmentRds.repository';
import { EventBridgeService } from '../services/eventBridge.service';

const eventBridge = new EventBridge();
const rdsConfig = {
    host: process.env.RDS_HOST_CL,
    user: process.env.RDS_USER_CL,
    password: process.env.RDS_PASSWORD_CL,
    database: process.env.RDS_DATABASE_CL
};
const appointmentRepo = new AppointmentRdsRepository(rdsConfig);
const eventBridgeService = new EventBridgeService(eventBridge);

export const handler = async (event: SQSEvent) => {
    try {
        for (const record of event.Records) {
            const appointmentData = JSON.parse(record.body);
            console.log('Processing appointment for CL:', appointmentData);
            const insertId = await appointmentRepo.storeAppointment(appointmentData);
            console.log('Appointment stored in MySQL CL with ID:', insertId);
            await eventBridgeService.sendConfirmation({
                id: insertId,
                insuredId: appointmentData.insuredId,
                scheduleId: appointmentData.scheduleId,
                status: 'completed'
            });
        }
        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        console.error('Error processing SQS message for CL:', error);
        throw error;
    }
};