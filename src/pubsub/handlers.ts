import { reportDebug, reportInfo } from 'node-server-engine';

const namespace = '~~name~~:pubsub';

/** Shape of the messages handled by this service; adapt it to your events */
export interface SampleMessage {
  type?: string;
  [key: string]: unknown;
}

/**
 * Sample handler for processing incoming Pub/Sub messages
 *
 * @param message - The message payload
 * @param attributes - Message attributes/metadata
 * @param publishedAt - When the message was published
 */
export async function handleSampleMessage(
  message: SampleMessage,
  attributes: Record<string, string>,
  publishedAt: Date
): Promise<void> {
  // Payloads can contain personal data: only log them in debug mode
  reportDebug({
    namespace,
    message: 'Received Pub/Sub message',
    data: { message, attributes, publishedAt }
  });

  // Add your message processing logic here
  // Example: Process event, update database, trigger workflows, etc.

  reportInfo(`Pub/Sub message processed successfully (type: ${message.type ?? 'unknown'})`);
}

/**
 * Add additional message handlers as needed
 * Each handler should be a separate function that can be registered
 * with different subscriptions in initPubSub.ts
 */
export async function handleAnotherMessageType(
  message: SampleMessage,
  _attributes: Record<string, string>,
  _publishedAt: Date
): Promise<void> {
  reportInfo(`Processing another message type: ${message.type ?? 'unknown'}`);
}
