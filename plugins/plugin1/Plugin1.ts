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
import {ServiceMessage, ServiceMessageID} from '../../core/svc/ServiceMessage.ts';

class Plugin1 extends BasePlugin {
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
     */
    protected onMessage(msg: StreamIPCMessage<any, any>) {
        if (typeof msg.payload.uuid === 'string') {
            const payload: ServiceMessage<number> = msg.payload;
            if (payload.serviceName === 'coral:test.power') {
                this.send<ServiceMessageID, ServiceMessage<number>>({
                    id: ServiceMessageID.SvcResponse,
                    payload: {
                        uuid: payload.uuid,
                        serviceName: payload.serviceName,
                        data: payload.data * payload.data,
                    },
                });
            }
        }
    }
}

// Start the plugin
new Plugin1();
