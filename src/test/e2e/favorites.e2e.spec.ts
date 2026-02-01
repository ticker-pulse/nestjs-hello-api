import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { resetTestDatabase, setupTestDatabase, teardownTestDatabase } from '../setup';
import { AppModule } from '@/app.module';

describe('Favorites E2E', () => {
  let app: INestApplication;
  let userId: string;
  let productId: string;
  let anotherProductId: string;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();

    // Create test user
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Test User', email: 'test@example.com' });
    userId = userRes.body.id;

    // Create test products
    const product1Res = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Product 1',
        price: '99.99',
        stock: 10,
        sku: 'PROD-001',
      });
    productId = product1Res.body.id;

    const product2Res = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Product 2',
        price: '199.99',
        stock: 5,
        sku: 'PROD-002',
      });
    anotherProductId = product2Res.body.id;
  });

  describe('POST /users/:userId/favorites', () => {
    it('should add a favorite', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.userId).toBe(userId);
          expect(res.body.productId).toBe(productId);
          expect(res.body.notes).toBeNull();
          expect(res.body.product).toBeDefined();
          expect(res.body.product.id).toBe(productId);
        });
    });

    it('should add a favorite with notes', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId, notes: 'Want to buy this' })
        .expect(201)
        .expect((res) => {
          expect(res.body.notes).toBe('Want to buy this');
        });
    });

    it('should return 409 for duplicate favorite', async () => {
      // Add favorite first time
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201);

      // Try to add same favorite again
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(409);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/users/non-existent-user/favorites')
        .send({ productId })
        .expect(404);
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });

    it('should reject invalid productId format', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId: 'not-a-uuid' })
        .expect(400);
    });
  });

  describe('GET /users/:userId/favorites', () => {
    it('should return empty favorites list initially', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should return all user favorites', async () => {
      // Add two favorites
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId: anotherProductId })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites`)
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
          expect(res.body[0].productId).toBe(anotherProductId); // Most recent first
          expect(res.body[1].productId).toBe(productId);
          expect(res.body[0].product).toBeDefined();
          expect(res.body[1].product).toBeDefined();
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-user/favorites')
        .expect(404);
    });
  });

  describe('GET /users/:userId/favorites/:productId', () => {
    beforeEach(async () => {
      // Add a favorite
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId, notes: 'Test note' })
        .expect(201);
    });

    it('should return a specific favorite', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.userId).toBe(userId);
          expect(res.body.productId).toBe(productId);
          expect(res.body.notes).toBe('Test note');
          expect(res.body.product).toBeDefined();
        });
    });

    it('should return 404 for non-existent favorite', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${anotherProductId}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get(`/users/non-existent-user/favorites/${productId}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:userId/favorites/:productId', () => {
    beforeEach(async () => {
      // Add a favorite
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201);
    });

    it('should update favorite notes', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${productId}`)
        .send({ notes: 'Updated note' })
        .expect(200)
        .expect((res) => {
          expect(res.body.notes).toBe('Updated note');
          expect(res.body.productId).toBe(productId);
        });
    });

    it('should clear notes when provided empty string', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${productId}`)
        .send({ notes: '' })
        .expect(200)
        .expect((res) => {
          expect(res.body.notes).toBe('');
        });
    });

    it('should return 404 for non-existent favorite', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${anotherProductId}`)
        .send({ notes: 'Updated' })
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch(`/users/non-existent-user/favorites/${productId}`)
        .send({ notes: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /users/:userId/favorites/:productId', () => {
    beforeEach(async () => {
      // Add a favorite
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201);
    });

    it('should delete a favorite', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}/favorites/${productId}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${productId}`)
        .expect(404);
    });

    it('should return 404 for non-existent favorite', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}/favorites/${anotherProductId}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete(`/users/non-existent-user/favorites/${productId}`)
        .expect(404);
    });
  });

  describe('Complete user flow', () => {
    it('should handle complete favorites workflow', async () => {
      // Add first favorite
      const fav1 = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId, notes: 'First choice' })
        .expect(201);
      expect(fav1.body.notes).toBe('First choice');

      // Add second favorite
      const fav2 = await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId: anotherProductId, notes: 'Second choice' })
        .expect(201);
      expect(fav2.body.notes).toBe('Second choice');

      // List all favorites
      const list = await request(app.getHttpServer())
        .get(`/users/${userId}/favorites`)
        .expect(200);
      expect(list.body.length).toBe(2);

      // Update first favorite notes
      const updated = await request(app.getHttpServer())
        .patch(`/users/${userId}/favorites/${productId}`)
        .send({ notes: 'Updated first choice' })
        .expect(200);
      expect(updated.body.notes).toBe('Updated first choice');

      // Delete second favorite
      await request(app.getHttpServer())
        .delete(`/users/${userId}/favorites/${anotherProductId}`)
        .expect(204);

      // Verify only one favorite remains
      const finalList = await request(app.getHttpServer())
        .get(`/users/${userId}/favorites`)
        .expect(200);
      expect(finalList.body.length).toBe(1);
      expect(finalList.body[0].productId).toBe(productId);
      expect(finalList.body[0].notes).toBe('Updated first choice');
    });
  });

  describe('Cascade behavior', () => {
    it('should remove favorites when user is deleted', async () => {
      // Add favorite
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201);

      // Verify favorite exists
      await request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${productId}`)
        .expect(200);

      // Delete user
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);

      // User should not exist
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('should remove favorites when product is deleted', async () => {
      // Add favorite
      await request(app.getHttpServer())
        .post(`/users/${userId}/favorites`)
        .send({ productId })
        .expect(201);

      // Verify favorite exists
      await request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${productId}`)
        .expect(200);

      // Delete product
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(204);

      // Product should not exist
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);

      // Favorite should not exist
      await request(app.getHttpServer())
        .get(`/users/${userId}/favorites/${productId}`)
        .expect(404);
    });
  });
});
