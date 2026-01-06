import {
  Endpoint,
  EndpointMethod,
  EndpointAuthType
} from 'node-server-engine';
import { publishTestValidator } from './publishTest.validator';
import { publishTestHandler } from './publishTest.handler';

export const publishTestEndpoint = new Endpoint({
  path: '/pubsub/publish',
  method: EndpointMethod.POST,
  handler: publishTestHandler,
  authType: EndpointAuthType.NONE,
  validator: publishTestValidator
});
