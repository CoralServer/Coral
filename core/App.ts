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

import {PluginBridge} from "./plugin/PluginBridge.ts";
import {Plugin1Messages} from "../plugins/plugin1/Plugin1Messages.ts";

interface IPluginJson {
    id: string,
    entry: string,
}

const main = async () => {
    let p: PluginBridge;

    for (const dirEntry of Deno.readDirSync('plugins')) {
        const pluginPath: string = 'plugins/' + dirEntry.name;
        if (dirEntry.isDirectory && Deno.statSync(pluginPath + '/plugin.json')) {
            const jsonData: string = Deno.readTextFileSync(pluginPath + '/plugin.json');
            const pluginJson: IPluginJson = JSON.parse(jsonData);

            const pluginEntryPath: string = pluginPath + '/' + pluginJson.entry;
            p = new PluginBridge(pluginEntryPath);

            p.addMessageListener((msg) => {
                // Log incoming messages from the plugin
                console.log(msg);
            });

            p.send({id: Plugin1Messages.Request, payload: 'f in the chat bois'});

            // Dynamic import lol
            // let w = await import('./' + pluginEntryPath);
            // console.log(w);
        }
    }

    // Server tick
    setInterval(() => {
        // Do nothing rn...
    }, 50);
}

main();