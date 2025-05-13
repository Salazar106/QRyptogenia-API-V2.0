// src/services/pokemon.service.ts
import axios from 'axios';
import { IPokemon } from '../../interfaces/pokemon.types';

interface IIdentifier{
    identifier: string | number;
}

export const getPokemonFromAPI = async (identifier: IIdentifier) => {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${identifier}`
    );

    const pokemonData: IPokemon = {
      name: response.data.name,
      id: response.data.id,
      types: response.data.types.map((type: any) => type.type.name),
      stats: {
        hp: response.data.stats[0].base_stat,
        attack: response.data.stats[1].base_stat,
        defense: response.data.stats[2].base_stat,
        specialAttack: response.data.stats[3].base_stat,
        specialDefense: response.data.stats[4].base_stat,
        speed: response.data.stats[5].base_stat,
      },
      image: response.data.sprites.front_default,
    };

    if (!pokemonData.name) throw new Error('Pokémon not found');

    return pokemonData;
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching Pokémon data');
  }
};

