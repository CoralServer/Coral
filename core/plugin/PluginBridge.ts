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

import * as Path from 'https://deno.land/std@0.79.0/path/mod.ts';

import {StreamIPC} from '../ipc/StreamIPC.ts';
import {IPluginInfos} from './IPluginInfos.ts';
import {IDiscoveredPlugin} from './IDiscoveredPlugins.ts';

/**
 * Represents a plugin on the side of the core server,
 * and the ability to communicate with it
 */
export class PluginBridge extends StreamIPC {
    /**
     * Process associated with a plugin
     * @private
     */
    private readonly pluginProcess: Deno.Process;

    /**
     * Infos about this plugin
     * @private
     */
    private readonly _pluginInfos: IPluginInfos;

    /**
     * Constructor for the PluginBridge class
     * @param discoveredPlugin Discovered plugin to launch
     */
    public constructor(discoveredPlugin: IDiscoveredPlugin) {
        super(undefined, undefined);

        // Generate plugin run cmd
        let pluginCmd: Array<string> = ['deno', 'run'];

        // Add permissions
        if (discoveredPlugin.infos.permissions.has('file-read')) {
            pluginCmd.push('--allow-read=./');
        }
        if (discoveredPlugin.infos.permissions.has('file-write')) {
            pluginCmd.push('--allow-write=./');
        }
        if (discoveredPlugin.infos.permissions.has('hrtime')) {
            pluginCmd.push('--allow-hrtime');
        }
        if (discoveredPlugin.infos.permissions.has('network')) {
            pluginCmd.push('--allow-net');
        }

        pluginCmd.push(
            Path.join(discoveredPlugin.path, discoveredPlugin.infos.entry),
        );

        // Launch the subprocess
        this.pluginProcess = Deno.run({
            cmd: pluginCmd,
            stdout: 'piped',
            stdin: 'piped',
        });

        // Update reader & writer
        if (this.pluginProcess.stdout !== null) {
            this.reader = this.pluginProcess.stdout;
        }

        if (this.pluginProcess.stdin !== null) {
            this.writer = this.pluginProcess.stdin;
        }

        // Start receiving
        this.recv();

        this._pluginInfos = discoveredPlugin.infos;
    }

    /**
     * Getter for the plugin information
     */
    get pluginInfos(): IPluginInfos {
        return this._pluginInfos;
    }
}
