import { expect } from 'chai';
import { fake } from 'sinon';
import request from 'supertest';
import express from 'express';
import { server } from 'test';
import { randomUUID } from 'crypto';
import { generateAccessToken, jwtRequest } from 'backend-test-tools';
import {
  ROLE_NOT_FOUND,
  ROLE_CREATION_ERROR,
  ROLE_UPDATE_ERROR,
  ROLE_DELETE_ERROR
} from './role.const';
import {
  getRolesEndpoint,
  getRoleDetailsEndpoint,
  createRoleEndpoint,
  updateRoleEndpoint,
  deleteRoleEndpoint
} from './role';
import { Endpoint, EndpointMethod } from 'node-server-engine';

let app: express.Express;

describe('Role Endpoints', () => {
  beforeEach(() => {
    app = express();
  });

  // GET /roles
  describe('GET /roles', () => {
    it('should return a list of roles', async () => {
      //   const token = generateAccessToken(randomUUID(), 'Admin'); // Valid JWT with Admin role
      //   const response = await request(app)
      //     .get('/roles')
      //     .set('Authorization', 'Bearer ' + token);
      //   expect(response.status).to.equal(200);
      //   expect(response.body).to.be.an('array');
      const request = jwtRequest(server.getApp(), EndpointMethod.GET, '/roles');

     const response = await request('1');
     console.log('Response:', response.body);
        // .then((response) => {
        //   console.log('Response:', response.body); // Logs the response body
        // })
        // .catch((error) => {
        //   console.error('Error:', error); // Logs the error
        // });
    });

    //     it('should return 500 when there is an error fetching roles', async () => {
    //       const errorHandler = fake.throws(new Error(ROLE_CREATION_ERROR));
    //       const response = await request(app).get('/roles');
    //       expect(response.status).to.equal(500);
    //       expect(response.body.message).to.equal(ROLE_CREATION_ERROR);
    //     });
    //   });

    //   // GET /roles/:roleId
    //   describe('GET /roles/:roleId', () => {
    //     it('should return role details', async () => {
    //       const roleId = 1; // Example role ID
    //       const token = generateAccessToken(randomUUID(), 'Admin'); // Valid token with Admin role
    //       const response = await request(app)
    //         .get(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token);
    //       expect(response.status).to.equal(200);
    //       expect(response.body).to.have.property('id').that.equals(roleId);
    //     });

    //     it('should return 404 when the role is not found', async () => {
    //       const roleId = 999; // Non-existent role ID
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .get(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token);
    //       expect(response.status).to.equal(404);
    //       expect(response.body.message).to.equal('Role not found');
    //     });

    //     it('should return 500 when there is an error fetching the role details', async () => {
    //       const roleId = 1;
    //       const errorHandler = fake.throws(new Error(ROLE_NOT_FOUND));
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .get(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token);
    //       expect(response.status).to.equal(500);
    //       expect(response.body.message).to.equal('Error fetching role details');
    //     });
    //   });

    //   // POST /roles
    //   describe('POST /roles', () => {
    //     it('should create a new role', async () => {
    //       const newRole = {
    //         name: 'Admin',
    //         description: 'Admin role with all permissions',
    //         permissions: ['READ', 'WRITE']
    //       };
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .post('/roles')
    //         .set('Authorization', 'Bearer ' + token)
    //         .send(newRole);
    //       expect(response.status).to.equal(201);
    //       expect(response.body.message).to.equal('Role created successfully');
    //       expect(response.body.role).to.have.property('id');
    //     });

    //     it('should return 400 when permissions are missing', async () => {
    //       const newRole = {
    //         name: 'Admin',
    //         description: 'Admin role with no permissions'
    //       };
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .post('/roles')
    //         .set('Authorization', 'Bearer ' + token)
    //         .send(newRole);
    //       expect(response.status).to.equal(400);
    //       expect(response.body.message).to.include(
    //         'Some permissions were not found'
    //       );
    //     });

    //     it('should return 500 when there is an error during role creation', async () => {
    //       const newRole = {
    //         name: 'Admin',
    //         description: 'Admin role with all permissions',
    //         permissions: ['READ', 'WRITE']
    //       };
    //       const errorHandler = fake.throws(new Error(ROLE_CREATION_ERROR));
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .post('/roles')
    //         .set('Authorization', 'Bearer ' + token)
    //         .send(newRole);
    //       expect(response.status).to.equal(500);
    //       expect(response.body.message).to.equal(ROLE_CREATION_ERROR);
    //     });
    //   });

    //   // PUT /roles/:id
    //   describe('PUT /roles/:id', () => {
    //     it('should update the role', async () => {
    //       const updatedRole = {
    //         name: 'Super Admin',
    //         description: 'Super Admin role with all permissions',
    //         permissions: ['READ', 'WRITE', 'DELETE']
    //       };
    //       const roleId = 1; // Example role ID
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .put(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token)
    //         .send(updatedRole);
    //       expect(response.status).to.equal(200);
    //       expect(response.body.message).to.equal('Role updated successfully');
    //     });

    //     it('should return 404 when the role is not found', async () => {
    //       const roleId = 999; // Non-existent role ID
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .put(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token)
    //         .send({ name: 'Super Admin' });
    //       expect(response.status).to.equal(404);
    //       expect(response.body.message).to.equal(ROLE_NOT_FOUND);
    //     });

    //     it('should return 500 when there is an error during role update', async () => {
    //       const roleId = 1; // Example role ID
    //       const updatedRole = { name: 'Super Admin' };
    //       const errorHandler = fake.throws(new Error(ROLE_UPDATE_ERROR));
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .put(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token)
    //         .send(updatedRole);
    //       expect(response.status).to.equal(500);
    //       expect(response.body.message).to.equal(ROLE_UPDATE_ERROR);
    //     });
    //   });

    //   // DELETE /roles/:id
    //   describe('DELETE /roles/:id', () => {
    //     it('should delete the role', async () => {
    //       const roleId = 1; // Example role ID
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .delete(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token);
    //       expect(response.status).to.equal(200);
    //       expect(response.body.message).to.equal('Role deleted successfully');
    //     });

    //     it('should return 404 when the role is not found', async () => {
    //       const roleId = 999; // Non-existent role ID
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .delete(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token);
    //       expect(response.status).to.equal(404);
    //       expect(response.body.message).to.equal(ROLE_NOT_FOUND);
    //     });

    //     it('should return 500 when there is an error during role deletion', async () => {
    //       const roleId = 1; // Example role ID
    //       const errorHandler = fake.throws(new Error(ROLE_DELETE_ERROR));
    //       const token = generateAccessToken(randomUUID(), 'Admin');
    //       const response = await request(app)
    //         .delete(`/roles/${roleId}`)
    //         .set('Authorization', 'Bearer ' + token);
    //       expect(response.status).to.equal(500);
    //       expect(response.body.message).to.equal(ROLE_DELETE_ERROR);
    //     });
  });
});
