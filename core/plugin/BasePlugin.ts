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

import {StreamIPC} from '../ipc/StreamIPC.ts';
import {StreamIPCMessage} from '../ipc/StreamIPCMessage.ts';
import {PluginServiceCommunicator} from '../svc/PluginServiceCommunicator.ts';

export abstract class BasePlugin extends StreamIPC {
    /**
     * Communicator between the plugin and the server through the Service protocol
     */
    protected pluginServiceCommunicator: PluginServiceCommunicator = new PluginServiceCommunicator();

    /**
     * Constructor for the BasePlugin base class
     * @protected
     */
    protected constructor() {
        super(Deno.stdin, Deno.stdout);

        // Register message handler
        this.addMessageListener(this.onMessage.bind(this));

        // Setup the service communicator
        this.addMessageListener(this.pluginServiceCommunicator.onMessage.bind(this.pluginServiceCommunicator, this));
        this.pluginServiceCommunicator.requestResponder = this.onServiceRequest.bind(this);

        // Start receiving
        this.recv();
    }

    /**
     * Method called when receiving a message
     * @protected
     */
    protected onMessage(msg: StreamIPCMessage<any, any>): void {
    }

    /**
     * Method called when we receive a service request
     * @param serviceName Name of the service that was requested
     * @param data Data of the request
     * @returns The data to reply to this request
     * @protected
     */
    protected onServiceRequest(serviceName: string, data: any): Promise<any> {
        return Promise.reject();
    }
}
