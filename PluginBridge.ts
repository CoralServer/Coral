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

import {StreamIPC} from "./StreamIPC.ts";

export class PluginBridge extends StreamIPC {
    /**
     * Process associated with a plugin
     * @private
     */
    private readonly pluginProcess: Deno.Process;

    /**
     * Constructor for the PluginBridge class
     * @param path Path to the entry file of the plugin to launch
     */
    public constructor(path: string) {
        super(undefined, undefined);

        // Launch the subprocess
        this.pluginProcess = Deno.run({
            cmd: [
                'deno',
                'run',
                path
            ],
            stdout: 'piped',
            stdin: 'piped'
        });

        // Update reader & writer
        if (this.pluginProcess.stdout !== null)
            this.reader = this.pluginProcess.stdout;

        if (this.pluginProcess.stdin !== null)
            this.writer = this.pluginProcess.stdin;

        // Start receiving
        this.recv();
    }
}