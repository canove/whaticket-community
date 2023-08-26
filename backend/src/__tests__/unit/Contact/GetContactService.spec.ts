import sinon from 'sinon';
import { expect } from 'chai';

import Contact from "../../../models/Contact";
import AppError from '../../../errors/AppError';
import GetContactService from "../../../services/ContactServices/GetContactService";

import { disconnect, truncate } from "../../utils/database";

describe('GetContactService', () => {
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

    it('should return existing contact when contact number exists', async () => {
        const number = '1234567890';
        const existingContact = new Contact({
            id: 1,
            name: 'John Doe',
            number,
            email: 'johndoe@email.com',
            profilePicUrl: 'profile.jpg',
            extraInfo: [],
        });

        sinon.stub(Contact, 'findOne').resolves(existingContact);

        const result = await GetContactService({ name: '', number });
        expect(result).to.deep.equal(existingContact);
    });

    it('should throw AppError when creating contact fails', async () => {
        const number = '9876543210';

        try {
            await GetContactService({ name: 'Jane Smith', number });
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.message).to.equal('CONTACT_NOT_FIND');
        }
    });
});
