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
import {Utils} from '../Utils.ts';
import {PluginManifestVerifier} from './PluginManifestVerifier.ts';

/**
 * Discovers plugin
 */
export abstract class PluginDiscoverer {
    /**
     * Discover plugins from the filesystem
     * @param discoverPath Path to the directory to discover
     */
    static discoverPlugins(discoverPath: string): Array<IDiscoveredPlugin> {
        let discoveredPlugins: Array<IDiscoveredPlugin> = [];

        // Loop through all the subdirectories of the given path
        for (const dirEntry of Deno.readDirSync(discoverPath)) {
            const pluginPath: string = Path.join(discoverPath, dirEntry.name);
            const infosPath: string = Path.join(pluginPath, 'plugin.json');

            if (dirEntry.isDirectory && Deno.statSync(infosPath)) {
                // This is a valid plugin
                try {
                    discoveredPlugins.push({
                        path: pluginPath,
                        infos: PluginManifestVerifier.convertManifest(Deno.readTextFileSync(infosPath)),
                    });
                } catch (e) {
                    // Unable to load the plugin due to a bad manifest
                    console.error('[PluginDiscoverer] Error while parsing the manifest for plugin: ' + pluginPath);
                    Utils.panic(e);
                }
            }
        }

        // Log discovered plugins
        console.log('[PluginDiscoverer] Discovered ' + discoveredPlugins.length + ' plugins:');
        for (const plugin of discoveredPlugins) {
            console.log('\t- ' + plugin.infos.id);
        }

        return discoveredPlugins;
    }
}
