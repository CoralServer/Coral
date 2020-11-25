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

import {IDiscoveredPlugin} from './IDiscoveredPlugins.ts';
import {PluginBridge} from './PluginBridge.ts';
import {Utils} from '../Utils.ts';

/**
 * Loads discovered plugins
 */
export abstract class PluginLoader {
    /**
     * Launch plugins that were previously discovered
     * @param discoveredPlugins Array of discovered plugins
     */
    public static loadPlugins(
        discoveredPlugins: Array<IDiscoveredPlugin>,
    ): Map<string, PluginBridge> {
        let plugins: Map<string, PluginBridge> = new Map<string, PluginBridge>();

        for (const discoveredPlugin of discoveredPlugins) {
            // Check if the plugin isn't already present
            if (plugins.has(discoveredPlugin.infos.id)) {
                console.error(
                    '[PluginLoader] A plugin with a duplicate id has been found: ' +
                    discoveredPlugin.infos.id,
                );
                Utils.panic('\tPath: ' + discoveredPlugin.path);
            }

            // Check if the entry point is an existing file
            try {
                Deno.lstatSync(
                    Path.join(discoveredPlugin.path, discoveredPlugin.infos.entry),
                );
            } catch (e) {
                Utils.panic('[PluginLoader] Entry point for plugin "' + discoveredPlugin.infos.id + '" does not exist');
            }

            // TODO: Build dependency graph and load plugins in order

            // Launch the plugin
            plugins.set(
                discoveredPlugin.infos.id,
                new PluginBridge(discoveredPlugin),
            );
        }

        // Log success
        console.log('[PluginLoader] All plugins successfully loaded');

        return plugins;
    }
}
