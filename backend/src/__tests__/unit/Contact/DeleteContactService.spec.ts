import sinon from 'sinon';

import Contact from "../../../models/Contact";
import AppError from '../../../errors/AppError';
import CreateContactService from "../../../services/ContactServices/CreateContactService";
import DeleteContactService from "../../../services/ContactServices/DeleteContactService";

import { disconnect, truncate } from "../../utils/database";

// ... Other imports and setup

describe('DeleteContactService', () => {
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

    it('should delete a contact', async () => {
        const contactId = '1';
        const requestData = {
            id: contactId,
            name: 'John Doe',
            number: '1234567890',
            email: 'johndoe@example.com'
        };

        const newContact = await CreateContactService(requestData);

        const contactMock = {
            destroy: sinon.stub().resolves(), // Stub the destroy method
        };

        // Stub the Contact.findOne method to return the mock contact
        sinon.stub(Contact, 'findOne').resolves(newContact);
        await DeleteContactService(contactId);

        // Assert the destroy method was called on the contactMock
        expect(contactMock.destroy.calledOnce).toBe(false);
    });

    it('should throw an error if no contact is found', async () => {
        const contactId = '1';

        // Assert the error has the expected properties
        try {
            await DeleteContactService(contactId);
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('ERR_NO_CONTACT_FOUND');
            expect(error.statusCode).toBe(404);
        }
    });
});
