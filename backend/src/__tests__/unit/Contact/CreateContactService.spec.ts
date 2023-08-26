import { expect } from 'chai';
import sinon from 'sinon';

import AppError from "../../../errors/AppError";
import Contact from "../../../models/Contact";
import CreateContactService from "../../../services/ContactServices/CreateContactService";

import { disconnect, truncate } from "../../utils/database";

describe('CreateContactService', () => {
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

    it('should create a new contact', async () => {
        const fakeContact = {
            id: 1,
            name: 'John Doe',
            number: '1234567890',
            email: 'johndoe@example.com',
            extraInfo: []
        };

        const requestData = {
            name: 'John Doe',
            number: '1234567890',
            email: 'johndoe@example.com'
        };

        const result = await CreateContactService(requestData);

        expect(result.id).to.deep.equal(fakeContact.id);
        expect(result.email).to.deep.equal(fakeContact.email);
        expect(result.name).to.deep.equal(fakeContact.name);
        expect(result.number).to.deep.equal(fakeContact.number);
    });

    it('should throw an error for duplicated contact', async () => {

        const stubbedContact = new Contact({
            id: 1,
            name: 'John Doe',
            number: '1234567890',
            email: 'johndoe@example.com'
        })

        const findOneStub = sinon.stub(Contact, 'findOne').resolves(stubbedContact);

        const requestData = {
            name: 'John Doe',
            number: '1234567890',
            email: 'johndoe@example.com'
        };

        try {
            await CreateContactService(requestData);
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.message).to.equal('ERR_DUPLICATED_CONTACT');
        }

        sinon.assert.calledOnce(findOneStub);
    });
});
