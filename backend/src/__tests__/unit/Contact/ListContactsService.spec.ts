import { expect } from 'chai';

import sinon from 'sinon';

import Contact from "../../../models/Contact";
import ListContactsService from "../../../services/ContactServices/ListContactsService";

import { disconnect, truncate } from "../../utils/database";

describe('ListContactsService', () => {
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

    it('should list contacts with default parameters', async () => {
         // Stub Contact.findAndCountAll method
        const findAndCountAllStub = sinon.stub(Contact, 'findAndCountAll').resolves({
            count: 2,
            rows: [
                new Contact({ id: 1, name: 'John Doe', number: '1234567890', email: "johndoe@email.com" }),
                new Contact({ id: 2, name: 'Jane Smith', number: '9876543210', email: "janesmith@email.com" })
            ]
        });
        
        const response = await ListContactsService({});
        const expectedContacts = [
            { id: 1, name: 'John Doe', number: '1234567890', email: 'johndoe@email.com', isGroup: false },
            { id: 2, name: 'Jane Smith', number: '9876543210', email: 'janesmith@email.com', isGroup: false }
          ];

        const responseContacts = response.contacts.map(contact => contact.toJSON());

        expect(responseContacts).to.deep.equal(expectedContacts);
        expect(response.count).to.equal(2);
        expect(response.hasMore).to.be.false;
    });

    it('should list contacts with searchParam', async () => {
        // Stub Contact.findAndCountAll method
        const findAndCountAllStub = sinon.stub(Contact, 'findAndCountAll').resolves({
          count: 1,
          rows: [
            new Contact({ id: 3, name: 'Alice Johnson', number: '5555555555', email: 'alice@email.com', isGroup: false })
          ]
        });
    
        const response = await ListContactsService({
          searchParam: 'Alice'
        });
    
        const responseContacts = response.contacts.map(contact => contact.toJSON());
        expect(responseContacts).to.deep.equal([
          { id: 3, name: 'Alice Johnson', number: '5555555555', email: 'alice@email.com', isGroup: false }
        ]);

        expect(response.count).to.equal(1);
        expect(response.hasMore).to.be.false;
      });

});