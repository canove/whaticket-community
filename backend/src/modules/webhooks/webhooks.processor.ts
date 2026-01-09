import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import axios from 'axios';

@Processor('webhooks')
export class WebhooksProcessor extends WorkerHost {
    private readonly logger = new Logger(WebhooksProcessor.name);

    async process(job: Job<any, any, string>): Promise<any> {
        const { webhook, event, payload } = job.data;
        this.logger.log(`Processing webhook ${webhook.name} for event ${event}`);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Event': event,
            };

            if (webhook.token) {
                headers['Authorization'] = `Bearer ${webhook.token}`;
            }

            const response = await axios.post(webhook.url, {
                event,
                timestamp: new Date().toISOString(),
                payload,
            }, {
                headers,
                timeout: 5000,
            });

            this.logger.log(`Webhook ${webhook.name} sent successfully. Status: ${response.status}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(`Failed to send webhook ${webhook.name}: ${error.message}`);
            throw error; // Triggers retry
        }
    }
}
