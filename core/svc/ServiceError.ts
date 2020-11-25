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

/**
 * ID of possible communication errors
 */
import {StreamIPCError} from '../ipc/StreamIPCError.ts';

export enum ServiceErrorID {
    /**
     * The core server could not find the specified service name
     */
    ServiceNotFoundError = 0xF100,

    /**
     * The handler for the specified service name did not handle the service
     */
    ServiceNotHandledError,

    /**
     * The request has timed-out
     */
    RequestTimeoutError,
}

/**
 * ID of all the possible errors in the communication chain
 */
export type ServiceError = ServiceErrorID | StreamIPCError;
