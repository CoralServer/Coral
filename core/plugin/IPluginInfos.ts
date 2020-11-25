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

export type IPluginPermission =
    | 'file-read'
    | 'file-write'
    | 'network'
    | 'hrtime';

export interface IPluginDependency {
    id: string;
    required: boolean;
}

export interface IPluginInfos {
    id: string;
    entry: string;
    minProtocolVersion: number;
    dependencies: Array<IPluginDependency>;
    permissions: Set<IPluginPermission>;
    services: Set<string>;
}
