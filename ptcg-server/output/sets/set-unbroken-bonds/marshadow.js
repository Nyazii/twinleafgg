"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marshadow = void 0;
const pokemon_card_1 = require("../../game/store/card/pokemon-card");
const card_types_1 = require("../../game/store/card/card-types");
const game_1 = require("../../game");
const game_effects_1 = require("../../game/store/effects/game-effects");
const game_message_1 = require("../../game/game-message");
const prefabs_1 = require("../../game/store/prefabs/prefabs");
class Marshadow extends pokemon_card_1.PokemonCard {
    constructor() {
        super(...arguments);
        this.stage = card_types_1.Stage.BASIC;
        this.cardType = card_types_1.CardType.PSYCHIC;
        this.hp = 80;
        this.weakness = [{ type: card_types_1.CardType.DARK }];
        this.resistance = [{ type: card_types_1.CardType.FIGHTING, value: -20 }];
        this.retreat = [card_types_1.CardType.COLORLESS];
        this.powers = [
            {
                name: 'Resetting Hole',
                useWhenInPlay: true,
                powerType: game_1.PowerType.ABILITY,
                text: 'Once during your turn (before your attack), if this Pokémon is on your Bench, you may discard any Stadium card in play. If you do, discard this Pokémon and all cards attached to it.'
            }
        ];
        this.attacks = [
            {
                name: 'Red Knuckles',
                cost: [card_types_1.CardType.COLORLESS],
                damage: 10,
                damageCalculation: '+',
                text: 'If your opponent\'s Active Pokémon is an Ultra Beast, this attack does 60 more damage.'
            }
        ];
        this.set = 'UNB';
        this.cardImage = 'assets/cardback.png';
        this.setNumber = '81';
        this.name = 'Marshadow';
        this.fullName = 'Marshadow UNB';
        this.REFRIGERATED_STREAM_MARKER = 'REFRIGERATED_STREAM_MARKER';
    }
    reduceEffect(store, state, effect) {
        if (effect instanceof game_effects_1.PowerEffect && effect.power === this.powers[0]) {
            const stadiumCard = game_1.StateUtils.getStadiumCard(state);
            const player = effect.player;
            if (stadiumCard === undefined) {
                throw new game_1.GameError(game_message_1.GameMessage.CANNOT_USE_POWER);
            }
            const cardList = game_1.StateUtils.findCardList(state, stadiumCard);
            const owner = game_1.StateUtils.findOwner(state, cardList);
            if (player.active.cards[0] == this) {
                throw new game_1.GameError(game_message_1.GameMessage.CANNOT_USE_POWER);
            }
            const marshadowCards = game_1.StateUtils.findCardList(state, this);
            // Check if this card is on bench
            const benchIndex = player.bench.indexOf(marshadowCards);
            if (benchIndex === -1) {
                throw new game_1.GameError(game_message_1.GameMessage.CANNOT_USE_POWER);
            }
            // Discard Stadium
            prefabs_1.MOVE_CARDS(store, state, cardList, owner.discard);
            player.bench[benchIndex].moveTo(player.discard);
            return state;
        }
        if (prefabs_1.WAS_ATTACK_USED(effect, 0, this)) {
            prefabs_1.DEAL_MORE_DAMAGE_IF_OPPONENT_ACTIVE_HAS_CARD_TAG(effect, state, 60, card_types_1.CardTag.ULTRA_BEAST);
        }
        return state;
    }
}
exports.Marshadow = Marshadow;
