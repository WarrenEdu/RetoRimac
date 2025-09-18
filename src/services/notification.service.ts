import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export class NotificationService {
  constructor(private sns: SNSClient, private topicArn: string) {}

  async publishAppointment(data: any) {
    await this.sns.send(new PublishCommand({
      Message: JSON.stringify(data),
      TopicArn: this.topicArn,
      MessageAttributes: {
        countryISO: {
          DataType: "String",
          StringValue: data.countryISO,
        },
      },
    }));
  }
}
