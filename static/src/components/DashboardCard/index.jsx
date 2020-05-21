import styled from 'styled-components';

export const DashboardCardWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

export const DashboardCard = styled.div`
    width: 100%;
    margin-bottom: 30px;

    @media (min-width: 700px) {
        width: ${(prop) => (prop.width ? prop.width : 'calc(50% - 15px)')};
    }
`;

export const DashboardCardGraph = styled.div`
    overflow: hidden;
`;
