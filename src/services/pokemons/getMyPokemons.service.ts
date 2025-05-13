// src/services/pokemon.service.ts
import { db } from "../../config";

export const getMyPokemonsService = async (
  page: number = 0,
  pageSize: number = 10
) => {
  try {
    // Calcular el número de registros a saltar
    const skip = page * pageSize;

    // Obtener los Pokémon paginados
    const pokemons = await db.pokemons.findMany({
      skip: skip, // Saltar los registros anteriores
      take: pageSize, // Tomar solo `pageSize` registros
      orderBy: {
        id: 'asc', // Ordenar por ID (puedes cambiar el campo de ordenación)
      },
    });

    // Obtener el total de Pokémon para calcular el número total de páginas
    const totalPokemons = await db.pokemons.count();

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalPokemons / pageSize);

    return {
      pokemons,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages,
        totalPokemons,
      },
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error fetching Pokémon data');
  }
};