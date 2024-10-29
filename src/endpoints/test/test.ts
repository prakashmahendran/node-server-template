import {
  Endpoint,
  EndpointMethod,
  EndpointAuthType,
  EndpointRequestType,
  EndpointHandler
} from 'node-server-engine';
import { Response } from 'express';
import { testValidator } from './test.validator';

const handler: EndpointHandler<EndpointAuthType> = (
  req: EndpointRequestType[EndpointAuthType],
  res: Response
) => {
  res.send('Test Message');
};


export const testEndpoint = new Endpoint({
  path: '/',
  method: EndpointMethod.GET,
  handler,
  authType: EndpointAuthType.JWT,
  validator: testValidator
});
