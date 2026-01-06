import {
  EndpointAuthType,
  EndpointRequestType,
  EndpointHandler,
  PubSub
} from 'node-server-engine';
import { Response } from 'express';
import {
  PUBSUB_DISABLED,
  PUBSUB_NOT_CONFIGURED,
  PUBSUB_PUBLISH_SUCCESS,
  PUBSUB_PUBLISH_ERROR
} from './publishTest.const';

export const publishTestHandler: EndpointHandler<EndpointAuthType.NONE> = async (
  req: EndpointRequestType[EndpointAuthType.NONE],
  res: Response
) => {
  // Check if Pub/Sub is enabled
  if (process.env.ENABLE_PUBSUB?.toLowerCase() !== 'true') {
    res.status(400).json({
      success: false,
      message: PUBSUB_DISABLED
    });
    return;
  }

  if (!process.env.PUBSUB_TOPIC) {
    res.status(400).json({
      success: false,
      message: PUBSUB_NOT_CONFIGURED
    });
    return;
  }

  const { message, data } = req.body;

  const payload = {
    message,
    data: data || {},
    timestamp: new Date().toISOString(),
    service: process.env.CHART || 'unknown'
  };

  try {
    await PubSub.publish(
      process.env.PUBSUB_TOPIC,
      payload
    );

    res.json({
      success: true,
      message: PUBSUB_PUBLISH_SUCCESS,
      payload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: PUBSUB_PUBLISH_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
