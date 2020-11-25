/*
 * Coral - A totally modular Minecraft server made in TypeScript, using Deno as the runtime
 * Copyright (C) 2020 Belminksy, GFoniX, Kuruyia
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {v4} from 'https://deno.land/std@0.79.0/uuid/mod.ts';
import {Deferred, deferred} from 'https://deno.land/std@0.79.0/async/mod.ts';

import {IServiceMessage, ServiceMessageID} from './ServiceMessage.ts';
import {StreamIPCMessage} from '../ipc/StreamIPCMessage.ts';
import {StreamIPC} from '../ipc/StreamIPC.ts';

/**
 * Request that is yet to be responded to
 */
interface PendingRequest {
    /**
     * Message that was sent to the remote
     */
    message: IServiceMessage<any>;

    /**
     * Promise that the requester is holding to get a response
     */
    promise: Deferred<any>;
}

/**
 * Signature of a method used to respond to a service request
 */
type RequestResponder = (serviceName: string, data: any) => Promise<any>;

/**
 * Implements the Service protocol for the core server/a plugin,
 * allows sending and receiving Service messages through a StreamIPC
 */
export class PluginServiceCommunicator {
    /**
     * Map of requests that are still pending
     * @private
     */
    private pendingRequests: Map<string, PendingRequest> = new Map<string,
        PendingRequest>();

    /**
     * Method to call when we get a Service request
     * @private
     */
    private _requestResponder?: RequestResponder;

    /**
     * Setter for the request responder
     * @param value New request responder
     */
    public set requestResponder(value: RequestResponder) {
        this._requestResponder = value;
    }

    /**
     * Sends a Service response
     * @param ipc Target to send the response to
     * @param uuid UUID of the response (must be the same as the request UUID)
     * @param serviceName Name of the requested service
     * @param isError Is the response an error?
     * @param data Response data
     * @private
     */
    private static sendResponse(
        ipc: StreamIPC,
        uuid: string,
        serviceName: string,
        isError: boolean,
        data?: any,
    ): void {
        const message: IServiceMessage<any> = {
            uuid: uuid,
            serviceName: serviceName,
            isError: isError,
            data: data,
        };

        // Send the response to the plugin
        ipc.send({id: ServiceMessageID.SvcResponse, payload: message});
    }

    /**
     * Function called when a new messages arrives to the communicator
     * @param ipc Source of the message
     * @param msg Incoming message
     */
    public onMessage(
        ipc: StreamIPC,
        msg: StreamIPCMessage<ServiceMessageID, IServiceMessage<any>>,
    ): void {
        // We only want to parse Service requests/responses
        if (
            msg.id !== ServiceMessageID.SvcRequest &&
            msg.id !== ServiceMessageID.SvcResponse
        ) {
            return;
        }

        // Check that we've got a UUID
        if (typeof msg.payload.uuid === 'string') {
            if (msg.id === ServiceMessageID.SvcRequest) {
                // Someone from the outside world requested our service, reply to them
                this.handleSvcRequest(ipc, msg);
            } else if (msg.id === ServiceMessageID.SvcResponse) {
                // Response to a pending request, resolve it
                this.handleSvcResponse(msg);
            }
        }
    }

    /**
     * Sends a Service request through the specified IPC
     * @param ipc Target to reach
     * @param serviceName Name of the service to dispatch the data to
     * @param data Data to dispatch
     */
    public send<T, Ans>(
        ipc: StreamIPC,
        serviceName: string,
        data: T,
    ): Promise<Ans> {
        let timeoutPromise: Promise<Ans> = new Promise<Ans>((resolve, reject) => {
            const id = setTimeout(() => {
                // Reject the promise after 5s
                clearTimeout(id);
                reject('Timed out (' + data + ')');
            }, 2000);
        });

        // Now create the request promise
        const requestPromise = deferred<Ans>();
        const message: IServiceMessage<T> = {
            uuid: v4.generate(),
            serviceName: serviceName,
            isError: false,
            data: data,
        };

        // Add the pending request to the map
        this.pendingRequests.set(message.uuid, {
            message: message,
            promise: requestPromise,
        });

        // Send the request to the plugin
        ipc.send({id: ServiceMessageID.SvcRequest, payload: message})
            .catch((reason) => {
                requestPromise.reject(reason);
            });

        return Promise.race([timeoutPromise, requestPromise]);
    }

    /**
     * Function called when we receive a service request
     * @param ipc Source of the message
     * @param msg Incoming message
     * @private
     */
    private handleSvcRequest(
        ipc: StreamIPC,
        msg: StreamIPCMessage<ServiceMessageID, IServiceMessage<any>>,
    ): void {
        if (this._requestResponder !== undefined) {
            // Wait for the answer
            this._requestResponder(msg.payload.serviceName, msg.payload.data)
                .then((value) => {
                    // We got a response from the responder, reply with it
                    PluginServiceCommunicator.sendResponse(
                        ipc,
                        msg.payload.uuid,
                        msg.payload.serviceName,
                        false,
                        value,
                    );
                })
                .catch(() => {
                    // Request responder failed, reply with undefined data
                    PluginServiceCommunicator.sendResponse(
                        ipc,
                        msg.payload.uuid,
                        msg.payload.serviceName,
                        true,
                    );
                });
        } else {
            // We don't have a request responder, reply with undefined data
            PluginServiceCommunicator.sendResponse(
                ipc,
                msg.payload.uuid,
                msg.payload.serviceName,
                true,
            );
        }
    }

    /**
     * Function called when we receive a service response
     * @param msg Incoming message
     * @private
     */
    private handleSvcResponse(
        msg: StreamIPCMessage<ServiceMessageID, IServiceMessage<any>>,
    ): void {
        const pendingRequest: PendingRequest | undefined = this.pendingRequests.get(
            msg.payload.uuid,
        );

        if (pendingRequest !== undefined) {
            // Resolve the request with the response
            if (!msg.payload.isError) {
                pendingRequest.promise.resolve(msg.payload.data);
            } else {
                pendingRequest.promise.reject(msg.payload.data);
            }

            this.pendingRequests.delete(msg.payload.uuid);
        }
    }
}
