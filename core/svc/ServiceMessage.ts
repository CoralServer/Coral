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
 * Message ID used as the id of a StreamIPCMessage
 */
import {ServiceErrorID} from './ServiceError.ts';

export enum ServiceMessageID {
    /**
     * ID for a service request
     */
    SvcRequest,

    /**
     * ID for a service response
     */
    SvcResponse,
}

/**
 * An IServiceMessage with the error flag unset
 */
interface IServiceMessageNoError<T> {
    /**
     * UUID of this message
     * This is used to link a response to its request
     */
    uuid: string;

    /**
     * Name of the requested service
     */
    serviceName: string;

    /**
     * Used in response, set to false when there was no error
     */
    isError: false;

    /**
     * Data of the request/response
     */
    data?: T;
}

/**
 * An IServiceMessage with the error flag set
 */
interface IServiceMessageError {
    /**
     * UUID of this message
     * This is used to link a response to its request
     */
    uuid: string;

    /**
     * Name of the requested service
     */
    serviceName: string;

    /**
     * Used in a response, set to true when there was an error
     */
    isError: true;

    /**
     * ID of the error that has occurred
     */
    data: ServiceErrorID;
}

/**
 * Message data used as the payload of a StreamIPCMessage
 */
export type IServiceMessage<T> = IServiceMessageNoError<T> | IServiceMessageError;
