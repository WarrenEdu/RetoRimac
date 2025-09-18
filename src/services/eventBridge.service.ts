import { EventBridge } from 'aws-sdk';

export class EventBridgeService {
  constructor(private eventBridge: EventBridge) {}

  async sendConfirmation(detail: any) {
    const params = {
      Entries: [
        {
          Source: 'custom.appointment',
          DetailType: 'appointment-confirmation',
          Detail: JSON.stringify(detail)
        }
      ]
    };
    await this.eventBridge.putEvents(params).promise();
  }
}
