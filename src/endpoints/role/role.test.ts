import { expect } from 'chai';
import sinon from 'sinon';
import { createMockRequest, createMockResponse } from 'test/stubs';
import { Role, Permission, RolePermission, Audit } from 'db/models';
import {
  getRoleDetailsHandler,
  getRolesHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
  createPermissionHandler,
  getPermissionsHandler,
  updatePermissionHandler,
  deletePermissionHandler
} from './role.handler';
import {
  ROLE_NOT_FOUND,
  ROLE_CREATION_ERROR,
  ROLE_UPDATE_ERROR,
  ROLE_DELETE_ERROR,
  PERMISSION_NOT_FOUND,
  PERMISSION_CREATION_ERROR,
  PERMISSION_UPDATE_ERROR,
  PERMISSION_DELETE_ERROR,
  ROLE_GET_ERROR
} from './role.const';
import {
  createRoleValidator,
  updateRoleValidator,
  deleteRoleValidator,
  createPermissionValidator,
  updatePermissionValidator,
  deletePermissionValidator
} from './role.validator';

describe('Role Endpoints', () => {
  describe('Role Constants', () => {
    it('should have correct role error messages', () => {
      expect(ROLE_NOT_FOUND).to.equal('Role not found');
      expect(ROLE_CREATION_ERROR).to.equal('Error creating role');
      expect(ROLE_UPDATE_ERROR).to.equal('Error updating role');
      expect(ROLE_DELETE_ERROR).to.equal('Error deleting role');
      expect(ROLE_GET_ERROR).to.equal('Error fetching roles');
    });

    it('should have correct permission error messages', () => {
      expect(PERMISSION_NOT_FOUND).to.equal('Permission not found');
      expect(PERMISSION_CREATION_ERROR).to.equal('Error creating permission');
      expect(PERMISSION_UPDATE_ERROR).to.equal('Error updating permission');
      expect(PERMISSION_DELETE_ERROR).to.equal('Error deleting permission');
    });
  });

  describe('Role Validators', () => {
    it('should have createRoleValidator with name field', () => {
      expect(createRoleValidator.name).to.exist;
      expect(createRoleValidator.name.in).to.equal('body');
      expect(createRoleValidator.permissions).to.exist;
    });

    it('should validate permissions with custom logic', () => {
      expect(createRoleValidator.permissions).to.exist;
      expect(createRoleValidator.permissions.custom).to.exist;
      expect(createRoleValidator.permissions.isArray).to.exist;
    });

    it('should have updateRoleValidator with id param', () => {
      expect(updateRoleValidator.id).to.exist;
      expect(updateRoleValidator.id.in).to.equal('params');
    });

    it('should have deleteRoleValidator with id param', () => {
      expect(deleteRoleValidator.id).to.exist;
      expect(deleteRoleValidator.id.isInt).to.exist;
    });

    it('should have createPermissionValidator with action and groupName', () => {
      expect(createPermissionValidator.action).to.exist;
      expect(createPermissionValidator.groupName).to.exist;
    });

    it('should have updatePermissionValidator with optional action', () => {
      expect(updatePermissionValidator.action).to.exist;
      expect(updatePermissionValidator.action.optional).to.be.true;
    });

    it('should have deletePermissionValidator with action param', () => {
      expect(deletePermissionValidator.action).to.exist;
      expect(deletePermissionValidator.action.in).to.equal('params');
    });
  });

  describe('Role Handlers', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /roles/:roleId - getRoleDetailsHandler', () => {
    it('should return role details with permissions', async () => {
      req.params.roleId = 'role-123';
      const mockRole = {
        id: 'role-123',
        name: 'Admin',
        description: 'Administrator role',
        permissions: [
          { action: 'READ', groupName: 'Users' },
          { action: 'WRITE', groupName: 'Users' }
        ],
        toJSON: function() {
          return {
            id: this.id,
            name: this.name,
            description: this.description,
            permissions: this.permissions
          };
        }
      };

      const findOneStub = sinon.stub(Role, 'findOne').resolves(mockRole as any);

      await getRoleDetailsHandler(req, res);

      expect(findOneStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          id: 'role-123',
          name: 'Admin',
          permissions: sinon.match.array
        })
      );
    });

    it('should return 404 when role not found', async () => {
      req.params.roleId = 'nonexistent-id';
      sinon.stub(Role, 'findOne').resolves(null);

      await getRoleDetailsHandler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: 'Role not found' });
    });

    it('should return 500 on error', async () => {
      req.params.roleId = 'role-123';
      const error = new Error('Database error');
      sinon.stub(Role, 'findOne').rejects(error);

      await getRoleDetailsHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Error fetching role details',
          error
        })
      );
    });
  });

  describe('GET /roles - getRolesHandler', () => {
    it('should return all roles with permissions', async () => {
      const mockRoles = [
        {
          id: '1',
          name: 'Admin',
          description: 'Administrator',
          permissions: [{ action: 'READ', groupName: 'Users' }],
          toJSON: function() {
            return {
              id: this.id,
              name: this.name,
              description: this.description,
              permissions: this.permissions
            };
          }
        },
        {
          id: '2',
          name: 'User',
          description: 'Regular user',
          permissions: [],
          toJSON: function() {
            return {
              id: this.id,
              name: this.name,
              description: this.description,
              permissions: this.permissions
            };
          }
        }
      ];

      const findAllStub = sinon.stub(Role, 'findAll').resolves(mockRoles as any);

      await getRolesHandler(req, res);

      expect(findAllStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledOnce;
    });

    it('should return 500 on error', async () => {
      const error = new Error('Database error');
      sinon.stub(Role, 'findAll').rejects(error);

      await getRolesHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: ROLE_GET_ERROR,
          error
        })
      );
    });
  });

  describe('POST /roles - createRoleHandler', () => {
    it('should create a new role with permissions', async () => {
      req.body = {
        name: 'Manager',
        description: 'Manager role',
        permissions: ['READ', 'WRITE']
      };

      const mockRole = {
        id: 'role-new',
        name: 'Manager',
        description: 'Manager role',
        permissions: []
      };

      const mockPermissions = [
        { id: 'perm-1', action: 'READ' },
        { id: 'perm-2', action: 'WRITE' }
      ];

      const createStub = sinon.stub(Role, 'create').resolves(mockRole as any);
      const findAllStub = sinon.stub(Permission, 'findAll').resolves(mockPermissions as any);
      const bulkCreateStub = sinon.stub(RolePermission, 'bulkCreate').resolves([] as any);
      const auditCreateStub = sinon.stub(Audit, 'create').resolves({} as any);

      await createRoleHandler(req, res);

      expect(createStub).to.have.been.calledOnce;
      expect(findAllStub).to.have.been.calledOnce;
      expect(bulkCreateStub).to.have.been.calledOnce;
      expect(auditCreateStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(201);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Role created successfully'
        })
      );
    });

    it('should return 400 when some permissions are not found', async () => {
      req.body = {
        name: 'Manager',
        permissions: ['READ', 'INVALID_PERMISSION']
      };

      const mockRole = { id: 'role-new', name: 'Manager' };
      const mockPermissions = [{ id: 'perm-1', action: 'READ' }];

      sinon.stub(Role, 'create').resolves(mockRole as any);
      sinon.stub(Permission, 'findAll').resolves(mockPermissions as any);

      await createRoleHandler(req, res);

      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Some permissions were not found',
          missingPermissions: sinon.match.array
        })
      );
    });

    it('should return 500 on creation error', async () => {
      req.body = { name: 'Manager' };
      const error = new Error('Database error');
      sinon.stub(Role, 'create').rejects(error);

      await createRoleHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: ROLE_CREATION_ERROR,
          error
        })
      );
    });
  });

  describe('PUT /roles/:id - updateRoleHandler', () => {
    it('should update role successfully', async () => {
      req.params.id = 'role-123';
      req.body = {
        name: 'Updated Role',
        description: 'Updated description',
        permissions: ['READ']
      };

      const mockRole = {
        id: 'role-123',
        name: 'Old Role',
        description: 'Old description',
        permissions: [],
        set: sinon.stub(),
        save: sinon.stub().resolves()
      };

      const mockPermissions = [{ id: 'perm-1', action: 'READ' }];

      const findByPkStub = sinon.stub(Role, 'findByPk').resolves(mockRole as any);
      sinon.stub(Permission, 'findAll').resolves(mockPermissions as any);
      const destroyStub = sinon.stub(RolePermission, 'destroy').resolves(1);
      const bulkCreateStub = sinon.stub(RolePermission, 'bulkCreate').resolves([] as any);
      const auditCreateStub = sinon.stub(Audit, 'create').resolves({} as any);

      await updateRoleHandler(req, res);

      expect(findByPkStub).to.have.been.calledWith('role-123');
      expect(mockRole.set).to.have.been.calledOnce;
      expect(mockRole.save).to.have.been.calledOnce;
      expect(destroyStub).to.have.been.calledOnce;
      expect(bulkCreateStub).to.have.been.calledOnce;
      expect(auditCreateStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Role updated successfully'
        })
      );
    });

    it('should return 404 when role not found', async () => {
      req.params.id = 'nonexistent-id';
      sinon.stub(Role, 'findByPk').resolves(null);

      await updateRoleHandler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: ROLE_NOT_FOUND });
    });

    it('should return 500 on update error', async () => {
      req.params.id = 'role-123';
      const error = new Error('Database error');
      sinon.stub(Role, 'findByPk').rejects(error);

      await updateRoleHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: ROLE_UPDATE_ERROR,
          error
        })
      );
    });
  });

  describe('DELETE /roles/:id - deleteRoleHandler', () => {
    it('should delete role successfully', async () => {
      req.params.id = 'role-123';
      const mockRole = {
        id: 'role-123',
        name: 'Test Role',
        destroy: sinon.stub().resolves()
      };

      const findByPkStub = sinon.stub(Role, 'findByPk').resolves(mockRole as any);
      const auditCreateStub = sinon.stub(Audit, 'create').resolves({} as any);

      await deleteRoleHandler(req, res);

      expect(findByPkStub).to.have.been.calledWith('role-123');
      expect(auditCreateStub).to.have.been.calledOnce;
      expect(mockRole.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ message: 'Role deleted successfully' });
    });

    it('should return 404 when role not found', async () => {
      req.params.id = 'nonexistent-id';
      sinon.stub(Role, 'findByPk').resolves(null);

      await deleteRoleHandler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: ROLE_NOT_FOUND });
    });

    it('should return 500 on deletion error', async () => {
      req.params.id = 'role-123';
      const error = new Error('Database error');
      sinon.stub(Role, 'findByPk').rejects(error);

      await deleteRoleHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: ROLE_DELETE_ERROR,
          error
        })
      );
    });
  });

  describe('POST /permissions - createPermissionHandler', () => {
    it('should create a new permission', async () => {
      req.body = {
        action: 'DELETE',
        groupName: 'Users',
        description: 'Delete users'
      };

      const mockPermission = {
        id: 'perm-new',
        action: 'DELETE',
        groupName: 'Users',
        description: 'Delete users'
      };

      const createStub = sinon.stub(Permission, 'create').resolves(mockPermission as any);

      await createPermissionHandler(req, res);

      expect(createStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(201);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Permission created successfully',
          permission: sinon.match({
            action: 'DELETE',
            groupName: 'Users'
          })
        })
      );
    });

    it('should return 500 on creation error', async () => {
      req.body = { action: 'DELETE' };
      const error = new Error('Database error');
      sinon.stub(Permission, 'create').rejects(error);

      await createPermissionHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: PERMISSION_CREATION_ERROR,
          error
        })
      );
    });
  });

  describe('GET /permissions - getPermissionsHandler', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { action: 'READ', groupName: 'Users', description: 'Read users' },
        { action: 'WRITE', groupName: 'Users', description: 'Write users' }
      ];

      const findAllStub = sinon.stub(Permission, 'findAll').resolves(mockPermissions as any);

      await getPermissionsHandler(req, res);

      expect(findAllStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ permissions: mockPermissions });
    });

    it('should return 500 on error', async () => {
      const error = new Error('Database error');
      sinon.stub(Permission, 'findAll').rejects(error);

      await getPermissionsHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Error fetching permissions',
          error
        })
      );
    });
  });

  describe('PUT /permissions/:action - updatePermissionHandler', () => {
    it('should update permission successfully', async () => {
      req.params.action = 'READ';
      req.body = {
        groupName: 'Updated Group',
        description: 'Updated description'
      };

      const mockPermission = {
        id: 'perm-123',
        action: 'READ',
        groupName: 'Old Group',
        description: 'Old description',
        set: sinon.stub(),
        save: sinon.stub().resolves()
      };

      const findOneStub = sinon.stub(Permission, 'findOne').resolves(mockPermission as any);
      const auditCreateStub = sinon.stub(Audit, 'create').resolves({} as any);

      await updatePermissionHandler(req, res);

      expect(findOneStub).to.have.been.calledWith({ where: { action: 'READ' } });
      expect(mockPermission.set).to.have.been.calledOnce;
      expect(mockPermission.save).to.have.been.calledOnce;
      expect(auditCreateStub).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(201);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: 'Permission updated successfully'
        })
      );
    });

    it('should return 404 when permission not found', async () => {
      req.params.action = 'NONEXISTENT';
      sinon.stub(Permission, 'findOne').resolves(null);

      await updatePermissionHandler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: PERMISSION_NOT_FOUND });
    });

    it('should return 500 on update error', async () => {
      req.params.action = 'READ';
      const error = new Error('Database error');
      sinon.stub(Permission, 'findOne').rejects(error);

      await updatePermissionHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: PERMISSION_UPDATE_ERROR,
          error
        })
      );
    });
  });

  describe('DELETE /permissions/:action - deletePermissionHandler', () => {
    it('should delete permission successfully', async () => {
      req.params.action = 'READ';
      const mockPermission = {
        id: 'perm-123',
        action: 'READ',
        destroy: sinon.stub().resolves()
      };

      const findOneStub = sinon.stub(Permission, 'findOne').resolves(mockPermission as any);
      const auditCreateStub = sinon.stub(Audit, 'create').resolves({} as any);

      await deletePermissionHandler(req, res);

      expect(findOneStub).to.have.been.calledWith({ where: { action: 'READ' } });
      expect(auditCreateStub).to.have.been.calledOnce;
      expect(mockPermission.destroy).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ message: 'Permission deleted successfully' });
    });

    it('should return 404 when permission not found', async () => {
      req.params.action = 'NONEXISTENT';
      sinon.stub(Permission, 'findOne').resolves(null);

      await deletePermissionHandler(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ message: PERMISSION_NOT_FOUND });
    });

    it('should return 500 on deletion error', async () => {
      req.params.action = 'READ';
      const error = new Error('Database error');
      sinon.stub(Permission, 'findOne').rejects(error);

      await deletePermissionHandler(req, res);

      expect(res.status).to.have.been.calledWith(500);
      expect(res.json).to.have.been.calledWith(
        sinon.match({
          message: PERMISSION_DELETE_ERROR,
          error
        })
      );
    });
  });
  });
});
