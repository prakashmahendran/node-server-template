import { expect } from 'chai';
import { User } from './User';

describe('Models - User', () => {
  it('should never serialize the password hash', () => {
    const user = User.build({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: '$2a$10$hash',
      roleId: 1
    });

    const json = user.toJSON();

    expect(json).to.not.have.property('password');
    expect(json).to.include({ email: 'jane@example.com' });
    expect(JSON.stringify(user)).to.not.include('$2a$10$hash');
    // The model value itself is still available for login checks
    expect(user.password).to.equal('$2a$10$hash');
  });
});
