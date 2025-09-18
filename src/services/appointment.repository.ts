import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export class AppointmentRepository {
  constructor(private dynamoDb: DynamoDBDocumentClient, private tableName: string) {}

  async createAppointment(item: any) {
    await this.dynamoDb.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
  }

  async getAppointmentsByInsuredId(insuredId: string) {
    const result = await this.dynamoDb.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: "insuredId-index",
      KeyConditionExpression: "insuredId = :insuredId",
      ExpressionAttributeValues: {
        ":insuredId": insuredId,
      },
    }));
    return result.Items || [];
  }

  async updateAppointmentStatus(id: string, status: string) {
    await this.dynamoDb.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
    }));
  }
}
