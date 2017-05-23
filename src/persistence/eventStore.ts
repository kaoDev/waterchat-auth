import * as esClient from 'eventstore-node';
import * as uuid from 'uuid';
import { UserEvent } from '../events/UserEvents';
import { State } from '../model/State';
import { updateUserState, initialState } from '../logic/StateUpdater';
import { authorizeEvent } from '../logic/UserEventAuthorizer';
import { ReplaySubject } from 'rxjs';

const streamName = 'userEvents';

const host = 'localhost';
const tcpPort = '1113';
const httpPort = '2113';

const connSettings = {};
const esConnection = esClient.createConnection(connSettings, `tcp://${host}:${tcpPort}`);

esConnection.on('connected', tcpEndPoint => {
    if (tcpEndPoint instanceof Error) {
        console.error('got error instead of endpoint object', tcpEndPoint);
    } else if (typeof tcpEndPoint === 'string') {
        console.error('got string instead of endpoint object', tcpEndPoint);
    } else {
        console.log(`Connected to eventstore at ${tcpEndPoint.host}:${tcpEndPoint.port}`);

        const resolveLinkTos = false;

        const credentials = new esClient.UserCredentials('admin', 'changeit');
        esConnection.subscribeToStreamFrom(streamName, 0, resolveLinkTos,
            (subscription, event) => {
                if (event.originalEvent !== undefined && event.originalEvent.data !== undefined) {
                    const parsedEvent = JSON.parse(event.originalEvent.data.toString()) as UserEvent;
                    console.log(parsedEvent);
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

const connected = esConnection.connect();

export async function initEventStoreConnection() {
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
        .flatMap(valid => {
            if (valid) {
                return esConnection.appendToStream(streamName, esClient.expectedVersion.any, storeEvent)
                    .then(result => {
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

const eventStream = new ReplaySubject<UserEvent>(10);

export const userState = new ReplaySubject<State>(1);

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
