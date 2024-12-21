import { Endpoint, EndpointMethod, EndpointAuthType, middleware } from 'node-server-engine';
import {
  createRoleValidator,
  updateRoleValidator,
  deleteRoleValidator,
  createPermissionValidator,
  updatePermissionValidator,
  deletePermissionValidator
} from './role.validator';
import {
  createRoleHandler,
  getRolesHandler,
  updateRoleHandler,
  deleteRoleHandler,
  createPermissionHandler,
  getPermissionsHandler,
  updatePermissionHandler,
  deletePermissionHandler,
  getRoleDetailsHandler
} from './role.handler';

export const getRoleDetailsEndpoint = new Endpoint({
  path: '/roles/:roleId',
  method: EndpointMethod.GET,
  handler: getRoleDetailsHandler,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [middleware.checkPermission('GetRole')]
});

export const getRolesEndpoint = new Endpoint({
  path: '/roles',
  method: EndpointMethod.GET,
  handler: getRolesHandler,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [middleware.checkPermission('GetRole')]
});

export const createRoleEndpoint = new Endpoint({
  path: '/roles',
  method: EndpointMethod.POST,
  handler: createRoleHandler,
  authType: EndpointAuthType.JWT,
  validator: createRoleValidator,
  middleware: [middleware.checkPermission('CreateRole')]
});

export const updateRoleEndpoint = new Endpoint({
  path: '/roles/:id',
  method: EndpointMethod.PUT,
  handler: updateRoleHandler,
  authType: EndpointAuthType.JWT,
  validator: updateRoleValidator,
  middleware: [middleware.checkPermission('UpdateRole')]
});

export const deleteRoleEndpoint = new Endpoint({
  path: '/roles/:id',
  method: EndpointMethod.DELETE,
  handler: deleteRoleHandler,
  authType: EndpointAuthType.JWT,
  validator: deleteRoleValidator,
  middleware: [middleware.checkPermission('DeleteRole')]
});

export const getPermissionsEndpoint = new Endpoint({
  path: '/permissions',
  method: EndpointMethod.GET,
  handler: getPermissionsHandler,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [middleware.checkPermission('GetPermission')]
});

export const createPermissionEndpoint = new Endpoint({
  path: '/permissions',
  method: EndpointMethod.POST,
  handler: createPermissionHandler,
  authType: EndpointAuthType.JWT,
  validator: createPermissionValidator,
  middleware: [middleware.checkPermission('CreatePermission')]
});

export const updatePermissionEndpoint = new Endpoint({
  path: '/permissions/:action',
  method: EndpointMethod.PUT,
  handler: updatePermissionHandler,
  authType: EndpointAuthType.JWT,
  validator: updatePermissionValidator,
  middleware: [middleware.checkPermission('UpdatePermission')]
});

export const deletePermissionEndpoint = new Endpoint({
  path: '/permissions/:action',
  method: EndpointMethod.DELETE,
  handler: deletePermissionHandler,
  authType: EndpointAuthType.JWT,
  validator: deletePermissionValidator,
  middleware: [middleware.checkPermission('DeletePermission')]
});
