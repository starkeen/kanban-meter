import styled from 'styled-components';

const Input = styled.input`
    width: 100%;
    height: 36px;
    padding: 6px;
    border: 1px solid rgb(224, 224, 224);
    box-sizing: border-box;
    color: #000;
    font-size: 14px;
    outline: none;

    &:focus {
        border-color: rgb(0, 188, 212);
    }
`;

export default Input;
