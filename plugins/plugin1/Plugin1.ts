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

import {StreamIPCMessage} from '../../core/ipc/StreamIPCMessage.ts';
import {BasePlugin} from '../../core/plugin/BasePlugin.ts';

export class Plugin1 extends BasePlugin {
    /**
     * Some member variable...
     * @private
     */
    private n: number = 0;

    /**
     * Constructor of this plugin
     */
    public constructor() {
        super();
    }

    /**
     * Method called when receiving a message
     * @protected
     */
    protected onMessage(msg: StreamIPCMessage<any, any>): void {
        // console.error(JSON.stringify(msg));
    }

    /**
     * Method called when we receive a service request
     * @param serviceName Name of the service that was requested
     * @param data Data of the request
     * @returns The data to reply to this request
     * @protected
     */
    protected onServiceRequest(serviceName: string, data: any): Promise<any> {
        if (serviceName === 'coral:test.power') {
            return new Promise<any>(resolve => {
                resolve(data * data);
            });
        }

        // No such service, send a rejected promise
        return Promise.reject();
    }
}

// Start the plugin
new Plugin1();
