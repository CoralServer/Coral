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

import Mutex from 'https://deno.land/x/await_mutex@v1.0.1/mod.ts';

import {StreamIPCMessage} from './StreamIPCMessage.ts';

/**
 * Class handling sending and receiving arbitrary data through a Reader and/or a Writer
 * Used for IPC between the plugins and the core server using stdin/stdout
 */
export class StreamIPC {
    /**
     * Input buffer for storing incoming messages from the process
     * @private
     */
    private readonly recvArray: Uint8Array = new Uint8Array(128);

    /**
     * String buffer for the current message being processed
     * @private
     */
    private currentMessage: string = '';

    /**
     * Array of functions to call when receiving a new message
     * @private
     */
    private onMessageCb: Array<(msg: StreamIPCMessage<any, any>) => void> = [];

    /**
     * Mutex for preventing concurrent access to the writer
     * @private
     */
    private writeMutex: Mutex = new Mutex();

    /**
     * Constructor for the StreamIPC class
     * @param reader Reader to receive messages from
     * @param writer Writer to send messages to
     */
    public constructor(
        reader: Deno.Reader | undefined,
        writer: Deno.Writer | undefined,
    ) {
        this._reader = reader;
        this._writer = writer;
    }

    /**
     * Reader to receive messages from
     * @private
     */
    private _reader: Deno.Reader | undefined;

    /**
     * Sets the reader
     * @param value
     */
    protected set reader(value: Deno.Reader | undefined) {
        this._reader = value;
    }

    /**
     * Writer to send messages to
     * @private
     */
    private _writer: Deno.Writer | undefined;

    /**
     * Sets the writer
     * @param value
     */
    protected set writer(value: Deno.Writer | undefined) {
        this._writer = value;
    }

    /**
     * Adds a listener for incoming messages
     * @param listener Listener to add
     */
    public addMessageListener(
        listener: (msg: StreamIPCMessage<any, any>) => void,
    ) {
        this.onMessageCb.push(listener);
    }

    /**
     * Removes a listener for incoming messages
     * @param listener Listener to remove
     */
    public removeMessageListener(
        listener: (msg: StreamIPCMessage<any, any>) => void,
    ) {
        this.onMessageCb = this.onMessageCb.filter((value) => value !== listener);
    }

    /**
     * Sends a message to the plugin stdin
     * @param msg Message to send
     * @private
     */
    public async send<Ids extends number, T>(
        msg: StreamIPCMessage<Ids, T>,
    ): Promise<number> {
        // Check that we have a writer
        if (this._writer === undefined) {
            return Promise.reject();
        }

        // Stringify the message to send
        const msgString: string = JSON.stringify(msg) + '\0';

        // Acquire mutex
        const id = await this.writeMutex.acquire();

        // Send the message
        let p: number | undefined;
        try {
            p = await this._writer.write(new TextEncoder().encode(msgString));
        } catch (e) {
            p = undefined;
        } finally {
            // Release the mutex
            this.writeMutex.release(id);
        }

        // Resolve/Reject result
        if (p !== undefined) {
            return Promise.resolve(p);
        } else {
            return Promise.reject();
        }
    }

    /**
     * Receives a message from the plugin stdout
     */
    protected recv(): void {
        if (this._reader === undefined) return;

        this._reader.read(this.recvArray)
            .then((n) => {
                if (n) {
                    // We've got some data to process
                    const decodedString: string = new TextDecoder().decode(
                        this.recvArray.subarray(0, n),
                    );

                    // Loop while we find \0 chars in the string
                    let i: number = 0;
                    let start: number = 0;
                    while ((i = decodedString.indexOf('\0', start)) !== -1) {
                        // We've got an entire message
                        this.currentMessage += decodedString.substring(start, i);
                        const msg: StreamIPCMessage<any, any> = JSON.parse(
                            this.currentMessage,
                        );

                        // Call the message callbacks
                        for (const value of this.onMessageCb) {
                            value(msg);
                        }

                        // Reset the message, start over
                        this.currentMessage = '';
                        start = i + 1;
                    }

                    this.currentMessage += decodedString.substring(start);
                }
            })
            .finally(() => {
                // Receive once again
                this.recv();
            });
    }
}
