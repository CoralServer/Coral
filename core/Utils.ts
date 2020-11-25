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
 * Utilitarian class containing all sort of stuff
 */
export abstract class Utils {
    /**
     * Prints a message and brutally closes the server
     * @param message Message to print
     * @param code Code to exit with
     */
    public static panic(message?: string, code: number = -1): void {
        if (message !== undefined) {
            console.error(message);
        } else {
            console.error('[Error] Coral has encountered an unknown critical error and will now exit');
            console.trace();
        }

        Deno.exit(code);
    }
}
