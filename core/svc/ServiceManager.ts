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

import {ServiceHandler} from './ServiceHandler.ts';

/**
 * Basic service manager
 * Maps a service name to a callback managing the specified service
 */
export class ServiceManager {
    /**
     * Map of opened services
     * @private
     */
    protected services: Map<string, ServiceHandler<any, any>> = new Map<string,
        ServiceHandler<any, any>>();

    /**
     * Opens a new service
     * @param serviceName Name of the service to open
     * @param handler Handler to call when a message has been dispatched to this service
     */
    public open(serviceName: string, handler: ServiceHandler<any, any>): void {
        this.services.set(serviceName, handler);
    }

    /**
     * Closes an opened service
     * @param serviceName Name of the service to close
     */
    public close(serviceName: string): void {
        this.services.delete(serviceName);
    }

    /**
     * Dispatches a message to the specified service
     * @param serviceName Name of the service to send a message to
     * @param data Data to send to the service
     */
    public dispatch(serviceName: string, data: any): Promise<any> {
        const service: ServiceHandler<any, any> | undefined = this.services.get(
            serviceName,
        );
        if (service !== undefined) {
            return service(serviceName, data);
        }

        // Return a rejected promise if we can't find the service name
        return Promise.reject();
    }
}
