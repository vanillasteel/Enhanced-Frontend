import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import http from 'helpers/http';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';
import omit from 'lodash/omit';
import { stats } from 'pokemongo-data';

export const loading = createAction('@pokemons/loading');
export const loaded = createAction('@pokemons/loaded');
export const fetchPokemons = createAction('@pokemons/fetch', () => (dispatch) => {
  dispatch(loading());
  return http
    .get('/pokemon')
    .then(payload => payload.data.filter(it => !it.is_egg))
    .finally(() => dispatch(loaded()));
});

export const evolve = createAction('@pokemons/evolve', (pokemon) => (dispatch) => {
  // TODO: add modal confirmation & action
});

export const powerup = createAction('@pokemons/powerup', (pokemon) => (dispatch) => {
  // TODO: add modal confirmation & action
});

export const release = createAction('@pokemons/release', (pokemon) => (dispatch) => {
  console.log(pokemon);
  return http
    .post('/rpc/release', {id: pokemon.id})
    .then(response => console.log(response) || {pokemon: pokemon, response});
});

export const errorSelector = state => state.pokemons.error && state.pokemons.error.message;
export const loadingSelector = state => state.pokemons.loading;
export const pokemonSelector = state => state.pokemons.pokemons;
export const pokemonsByDateSelector = createSelector(
  pokemonSelector,
  pokemons => pokemons ? sortBy(pokemons, 'pokemon_id', (it) => -it.stats.powerQuotient) : null
);

export const initialState = {
  loading: false,
  error: null,
  pokemons: null
};

export const pokemonsReducer = handleActions({

  [loading]: (state) => ({
    ...state,
    loading: true
  }),

  [loaded]: (state) => ({
    ...state,
    loading: false
  }),

  [fetchPokemons]: {
    next: (state, { payload }) => ({
      ...state,
      error: null,
      pokemons: keyBy(payload, pokemon => {
        // mutate and add extra data
        // TODO: map current player level
        pokemon.stats = stats.calc(pokemon, 40);
        pokemon.picture = `pokemon/pkm${pokemon.stats.id}.png`;
        return pokemon.id;
      })
    }),

    throw: (state, action) => ({
      ...state,
      error: action.payload
    })
  },

  [release]: {
    next: (state, { payload }) => {
      // let pokemons = remove(state.pokemons, )
      console.log(state.pokemons);
      let pokemons = omit(state.pokemons, payload.pokemon.id);
      console.log(pokemons);
      return {
        ...state,
        pokemons: pokemons,
      };
    },

    throw: (state, action) => ({
      ...state,
      error: action.payload
    })
  }

}, initialState);
