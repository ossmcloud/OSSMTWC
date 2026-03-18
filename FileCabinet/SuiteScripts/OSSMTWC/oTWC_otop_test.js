/**
 * @NApiVersion 2.1
 * @NModuleScope public
*/
define(['SuiteBundles/Bundle 548734/O/core.crypto.js'],
    function (crypto) {

        //#region TOTP Generation
        /**
         * Generates a TOTP token synchronously (RFC 6238)
         * @param {string} base32Secret - The shared secret in Base32 encoding
         * @param {number} [digits=6] - Number of digits (6 or 8)
         * @param {number} [period=30] - Time step in seconds
         * @returns {string} - The TOTP token, zero-padded to `digits` length
         */
        function generateTOTP(base32Secret, digits = 6, period = 30) {
            const key = base32ToBytes(base32Secret);
            const counter = Math.floor(Date.now() / 1000 / period);
            return hotp(key, counter, digits);
        }

        /**
         * Generates an HOTP token synchronously (RFC 4226)
         * @param {Uint8Array} key
         * @param {number} counter
         * @param {number} digits
         * @returns {string}
         */
        function hotp(key, counter, digits) {
            // Pack counter into 8-byte big-endian buffer
            const counterBytes = new Uint8Array(8);
            let tmp = counter;
            for (let i = 7; i >= 0; i--) {
                counterBytes[i] = tmp & 0xff;
                tmp = Math.floor(tmp / 256);
            }

            // Compute HMAC-SHA1
            const hmac = hmacSHA1(key, counterBytes);

            // Dynamic truncation
            const offset = hmac[hmac.length - 1] & 0x0f;
            const code =
                ((hmac[offset] & 0x7f) << 24) |
                ((hmac[offset + 1] & 0xff) << 16) |
                ((hmac[offset + 2] & 0xff) << 8) |
                (hmac[offset + 3] & 0xff);

            const otp = code % 10 ** digits;
            return String(otp).padStart(digits, "0");
        }

        // ---------------------------------------------------------------------------
        // HMAC-SHA1
        // ---------------------------------------------------------------------------

        /**
         * Computes HMAC-SHA1
         * @param {Uint8Array} key
         * @param {Uint8Array} message
         * @returns {Uint8Array} 20-byte digest
         */
        function hmacSHA1(key, message) {
            const BLOCK_SIZE = 64;

            // If key is longer than block size, hash it first
            let k = key.length > BLOCK_SIZE ? sha1(key) : key;

            // Pad key to block size
            const kPadded = new Uint8Array(BLOCK_SIZE);
            kPadded.set(k);

            const iPad = new Uint8Array(BLOCK_SIZE).map((_, i) => kPadded[i] ^ 0x36);
            const oPad = new Uint8Array(BLOCK_SIZE).map((_, i) => kPadded[i] ^ 0x5c);

            const innerHash = sha1(concat(iPad, message));
            return sha1(concat(oPad, innerHash));
        }

        // ---------------------------------------------------------------------------
        // SHA-1 (RFC 3174)
        // ---------------------------------------------------------------------------

        /**
         * Computes SHA-1 digest
         * @param {Uint8Array} data
         * @returns {Uint8Array} 20-byte digest
         */
        function sha1(data) {
            // Initial hash values
            let [h0, h1, h2, h3, h4] = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

            // Pre-processing: add padding
            const msgLen = data.length;
            const bitLen = msgLen * 8;

            // Append bit '1' (0x80 byte), then zeros, then 64-bit big-endian length
            // Total length must be congruent to 448 mod 512 bits (56 mod 64 bytes)
            const padLen = ((msgLen % 64) < 56 ? 56 : 120) - (msgLen % 64);
            const padded = new Uint8Array(msgLen + padLen + 8);
            padded.set(data);
            padded[msgLen] = 0x80;

            // Append original length as 64-bit big-endian
            const view = new DataView(padded.buffer);
            view.setUint32(padded.length - 4, bitLen >>> 0, false);
            view.setUint32(padded.length - 8, Math.floor(bitLen / 2 ** 32), false);

            // Process each 512-bit (64-byte) chunk
            const w = new Uint32Array(80);
            for (let offset = 0; offset < padded.length; offset += 64) {
                // Prepare message schedule
                for (let i = 0; i < 16; i++) {
                    w[i] = view.getUint32(offset + i * 4, false);
                }
                for (let i = 16; i < 80; i++) {
                    w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
                }

                let [a, b, c, d, e] = [h0, h1, h2, h3, h4];

                for (let i = 0; i < 80; i++) {
                    let f, k;
                    if (i < 20) { f = (b & c) | (~b & d); k = 0x5A827999; }
                    else if (i < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
                    else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
                    else { f = b ^ c ^ d; k = 0xCA62C1D6; }

                    const temp = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
                    e = d; d = c; c = rotl(b, 30); b = a; a = temp;
                }

                h0 = (h0 + a) >>> 0;
                h1 = (h1 + b) >>> 0;
                h2 = (h2 + c) >>> 0;
                h3 = (h3 + d) >>> 0;
                h4 = (h4 + e) >>> 0;
            }

            // Produce the 20-byte digest
            const digest = new Uint8Array(20);
            const dv = new DataView(digest.buffer);
            [h0, h1, h2, h3, h4].forEach((h, i) => dv.setUint32(i * 4, h, false));
            return digest;
        }

        /** Left-rotate a 32-bit integer by n bits */
        function rotl(value, n) {
            return ((value << n) | (value >>> (32 - n))) >>> 0;
        }

        /** Concatenate two Uint8Arrays */
        function concat(a, b) {
            const result = new Uint8Array(a.length + b.length);
            result.set(a);
            result.set(b, a.length);
            return result;
        }

        // ---------------------------------------------------------------------------
        // Base32 decoder (RFC 4648)
        // ---------------------------------------------------------------------------

        /**
         * Decodes a Base32-encoded string into a Uint8Array
         * @param {string} base32
         * @returns {Uint8Array}
         */
        function base32ToBytes(base32) {
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            const input = base32.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");

            let bits = 0, value = 0;
            const output = [];

            for (const char of input) {
                const idx = alphabet.indexOf(char);
                if (idx === -1) throw new Error(`Invalid Base32 character: ${char}`);
                value = (value << 5) | idx;
                bits += 5;
                if (bits >= 8) {
                    output.push((value >>> (bits - 8)) & 0xff);
                    bits -= 8;
                }
            }

            return new Uint8Array(output);
        }
        //#endregion



        //#region TOTP Secret Generator

        /**
      * Generates a TOTP secret without any external libraries or crypto APIs.
      *
      * ⚠️  SECURITY NOTE: Without crypto.getRandomValues(), true cryptographic
      * randomness is impossible in pure JS. This implementation seeds a
      * xoshiro128** PRNG with every available entropy source (time, performance
      * counters, Math.random, object hashes, stack timing) to get the best
      * possible result — but it is NOT suitable for high-security production use.
      * Use the crypto-based version if the environment supports it.
      *
      * @param {number} [byteLength=20] - Number of random bytes (20 = RFC 4226 recommended)
      * @returns {string} Base32-encoded TOTP secret
      */
        function generateTOTPSecret(byteLength = 20) {
            const bytes = pseudoRandomBytes(byteLength);
            return base32Encode(bytes);
        }

        // ---------------------------------------------------------------------------
        // Entropy harvesting + xoshiro128** PRNG
        // ---------------------------------------------------------------------------

        /**
         * Harvests entropy from the environment and seeds a xoshiro128** PRNG,
         * then returns `length` pseudo-random bytes.
         * @param {number} length
         * @returns {Uint8Array}
         */
        function pseudoRandomBytes(length) {
            const seeds = harvestEntropy();
            const rng = xoshiro128ss(seeds[0], seeds[1], seeds[2], seeds[3]);
            const output = new Uint8Array(length);
            for (let i = 0; i < length; i++) output[i] = rng() & 0xff;
            return output;
        }

        /**
         * Collects as many independent entropy bits as pure JS allows.
         * Returns four 32-bit integers suitable for seeding xoshiro128**.
         * @returns {[number, number, number, number]}
         */
        function harvestEntropy() {
            const samples = [];

            // 1. Wall-clock time (milliseconds since epoch)
            samples.push(Date.now());

            // 2. High-resolution timer if available (sub-millisecond jitter)
            if (typeof performance !== "undefined" && performance.now) {
                const t = performance.now();
                samples.push(Math.floor(t));
                samples.push(Math.floor((t % 1) * 1e9)); // fractional nanoseconds
            }

            // 3. Several Math.random() calls (weak, but independent of time)
            for (let i = 0; i < 8; i++) samples.push(Math.floor(Math.random() * 0xffffffff));

            // 4. Timing jitter: measure how long a trivial loop actually takes
            //    (varies with CPU load, GC pauses, scheduler, etc.)
            for (let round = 0; round < 4; round++) {
                const t0 = Date.now();
                let dummy = 0;
                for (let i = 0; i < 1e5; i++) dummy ^= i;
                samples.push((Date.now() - t0) ^ dummy);
            }

            // 5. Memory address jitter: object identity hash approximation
            const obj = {};
            samples.push(Object.keys({ ...obj, _: Math.random() }).length ^ Date.now());

            // 6. String conversion timing
            const t1 = Date.now();
            JSON.stringify(samples);
            samples.push(Date.now() - t1);

            // Mix all samples down to four 32-bit seed words via a simple hash
            return [
                mixSeeds(samples, 0),
                mixSeeds(samples, 1),
                mixSeeds(samples, 2),
                mixSeeds(samples, 3),
            ];
        }

        /**
         * Hashes an array of numbers down to a single 32-bit integer.
         * Uses a variant of the FNV-1a algorithm.
         * @param {number[]} values
         * @param {number} salt - Differentiate the four seed words
         * @returns {number}
         */
        function mixSeeds(values, salt) {
            let h = (0x811c9dc5 + salt * 0x9e3779b9) >>> 0;
            for (const v of values) {
                h ^= (v >>> 0);
                h = Math.imul(h, 0x01000193) >>> 0;
                h ^= (v >>> 16);
                h = Math.imul(h, 0x01000193) >>> 0;
            }
            // Final avalanche
            h ^= h >>> 16;
            h = Math.imul(h, 0x85ebca6b) >>> 0;
            h ^= h >>> 13;
            h = Math.imul(h, 0xc2b2ae35) >>> 0;
            h ^= h >>> 16;
            return h >>> 0;
        }

        /**
         * xoshiro128** — a fast, high-quality 32-bit PRNG.
         * https://prng.di.unimi.it/xoshiro128starstar.c
         *
         * @param {number} s0
         * @param {number} s1
         * @param {number} s2
         * @param {number} s3
         * @returns {() => number} Function returning a random uint32 on each call
         */
        function xoshiro128ss(s0, s1, s2, s3) {
            // Ensure no zero state (degenerate case)
            if (!s0 && !s1 && !s2 && !s3) { s0 = 0xdeadbeef; }

            return function () {
                const result = Math.imul(rotl32(Math.imul(s1, 5), 7), 9) >>> 0;
                const t = (s1 << 9) >>> 0;

                s2 ^= s0;
                s3 ^= s1;
                s1 ^= s2;
                s0 ^= s3;
                s2 ^= t;
                s3 = rotl32(s3, 11);

                // Advance state
                s0 >>>= 0; s1 >>>= 0; s2 >>>= 0; s3 >>>= 0;

                return result;
            };
        }

        /** Rotate a 32-bit integer left by k positions */
        function rotl32(x, k) {
            return ((x << k) | (x >>> (32 - k))) >>> 0;
        }

        // ---------------------------------------------------------------------------
        // Base32 encoder (RFC 4648, no padding)
        // ---------------------------------------------------------------------------

        /**
         * Encodes a Uint8Array as a Base32 string (uppercase, no padding)
         * @param {Uint8Array} bytes
         * @returns {string}
         */
        function base32Encode(bytes) {
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            let bits = 0, value = 0, output = "";

            for (let i = 0; i < bytes.length; i++) {
                value = (value << 8) | bytes[i];
                bits += 8;
                while (bits >= 5) {
                    output += alphabet[(value >>> (bits - 5)) & 0x1f];
                    bits -= 5;
                }
            }

            if (bits > 0) {
                output += alphabet[(value << (5 - bits)) & 0x1f];
            }

            return output;
        }
        
        //#endregion

        return {
            generateTOTP: generateTOTP,
            generateTOTPSecret: generateTOTPSecret
        }
    });
