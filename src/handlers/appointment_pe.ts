import { SQSEvent } from 'aws-lambda';
import { EventBridge } from 'aws-sdk';
import { AppointmentRdsRepository } from '../services/appointmentRds.repository';
import { EventBridgeService } from '../services/eventBridge.service';

const eventBridge = new EventBridge();
const rdsConfig = {
    host: process.env.RDS_HOST_PE,
    user: process.env.RDS_USER_PE,
    password: process.env.RDS_PASSWORD_PE,
    database: process.env.RDS_DATABASE_PE
};
const appointmentRepo = new AppointmentRdsRepository(rdsConfig);
const eventBridgeService = new EventBridgeService(eventBridge);

export const handler = async (event: SQSEvent) => {
    try {
        for (const record of event.Records) {
            const appointmentData = JSON.parse(record.body);
            console.log('Processing appointment for PE:', appointmentData);
            const insertId = await appointmentRepo.storeAppointment(appointmentData);
            console.log('Appointment stored in MySQL PE with ID:', insertId);
            await eventBridgeService.sendConfirmation({
                id: insertId,
                insuredId: appointmentData.insuredId,
                scheduleId: appointmentData.scheduleId,
                status: 'completed'
            });
        }
        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        console.error('Error processing SQS message for PE:', error);
        throw error;
    }
};