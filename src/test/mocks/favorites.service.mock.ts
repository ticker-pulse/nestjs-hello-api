import { vi, type MockedFunction } from 'vitest';
import type { FavoritesService } from '@/modules/favorites/services/favorites.service';

export type MockedFavoritesService = {
  [K in keyof FavoritesService]: MockedFunction<FavoritesService[K]>;
};

export function createMockFavoritesService(): MockedFavoritesService {
  return {
    addFavorite: vi.fn(),
    getUserFavorites: vi.fn(),
    getFavorite: vi.fn(),
    updateFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  } as MockedFavoritesService;
}