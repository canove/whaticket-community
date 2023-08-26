import { expect } from 'chai';
import sinon from 'sinon';

import CreateUserService from '../../../services/UserServices/CreateUserService';
import AppError from '../../../errors/AppError';
import { disconnect, truncate } from "../../utils/database";


describe('CreateUserService', () => {
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

  it('should create a new user successfully', async () => {
    const validRequest = {
      email: 'test@example.com',
      password: 'password',
      name: 'John Doe',
    };

    const fakeUser = {
      id: 1,
      ...validRequest,
      profile: 'admin',
      queues: [],
      reload: sinon.stub().resolves(),
      setQueues: sinon.stub().resolves(),
    };

    fakeUser.reload.resolves();

    const result = await CreateUserService(validRequest);

    expect(result).to.deep.equal({
      email: fakeUser.email,
      name: fakeUser.name,
      id: fakeUser.id,
      profile: fakeUser.profile,
      queues: [],
      whatsapp: null
    });
  });

  it('should throw an error if email already exists', async () => {
    const existingEmail = 'existing@example.com';
    const requestWithExistingEmail = {
      email: existingEmail,
      password: 'password',
      name: 'Jane Doe',
    };

    try {
      await CreateUserService(requestWithExistingEmail);
    } catch (error) {
      expect(error).to.be.instanceOf(AppError);
      expect(error.message).to.equal('An user with this email already exists.');
    }
  });

  it('should throw an error if validation fails', async () => {
    const invalidRequest = {
      email: 'invalidemail',
      password: 'short',
      name: '',
    };

    try {
      await CreateUserService(invalidRequest);
    } catch (error) {
      expect(error).to.be.instanceOf(AppError);
    }
  });
});
