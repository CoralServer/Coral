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

import {PluginBridge} from './plugin/PluginBridge.ts';
import {PluginDiscoverer} from './plugin/PluginDiscoverer.ts';
import {PluginLoader} from './plugin/PluginLoader.ts';
import {PluginServiceManager} from './svc/PluginServiceManager.ts';

const APP_VERSION: string = '0.1.0';

/**
 * Core server application
 */
abstract class App {
    /**
     * The main() method of the core server
     */
    public static main(): void {
        console.log('Starting Coral server version ' + APP_VERSION);

        // Discover and load plugins from the plugins/ directory
        const discoveredPlugins = PluginDiscoverer.discoverPlugins('./plugins');
        const plugins: Map<string, PluginBridge> = PluginLoader.loadPlugins(
            discoveredPlugins,
        );

        // Start services
        const pluginServiceManager: PluginServiceManager = new PluginServiceManager();

        // Local services
        pluginServiceManager.open(
            'coral:base.log',
            (serviceName: string, data: string) => {
                return new Promise<void>((resolve) => {
                    console.log(data);
                    resolve();
                });
            },
        );

        pluginServiceManager.open('coral:base.ping', (serviceName, data: any) => {
            return new Promise<any>((resolve) => {
                resolve(data);
            });
        });

        // Plugin services
        PluginServiceManager.openFromPlugins(pluginServiceManager, plugins);

        // Test services
        pluginServiceManager.dispatch('coral:test.power', 5)
            .then((value) => {
                console.log('Message dispatched: ' + value);
            })
            .catch((reason) => {
                console.error('Message NOT dispatched');
            });

        // Test plugin communication
        // for (const plugin of plugins.values()) {
        //     plugin.addMessageListener(msg => {
        //         console.log(msg);
        //     });
        // }

        // Server tick
        setInterval(() => {
            // Do nothing rn...
        }, 50);
    }
}

// It all starts here
App.main();
