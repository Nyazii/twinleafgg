import { AddPlayerAction } from '../store/actions/add-player-action';
import { CleanerTask } from '../tasks/cleaner-task';
import { Client } from '../client/client.interface';
import { GameError } from '../game-error';
import { GameMessage } from '../game-message';
import { Game } from './game';
import { GameSettings } from './game-settings';
import { InvitePlayerAction } from '../store/actions/invite-player-action';
import { Messager } from './messager';
import { RankingCalculator } from './ranking-calculator';
import { Scheduler, generateId } from '../../utils';
import { config } from '../../config';
import { Format } from '../store/card/card-types';

export class Core {
  public clients: Client[] = [];
  public games: Game[] = [];
  public messager: Messager;

  constructor() {
    this.messager = new Messager(this);
    const cleanerTask = new CleanerTask(this);
    cleanerTask.startTasks();
    this.startRankingDecrease();
  }

  public connect(client: Client): Client {
    client.id = generateId(this.clients);
    client.core = this;
    client.games = [];
    this.emit(c => c.onConnect(client));
    this.clients.push(client);
    return client;
  }

  public disconnect(client: Client): void {
    try {
      const index = this.clients.indexOf(client);
      if (index === -1) {
        throw new GameError(GameMessage.ERROR_CLIENT_NOT_CONNECTED);
      }
      client.games.forEach(game => this.leaveGame(client, game));
      this.clients.splice(index, 1);
      client.core = undefined;
      this.emit(c => c.onDisconnect(client));
    } catch (error) {
      if (error instanceof GameError) {
        console.error('Error during disconnect:', error.message);
      } else {
        throw error; // Re-throw if it's not a GameError
      }
    }
  }

  public createGame(
    client: Client,
    deck: string[],
    gameSettings: GameSettings = new GameSettings(),
    invited?: Client
  ): Game {
    if (this.clients.indexOf(client) === -1) {
      throw new GameError(GameMessage.ERROR_CLIENT_NOT_CONNECTED);
    }
    if (invited && this.clients.indexOf(invited) === -1) {
      throw new GameError(GameMessage.ERROR_CLIENT_NOT_CONNECTED);
    }
    if (gameSettings.format === Format.RETRO) {
      gameSettings.rules.attackFirstTurn = true;
      gameSettings.rules.firstTurnDrawCard = false;
    }
    const game = new Game(this, generateId(this.games), gameSettings);
    game.dispatch(client, new AddPlayerAction(client.id, client.name, deck));
    if (invited) {
      game.dispatch(client, new InvitePlayerAction(invited.id, invited.name));
    }
    this.games.push(game);
    this.emit(c => c.onGameAdd(game));
    this.joinGame(client, game);
    if (invited) {
      this.joinGame(invited, game);
    }
    return game;
  }

  public createGameWithDecks(
    client: Client,
    deck: string[],
    gameSettings: GameSettings = new GameSettings(),
    client2: Client,
    deck2: string[]
  ): Game {
    if (this.clients.indexOf(client) === -1) {
      throw new GameError(GameMessage.ERROR_CLIENT_NOT_CONNECTED);
    }

    console.log(`[Matchmaking] Match created between ${client.name} and ${client2.name} (Format: ${gameSettings.format})`);

    if (gameSettings.format === Format.RETRO) {
      gameSettings.rules.attackFirstTurn = true;
    }

    const game = new Game(this, generateId(this.games), gameSettings);
    game.dispatch(client, new AddPlayerAction(client.id, client.name, deck));
    game.dispatch(client, new AddPlayerAction(client2.id, client2.name, deck2));
    this.games.push(game);
    this.emit(c => c.onGameAdd(game));
    this.joinGame(client, game);
    this.joinGame(client2, game);
    return game;
  }

  public joinGame(client: Client, game: Game): void {
    if (this.clients.indexOf(client) === -1) {
      throw new GameError(GameMessage.ERROR_CLIENT_NOT_CONNECTED);
    }
    if (this.games.indexOf(game) === -1) {
      throw new GameError(GameMessage.ERROR_GAME_NOT_FOUND);
    }
    if (client.games.indexOf(game) === -1) {
      this.emit(c => c.onGameJoin(game, client));
      client.games.push(game);
      game.clients.push(client);
    }
  }

  public deleteGame(game: Game): void {
    game.clients.forEach(client => {
      const index = client.games.indexOf(game);
      if (index !== -1) {
        client.games.splice(index, 1);
        this.emit(c => c.onGameLeave(game, client));
      }
    });
    const index = this.games.indexOf(game);
    if (index !== -1) {
      this.games.splice(index, 1);
      this.emit(c => c.onGameDelete(game));
    }
  }

  public leaveGame(client: Client, game: Game): void {
    if (this.clients.indexOf(client) === -1) {
      throw new GameError(GameMessage.ERROR_CLIENT_NOT_CONNECTED);
    }
    if (this.games.indexOf(game) === -1) {
      throw new GameError(GameMessage.ERROR_GAME_NOT_FOUND);
    }
    const gameIndex = client.games.indexOf(game);
    const clientIndex = game.clients.indexOf(client);
    if (clientIndex !== -1 && gameIndex !== -1) {
      client.games.splice(gameIndex, 1);
      game.clients.splice(clientIndex, 1);
      this.emit(c => c.onGameLeave(game, client));
      game.handleClientLeave(client);
    }
    if (game.clients.length === 0) {
      this.deleteGame(game);
    }
  }

  public emit(fn: (client: Client) => void): void {
    this.clients.forEach(fn);
  }

  private startRankingDecrease() {
    const scheduler = Scheduler.getInstance();
    const rankingCalculator = new RankingCalculator();
    scheduler.run(async () => {
      let users = await rankingCalculator.decreaseRanking();

      // Notify only about users which are currently connected
      const connectedUserIds = this.clients.map(c => c.user.id);
      users = users.filter(u => connectedUserIds.includes(u.id));

      this.emit(c => c.onUsersUpdate(users));
    }, config.core.rankingDecreaseIntervalCount);
  }

}