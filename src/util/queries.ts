
// queries.ts
import { gql } from '@apollo/client';

export const INITIAL_FETCH_QUERY = gql`
  query {
    initialFetch {
      vehicles {
        id
        firstName
        lastName
        email
        carMake
        carModel
        vin
        manufacturedDate
        ageOfVehicle
      }
      pageCount
    }
  }
`;
