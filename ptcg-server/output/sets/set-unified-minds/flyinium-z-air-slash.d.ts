import { Attack } from '../../game';
import { TrainerType } from '../../game/store/card/card-types';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { Effect } from '../../game/store/effects/effect';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';
export declare class FlyiniumZAirSlash extends TrainerCard {
    trainerType: TrainerType;
    set: string;
    cardImage: string;
    setNumber: string;
    name: string;
    fullName: string;
    attacks: Attack[];
    text: string;
    FLYINIUM_Z_MARKER: string;
    reduceEffect(store: StoreLike, state: State, effect: Effect): State;
}
