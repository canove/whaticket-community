import { expect } from 'chai';
import sinon from 'sinon';

import AppError from "../../../errors/AppError";
import User from "../../../models/User";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import ShowUserService from "../../../services/UserServices/ShowUserService";
import { disconnect, truncate } from "../../utils/database";


describe('ShowUserService', () => {
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

  it('should show user by id', async () => {
    const userId = 1;

    const user = new User({
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      // ... other user attributes
    });

    sinon.stub(User, 'findByPk').resolves(user);

    const response = await ShowUserService(userId);

    expect(response).to.deep.equal(user);
  });

  it('should throw error when user is not found', async () => {
    const userId = 1;

    try {
      await ShowUserService(userId);
    } catch (error) {
      expect(error).to.be.instanceOf(AppError);
      expect(error.statusCode).to.equal(404);
      expect(error.message).to.equal('ERR_NO_USER_FOUND');
    }
  });
});
