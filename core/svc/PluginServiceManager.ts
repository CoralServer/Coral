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

import {ServiceManager} from './ServiceManager.ts';
import {PluginBridge} from '../plugin/PluginBridge.ts';
import {PluginServiceCommunicator} from './PluginServiceCommunicator.ts';

/**
 * Service manager that handles requests from/responses to plugins
 */
export class PluginServiceManager extends ServiceManager {
    /**
     * Communicator between the server and plugins through the Service protocol
     */
    readonly serviceCommunicator: PluginServiceCommunicator =
        new PluginServiceCommunicator();

    /**
     * Constructor of the PluginServiceManager class
     */
    constructor() {
        super();

        // Set the request responder of the service communicator
        this.serviceCommunicator.requestResponder = this.onServiceRequest.bind(
            this,
        );
    }

    /**
     * Open services from a map of plugins
     * @param serviceManager Service manager managing the services
     * @param plugins Map of plugin to open services
     */
    public static openFromPlugins(
        serviceManager: PluginServiceManager,
        plugins: Map<string, PluginBridge>,
    ): void {
        console.log('[PluginServiceManager] Opening plugin services...');
        for (const plugin of plugins.values()) {
            serviceManager.openFromPlugin(plugin);
        }

        console.log('[PluginServiceManager] Plugin services ready');
    }

    /**
     * Open services from a plugin
     * @param plugin Plugin to open services
     */
    public openFromPlugin(plugin: PluginBridge): void {
        for (const service of plugin.pluginInfos.services.keys()) {
            this.open(
                service,
                this.serviceCommunicator.send.bind(this.serviceCommunicator, plugin),
            );
        }

        // Add listener to handle svc messages
        plugin.addMessageListener(
            this.serviceCommunicator.onMessage.bind(this.serviceCommunicator, plugin),
        );
    }

    /**
     * Method called when we receive a service request
     * @param serviceName Name of the service that was requested
     * @param data Data of the request
     * @returns The data to reply to this request
     * @protected
     */
    private onServiceRequest(serviceName: string, data: any): Promise<any> {
        return this.dispatch(serviceName, data);
    }
}
