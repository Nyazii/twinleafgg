import { Effect } from '../../game/store/effects/effect';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
export declare class GiantHearth extends TrainerCard {
    trainerType: TrainerType;
    set: string;
    cardImage: string;
    name: string;
    fullName: string;
    setNumber: string;
    text: string;
    reduceEffect(store: StoreLike, state: State, effect: Effect): State;
}
