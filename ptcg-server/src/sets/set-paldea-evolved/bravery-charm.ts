import { TrainerCard, TrainerType, State, Stage, StoreLike } from '../../game';
import { CheckHpEffect } from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import {ToolEffect} from '../../game/store/effects/play-card-effects';

export class BraveryCharm extends TrainerCard {
  public trainerType = TrainerType.TOOL;

  public regulationMark = 'G';

  public set: string = 'PAL';

  public cardImage: string = 'assets/cardback.png';

  public setNumber: string = '173';

  public name: string = 'Bravery Charm';

  public fullName: string = 'Bravery Charm PAL';

  public text: string =
    'The Basic Pokémon this card is attached to gets +50 HP.';

  private readonly HP_BONUS = 50;

  public reduceEffect(store: StoreLike, state: State, effect: Effect) {
    if (effect instanceof CheckHpEffect && effect.target.cards.includes(this)) {
      const card = effect.target.getPokemonCard();

      // Try to reduce ToolEffect, to check if something is blocking the tool from working
      try {
        const stub = new ToolEffect(effect.player, this);
        store.reduceEffect(state, stub);
      } catch {
        return state;
      }

      if (card === undefined) {
        return state;
      }

      if (card.stage === Stage.BASIC) {
        effect.hp += this.HP_BONUS;
        effect.target.hpBonus = (effect.target.hpBonus || 0) + this.HP_BONUS;
      }
    }
    return state;
  }
}
