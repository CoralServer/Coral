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

import {BasePlugin} from '../../core/plugin/BasePlugin.ts';
import {ServiceError} from '../../core/svc/ServiceError.ts';

export class Plugin2 extends BasePlugin {
    /**
     * Constructor of this plugin
     */
    public constructor() {
        super();

        this.svcSendRequest(
            'coral:base.log',
            '[Plugin2] Attempting to communicate with Plugin1',
        );
        this.svcSendRequest('coral:test.power', 6)
            .then((value) => {
                this.svcSendRequest(
                    'coral:base.log',
                    '[Plugin2] Got value: ' + value,
                );
            })
            .catch((reason: ServiceError) => {
                this.svcSendRequest(
                    'coral:base.log',
                    '[Plugin2] Err: ' + reason,
                );
            });
    }
}

// Start the plugin
new Plugin2();
