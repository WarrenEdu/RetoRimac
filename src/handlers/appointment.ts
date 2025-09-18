import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";
import { AppointmentRepository } from "../services/appointment.repository";
import { NotificationService } from "../services/notification.service";
import { v4 as uuidv4 } from 'uuid';

const dynamoDbClient = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const sns = new SNSClient({});
const tableName = process.env.DYNAMODB_TABLE || 'Appointments';
const snsTopicArn = process.env.SNS_TOPIC_ARN || '';

const appointmentRepo = new AppointmentRepository(dynamoDb, tableName);
const notificationService = new NotificationService(sns, snsTopicArn);


export const handlePost = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const data = JSON.parse(event.body || '{}');

        if (!data.insuredId || !data.scheduleId || !data.countryISO) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing parameters: insuredId, scheduleId, or countryISO' }),
            };
        }

        if (!['PE', 'CL'].includes(data.countryISO)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid countryISO. Must be "PE" or "CL"' }),
            };
        }

        const appointmentId = uuidv4();
        const item = {
            id: appointmentId,
            insuredId: data.insuredId,
            scheduleId: data.scheduleId,
            countryISO: data.countryISO,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        await appointmentRepo.createAppointment(item);
        await notificationService.publishAppointment({ ...data, id: appointmentId });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Agendamiento en proceso' }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};


export const handleGet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const insuredId = event.pathParameters?.insuredId;
        if (!insuredId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing insuredId parameter in path' }),
            };
        }

        const items = await appointmentRepo.getAppointmentsByInsuredId(insuredId);
        return {
            statusCode: 200,
            body: JSON.stringify(items),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};


const handleSqsEvent = async (event: SQSEvent) => {
    for (const record of event.Records) {
        try {
            const confirmationData = JSON.parse(record.body);
  
            const appointmentData = JSON.parse(confirmationData.body);

            console.log('Updating appointment status for:', appointmentData);

            await appointmentRepo.updateAppointmentStatus(appointmentData.id, 'completed');
            console.log('Appointment status updated to completed:', appointmentData.id);

        } catch (error) {
            console.error('Error processing SQS confirmation message:', error);
        }
    }
};


export const handler = async (event: any): Promise<any> => {
  
    if (event.Records && event.Records[0].eventSource === 'aws:sqs') {
        return handleSqsEvent(event as SQSEvent);
    }

    if (event.httpMethod) {
        if (event.httpMethod === 'POST') {
            return handlePost(event);
        }
        if (event.httpMethod === 'GET') {
            return handleGet(event);
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Unsupported event' }),
    };
};