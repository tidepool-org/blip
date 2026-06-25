import { maxBy, values } from 'lodash';

const getMostRecentEvent = (patient) => {
  const connectionRequests = patient?.connectionRequests;

  const mostRecentConnectionRequest = maxBy(values(connectionRequests).flat(), 'createdTime') ?? null;

  return {
    providerName: mostRecentConnectionRequest?.providerName,
  };
};

export default getMostRecentEvent;
