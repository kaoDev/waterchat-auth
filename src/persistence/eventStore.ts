import * as esClient from 'node-eventstore-client';
import { HeartbeatInfo, TcpEndPoint } from 'node-eventstore-client';
import * as uuid from 'uuid';
import { UserEvent } from '../events/UserEvents';
import { State } from '../model/State';
import { updateUserState, initialState } from '../logic/StateUpdater';
import { authorizeEvent } from '../logic/UserEventAuthorizer';
import { ReplaySubject } from 'rxjs';
import dockerHostIp from 'docker-host-ip';

async function getHost() {
    return new Promise<string>((resolve, reject) => {
        dockerHostIp((error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

const streamName = 'userEvents';
const tcpPort = '1113';
const httpPort = '2113';

const connSettings = {};
const esConnection = new Promise<esClient.EventStoreNodeConnection>(async (resolve, reject) => {
    const host = await getHost();

    const connection = esClient.createConnection(connSettings, `tcp://${host}:${tcpPort}`);

    connection.on('connected', tcpEndPoint => {
        if (tcpEndPoint instanceof Error) {
            console.error('got error instead of endpoint object', tcpEndPoint);
        } else if (typeof tcpEndPoint === 'string') {
            console.error('got string instead of endpoint object', tcpEndPoint);
        } else {
            if ((tcpEndPoint as TcpEndPoint).host) {
                console.log(`Connected to eventstore at ${(tcpEndPoint as TcpEndPoint).host}:${(tcpEndPoint as TcpEndPoint).port}`);
            }
            else {
                const endpoint = (tcpEndPoint as HeartbeatInfo).remoteEndPoint;

                console.log(`Connected to eventstore at ${endpoint.host}:${endpoint.port}`);
            }

            const resolveLinkTos = false;

            const credentials = new esClient.UserCredentials('admin', 'changeit');
            connection.subscribeToStreamFrom(streamName, 0, resolveLinkTos,
                (subscription, event) => {
                    if (event.originalEvent !== undefined && event.originalEvent.data !== undefined) {
                        const parsedEvent = JSON.parse(event.originalEvent.data.toString()) as UserEvent;
                        eventStream.next(parsedEvent);
                    }
                },
                (subscription) => {
                    console.log('All events digested, now on livestream');
                },
                (subscription, reason, error) => {
                    console.error('subscription dropped', reason, error);
                },
                credentials
            );
        }
    });

    resolve(connection);
});

export const userState = new ReplaySubject<State>(1);
const eventStream = new ReplaySubject<UserEvent>(10);

userState.subscribe(state => {
    console.log('USER STAT UPDATE');
});

userState.next(initialState);

eventStream
    .withLatestFrom(userState,
    (event, state) => {
        return { state, event };
    })
    .subscribe(async ({ state, event }) => {
        userState.next(updateUserState(state)(event));
    });

export async function initEventStoreConnection() {
    const connection = await esConnection;

    const connected = connection.connect();

    await connected;
    return esConnection;
}

export async function dispatchUserEvent(event: UserEvent) {
    const eventId = uuid.v4();
    const storeEvent = esClient.createJsonEventData(eventId, event, null, event.type);
    console.log('Appending...');

    userState
        .take(1)
        .map(state => authorizeEvent(state)(event))
        .flatMap(async (valid) => {
            if (valid) {
                const connection = await esConnection;

                return connection.appendToStream(streamName, esClient.expectedVersion.any, storeEvent)
                    .then(async (result) => {
                        const host = await getHost();
                        console.log('Stored event:', eventId);
                        console.log(`Look for it at: http://${host}:${httpPort}/web/index.html#/streams/${streamName}`);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            }
            throw new Error('Invalid Event');
        })
        .toPromise()
        .catch((error: Error) => console.error(error));
}
