export default {
  formId: 'checkoutForm',
  formField: {
    firstName: {
      name: 'firstName',
      label: 'Nome completo*',
      requiredErrorMsg: 'O nome completo é obrigatório'
    },
    lastName: {
      name: 'lastName',
      label: 'Last name*',
      requiredErrorMsg: 'Last name is required'
    },
    address1: {
      name: 'address2',
      label: 'Endereço*',
      requiredErrorMsg: 'O Endereço é obrigatório'
    },

    city: {
      name: 'city',
      label: 'Cidade*',
      requiredErrorMsg: 'Cidade é obrigatória'
    },
    state: {
      name: 'state',
      label: 'Estado*',
      requiredErrorMsg: 'Cidade é obrigatória'
    },
    zipcode: {
      name: 'zipcode',
      label: 'CEP*',
      requiredErrorMsg: 'CEP é obrigatório',
      invalidErrorMsg: 'Formato de CEP inválido'
    },
    country: {
      name: 'country',
      label: 'País*',
      requiredErrorMsg: 'País é obrigatório'
    },
    useAddressForPaymentDetails: {
      name: 'useAddressForPaymentDetails',
      label: 'Use this address for payment details'
    },
    invoiceId: {
      name: 'invoiceId',
      label: 'Use this invoiceId'
    },
    nameOnCard: {
      name: 'nameOnCard',
      label: 'Name on card*',
      requiredErrorMsg: 'Name on card is required'
    },
    cardNumber: {
      name: 'cardNumber',
      label: 'Card number*',
      requiredErrorMsg: 'Card number is required',
      invalidErrorMsg: 'Card number is not valid (e.g. 4111111111111)'
    },
    expiryDate: {
      name: 'expiryDate',
      label: 'Expiry date*',
      requiredErrorMsg: 'Expiry date is required',
      invalidErrorMsg: 'Expiry date is not valid'
    },
    cvv: {
      name: 'cvv',
      label: 'CVV*',
      requiredErrorMsg: 'CVV is required',
      invalidErrorMsg: 'CVV is invalid (e.g. 357)'
    }
  }
};
