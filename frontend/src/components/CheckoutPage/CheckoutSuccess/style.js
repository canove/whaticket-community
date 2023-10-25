import styled from 'styled-components';

export const Container = styled.div`
  footer {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
      .checkout-buttons {
        display: flex;
        flex-direction: column-reverse;
        width: 100%;

        button {
          width: 100%;
          margin-top: 16px;
          margin-left: 0;
        }
      }
    }

    button {
      margin-left: 16px;
    }
  }
`;
export const Total = styled.div`
  display: flex;
  align-items: baseline;

  span {
    color: #333;
    font-weight: bold;
  }

  strong {
    color: #333;
    font-size: 28px;
    margin-left: 5px;
  }

  @media (max-width: 768px) {
    min-width: 100%;
    justify-content: space-between;
  }
`;

export const SuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h2 {
    text-align: center;
  }

  > svg {
    margin-top: 16px;
  }

  > span {
    margin-top: 24px;
    text-align: center;
  }

  > p,
  strong {
    margin-top: 8px;
    font-size: 9px;
    color: #999;
  }

  .copy-button {
    font-size: 14px;
    cursor: pointer;
    text-align: center;
    user-select: none;
    min-height: 56px;
    display: inline-flex;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    background-color: #f9f9f9;
    color: #000;
    -webkit-appearance: none !important;
    outline: none;
    margin-top: 16px;
    width: 256px;
    font-weight: 600;
    text-transform: uppercase;
    border: none;

    > span {
      margin-right: 8px;
    }
  }
`;

export const CheckoutWrapper = styled.div`
  width: 100%;
  margin: 0 auto 0;
  max-width: 1110px;
  display: flex;
  flex-direction: column;
  -webkit-box-align: center;
  align-items: center;
  padding: 50px 95px;
  background: #fff;
  @media (max-width: 768px) {
    padding: 16px 24px;
`;