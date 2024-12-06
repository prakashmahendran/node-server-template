import { Endpoint, EndpointMethod, EndpointAuthType } from 'node-server-engine';
import {
  logoutValidator,
  registerValidator,
  loginValidator
} from './auth.validator';
import { registerHandler, loginHandler, logoutHandler } from './auth.handler';

export const registerEndpoint = new Endpoint({
  path: '/auth/register',
  method: EndpointMethod.POST,
  handler: registerHandler,
  authType: EndpointAuthType.NONE,
  validator: registerValidator
});

export const loginEndpoint = new Endpoint({
  path: '/auth/login',
  method: EndpointMethod.POST,
  handler: loginHandler,
  authType: EndpointAuthType.NONE,
  validator: loginValidator
});

export const logoutEndpoint = new Endpoint({
  path: '/auth/logout',
  method: EndpointMethod.POST,
  handler: logoutHandler,
  authType: EndpointAuthType.JWT,
  validator: logoutValidator
});
