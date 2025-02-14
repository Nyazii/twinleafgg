/// <reference types="node" />
import { EventEmitter } from 'events';
import { Core } from '../../game/core/core';
declare class MatchmakingService {
    private static instance;
    private lobbies;
    private playerFormat;
    queueUpdates: EventEmitter;
    private lobbyCache;
    private core;
    private lastCleanup;
    private readonly CLEANUP_INTERVAL;
    private constructor();
    static getInstance(core: Core): MatchmakingService;
    private startCleanupInterval;
    private cleanup;
    getLobby(format: string): [number, string[]][];
    addToQueue(userId: number, format: string, deck: string[]): Promise<void>;
    removeFromQueue(userId: number): void;
    private checkForMatch;
    private emitLobbyUpdate;
    private createMatch;
}
export default MatchmakingService;
