import { expect } from 'chai';
import { hash } from "bcryptjs";
import sinon from 'sinon';

import AppError from "../../../errors/AppError";
import * as ShowUserService from '../../../services/UserServices/ShowUserService'; // Import using * as

import UpdateUserService from "../../../services/UserServices/UpdateUserService";
import User from '../../../models/User';
import { disconnect, truncate } from "../../utils/database";


describe('UpdateUserService', () => {
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

  it('should update user information', async () => {
    const userId = 1;
    const userData = {
      email: 'newemail@example.com',
      name: 'New Name',
      profile: 'user',
      password: 'updatingOldPassword',
    };

    const hashedPassword = await hash('thisIsAPassword', 8); // Hash the password

    const user = new User({
      id: userId,
      name: 'Old Name',
      email: 'oldemail@example.com',
      profile: 'admin',
      password: 'thisIsAPassword',
      passwordHash: hashedPassword,
      // ... other user attributes
    });

    // Stub the methods used in UpdateUserService
    const setQueuesStub = sinon.stub(user, '$set').resolves();

    // Stub ShowUserService to return the user object
    sinon.stub(ShowUserService, 'default').resolves(user);

    const response = await UpdateUserService({
      userData,
      userId,
    });

    expect(response).to.deep.equal({
      id: user.id,
      name: userData.name,
      email: userData.email,
      profile: userData.profile,
      queues: undefined,
      whatsapp: undefined,
    });

    sinon.assert.calledWith(setQueuesStub, 'queues', []);
  });

  it('should throw error if validation fails', async () => {
    const userId = 1;
    const userData = {
      email: 'invalidemail',
    };

    const user = new User({
      id: userId,
      name: 'Old Name',
      email: 'oldemail@example.com',
      profile: 'admin',
      // ... other user attributes
    });

    sinon.stub(ShowUserService, 'default').resolves(user);

    try {
      await UpdateUserService({
        userData,
        userId,
      });
    } catch (error) {
      expect(error).to.be.instanceOf(AppError);
    }
  });

  it('should throw error if user is not found', async () => {
    const userId = 1;
    const userData = {
      email: 'newemail@example.com',
      name: 'New Name',
      profile: 'user',
    };

    try {
      await UpdateUserService({
        userData,
        userId,
      });
    } catch (error) {
      expect(error).to.be.instanceOf(AppError);
    }
  });
});
