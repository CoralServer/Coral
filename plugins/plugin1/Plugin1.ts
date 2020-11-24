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

import {StreamIPCMessage} from "../../core/plugin/StreamIPC.ts";
import {Plugin1Messages} from "./Plugin1Messages.ts";
import {BasePlugin} from "../../core/plugin/BasePlugin.ts";

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

        setInterval(() => {
            const msg: StreamIPCMessage<Plugin1Messages, number> = {id: Plugin1Messages.Scheduled, payload: this.n++}
            this.send(msg);
        }, 2000);
    }

    /**
     * Method called when receiving a message
     */
    protected onMessage(msg: StreamIPCMessage<any, any>) {
        if (msg.id === Plugin1Messages.Request && msg.payload === 'f in the chat bois') {
            this.send({id: Plugin1Messages.Reply, payload: 'fffffffff'});
        } else {
            this.send({id: Plugin1Messages.Reply, payload: 'no u'});
        }
    }
}

// Start the plugin
new Plugin1();