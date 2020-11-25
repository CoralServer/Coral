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
 * Permission strings allowed in the "permissions" array of a plugin manifest
 */
export type IPluginPermission =
    | 'file-read'
    | 'file-write'
    | 'network'
    | 'hrtime';

/**
 * Dependency of a plugin as found in the "dependencies" array of a plugin manifest
 */
export interface IPluginDependency {
    /**
     * ID of the plugin
     */
    id: string;

    /**
     * Is this dependency required for the plugin to work?
     */
    required: boolean;
}

/**
 * Information about a plugin as found in its manifest
 */
export interface IPluginInfos {
    /**
     * ID of the plugin
     */
    id: string;

    /**
     * Entry file of the plugin
     * This is the file that will be executed when the plugin is launched
     */
    entry: string;

    /**
     * Minimum protocol version this plugin supports
     * If this value is not present, it will be set to zero
     */
    minProtocolVersion?: number;

    /**
     * Maximum protocol version this plugin supports
     * If this value is not present, it will be set to +INF
     */
    maxProtocolVersion?: number;

    /**
     * Dependencies of this plugin
     */
    dependencies: Array<IPluginDependency>;

    /**
     * Permissions given to the plugin by the Deno runtime
     */
    permissions: Set<IPluginPermission>;

    /**
     * Services to be opened by the core server,
     * for communicating between the core server and the plugin
     */
    services: Set<string>;
}
