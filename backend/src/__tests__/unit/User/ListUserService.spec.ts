import { expect } from 'chai';
import sinon from 'sinon';

import ListUsersService from '../../../services/UserServices/ListUsersService';
import User from '../../../models/User';

import { disconnect, truncate } from "../../utils/database";


describe('ListUsersService', () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
    sinon.restore();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('should list users with searchParam and pageNumber', async () => {
    const searchParam = 'example';
    const pageNumber = 2;

    const users = [
      new User({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        // ... other user attributes
      }),
      new User({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        // ... other user attributes
      }),
      // ... more mock users
    ];

    const count = 30; // Total count of users

    sinon.stub(User, 'findAndCountAll').resolves({ count, rows: users });

    const response = await ListUsersService({ searchParam, pageNumber });

    expect(response.users).to.deep.equal(users);
    expect(response.count).to.equal(count);
    expect(response.hasMore).to.be.true;
  });

  it('should list users without searchParam and pageNumber', async () => {
    const users = [
      new User({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        // ... other user attributes
      }),
      new User({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        // ... other user attributes
      }),
      // ... more mock users
    ];

    const count = 20; // Total count of users

    sinon.stub(User, 'findAndCountAll').resolves({ count, rows: users });

    const response = await ListUsersService({});

    expect(response.users).to.deep.equal(users);
    expect(response.count).to.equal(count);
    expect(response.hasMore).to.be.true;
  });
});
