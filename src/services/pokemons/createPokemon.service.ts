import { db } from "../../config";
// import { IPokemon } from "../../interfaces/pokemon.types";

export const createPokemon = async (data: any) => {
    try {
        // Verifica si el Pokémon ya existe usando `id` o `name`
        const verifyPokemon = await db.pokemons.findFirst({
            where: {
                OR: [
                    { id: data.data.id }, // Busca por ID
                    { name: data.data.name }, // Busca por nombre
                ],
            },
        });

        if (verifyPokemon) {
            throw new Error('Pokemon already exist in our pokedex');
        }

        // Crea el nuevo Pokémon
        const newPokemon = await db.pokemons.create({
            data: { ...data.data },
        });

        return newPokemon;
    } catch (error: any) {
        throw new Error(error.message || 'Internal server error');
    }
};