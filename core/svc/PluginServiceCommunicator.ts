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

import {ServiceMessage, ServiceMessageID} from './ServiceMessage.ts';
import {StreamIPCMessage} from '../ipc/StreamIPCMessage.ts';
import {StreamIPC} from '../ipc/StreamIPC.ts';

interface PendingRequest<T, Ans> {
    message: ServiceMessage<T>,
    resolve: (value: Ans) => void,
}

export class PluginServiceCommunicator {
    /**
     * Map of requests that are still pending
     */
    readonly pendingRequests: Map<string, PendingRequest<any, any>> = new Map<string, PendingRequest<any, any>>();

    /**
     * Function called when a new messages arrives to the communicator
     * @param msg Incoming message
     */
    public onMessage(msg: StreamIPCMessage<ServiceMessageID, ServiceMessage<any>>): void {
        if (typeof msg.payload.uuid === 'string') {
            const pendingRequest: PendingRequest<any, any> | undefined = this.pendingRequests.get(msg.payload.uuid);
            if (pendingRequest !== undefined) {
                // Resolve the request with the response
                pendingRequest.resolve(msg.payload.data);

                this.pendingRequests.delete(msg.payload.uuid);
            }
        }
    }

    /**
     * Sends a Service request through the specified IPC
     * @param ipc Target to reach
     * @param serviceName Name of the service to dispatch the data to
     * @param data Data to dispatch
     */
    public send<T, Ans>(ipc: StreamIPC, serviceName: string, data: T): Promise<Ans> {
        let timeoutPromise: Promise<Ans> = new Promise<Ans>((resolve, reject) => {
            const id = setTimeout(() => {
                // Reject the promise after 5s
                clearTimeout(id);
                reject();
            }, 5000);
        });

        let requestPromise: Promise<Ans> = new Promise<Ans>((resolve, reject) => {
            const message: ServiceMessage<T> = {uuid: v4.generate(), serviceName: serviceName, data: data};

            // Send the request to the plugin
            ipc.send({id: ServiceMessageID.SvcRequest, payload: message})
                .then(() => {
                    this.pendingRequests.set(message.uuid, {
                        message: message,
                        resolve: resolve,
                    });
                })
                .catch(reason => {
                    reject(reason);
                });
        });

        return Promise.race([timeoutPromise, requestPromise]);
    }
}
