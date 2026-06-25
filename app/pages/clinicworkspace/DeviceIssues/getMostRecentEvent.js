import { maxBy, values } from 'lodash';

const getMostRecentEvent = (patient) => {
  const connectionRequests = patient?.connectionRequests;

  const mostRecentConnectionRequest = maxBy(values(connectionRequests).flat(), 'createdTime') ?? null;

  return {
    type: 'CONNECTION_REQUEST',
    providerName: mostRecentConnectionRequest?.providerName,
    time: mostRecentConnectionRequest?.createdTime,
  };
};

export default getMostRecentEvent;
