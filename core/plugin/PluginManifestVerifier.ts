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

import {IPluginInfos, IPluginPermission} from './IPluginInfos.ts';

/**
 * Error when a value of the manifest has the wrong type
 */
export class ManifestWrongTypeError extends Error {
    /**
     * Constructs the error with a message
     * @param key Name of the key that couldn't be parsed
     * @param expectedType Expected type for the value associated with the key
     * @param value Value associated with the key
     */
    constructor(key: string, expectedType: string, value: any) {
        super('The "' + key + '" value was expected to be a ' + expectedType + ', got ' + typeof value);
    }
}

/**
 * Error when a mandatory value of the manifest is not present
 */
export class ManifestMandatoryKeyNotFoundError extends Error {
    /**
     * Constructs the error with a message
     * @param key Name of the key that is not present
     */
    constructor(key: string) {
        super('The mandatory key "' + key + '" could not be found');
    }
}

/**
 * Error when a member of a Set has the wrong type
 */
export class ManifestSetWrongTypeError extends Error {
    /**
     * Constructs the error with a message
     * @param setName Name of the set that has a wrong member
     * @param expectedType Expected type for the set member
     * @param value Set member
     */
    constructor(setName: string, expectedType: string, value: any) {
        super('A value of ' + setName + ' ("' + value + '") was expected to be a ' + expectedType + ', got ' + typeof value);
    }
}

export abstract class PluginManifestVerifier {
    /**
     * Array containing string values in the manifest JSON
     */
    private static readonly JSON_STRING_KEYS: Set<string> = new Set<string>(['id', 'entry']);

    /**
     * Array containing number values in the manifest JSON
     */
    private static readonly JSON_NUMBER_KEYS: Set<string> = new Set<string>(['minProtocolVersion', 'maxProtocolVersion']);

    /**
     * Array containing Set values in the manifest JSON
     */
    private static readonly JSON_SET_KEYS: Set<string> = new Set(['permissions', 'services']);

    /**
     * Array containing Array-like values in the manifest JSON
     */
    private static readonly JSON_ARRAYLIKE_KEYS: Set<string> = new Set<string>(['dependencies', ...PluginManifestVerifier.JSON_SET_KEYS]);

    /**
     * Array containing boolean values in the manifest JSON
     */
    private static readonly JSON_BOOLEAN_KEYS: Set<string> = new Set(['required']);

    /**
     * Array containing mandatory values in the manifest JSON
     */
    private static readonly JSON_MANDATORY_KEYS: Set<string> = new Set<string>(['id', 'entry']);

    /**
     * Transforms a plugin manifest string to a IPluginInfos object
     * @param manifest Manifest to convert
     */
    public static convertManifest(manifest: string): IPluginInfos {
        return this.fixPluginManifest(this.parsePluginManifest(manifest));
    }

    /**
     * Parses a partial plugin manifest from a string
     * @param manifest Manifest to parse
     * @private
     */
    private static parsePluginManifest(manifest: string): Partial<IPluginInfos> {
        return JSON.parse(manifest, (key, value) => {
            if (this.JSON_ARRAYLIKE_KEYS.has(key)) {
                // We want those to be arrays
                if (!Array.isArray(value))
                    throw new ManifestWrongTypeError(key, 'Array-like', value);

                if (this.JSON_SET_KEYS.has(key)) {
                    return new Set(value);
                }
            } else if (this.JSON_STRING_KEYS.has(key)) {
                // We want those to be strings
                if (typeof value !== 'string')
                    throw new ManifestWrongTypeError(key, 'string', value);
            } else if (this.JSON_NUMBER_KEYS.has(key)) {
                // We want those to be numbers
                if (typeof value !== 'number')
                    throw new ManifestWrongTypeError(key, 'number', value);
            } else if (this.JSON_BOOLEAN_KEYS.has(key)) {
                // We want those to be booleans
                if (typeof value !== 'boolean')
                    throw new ManifestWrongTypeError(key, 'boolean', value);
            }

            // Return the unchanged value by default
            return value;
        });
    }

    /**
     * Checks that mandatory fields are present
     * @param manifest Manifest to check
     * @private
     */
    private static checkMandatories(manifest: Partial<IPluginInfos>): void {
        for (const field of this.JSON_MANDATORY_KEYS) {
            if (!(field in manifest)) {
                throw new ManifestMandatoryKeyNotFoundError(field);
            }
        }
    }

    /**
     * Fixes non-mandatory fields of the partial manifest
     * @param manifest Manifest to fix
     * @private
     */
    private static fixPluginManifestNonMandatories(manifest: Partial<IPluginInfos>): Partial<IPluginInfos> {
        if (manifest.minProtocolVersion === undefined) {
            manifest.minProtocolVersion = 0;
        }
        if (manifest.maxProtocolVersion === undefined) {
            manifest.maxProtocolVersion = Number.POSITIVE_INFINITY;
        }
        if (manifest.dependencies === undefined) {
            manifest.dependencies = [];
        }
        if (manifest.permissions === undefined) {
            manifest.permissions = new Set<IPluginPermission>();
        }
        if (manifest.services === undefined) {
            manifest.services = new Set<string>();
        }

        return manifest;
    }

    /**
     * Checks that set members have the correct type
     * @param manifest Manifest to check
     * @private
     */
    private static checkSetMembers(manifest: Partial<IPluginInfos>): void {
        // Check permission members
        if (manifest.permissions !== undefined) {
            for (const permission of manifest.permissions) {
                if (typeof permission !== 'string') {
                    throw new ManifestSetWrongTypeError('permissions', 'string', permission);
                }
            }
        }

        // Check service members
        if (manifest.services !== undefined) {
            for (const service of manifest.services) {
                if (typeof service !== 'string') {
                    throw new ManifestSetWrongTypeError('services', 'string', service);
                }
            }
        }
    }

    /**
     * Fixes a partial plugin manifest
     * @param manifest Manifest to fix
     * @private
     */
    private static fixPluginManifest(manifest: Partial<IPluginInfos>): IPluginInfos {
        // Check mandatory fields presence
        this.checkMandatories(manifest);

        // Fix non-mandatory fields
        manifest = this.fixPluginManifestNonMandatories(manifest);

        // Check set member types
        this.checkSetMembers(manifest);

        // Finished fixing the manifest
        return manifest as IPluginInfos;
    }
}
