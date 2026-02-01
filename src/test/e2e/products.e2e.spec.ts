import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { resetTestDatabase, setupTestDatabase, teardownTestDatabase } from '../setup';
import { AppModule } from '@/app.module';

describe('Products E2E', () => {
  let app: INestApplication;

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
  });

  describe('POST /products', () => {
    it('should create a product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Laptop',
          price: '999.99',
          stock: 5,
          sku: 'LAP-001',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('Laptop');
          expect(res.body.price).toBe('999.99');
          expect(res.body.stock).toBe(5);
          expect(res.body.sku).toBe('LAP-001');
          expect(res.body.isActive).toBe(true);
        });
    });

    it('should create a product with description', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Monitor',
          description: '27 inch 4K monitor',
          price: '499.99',
          stock: 10,
          sku: 'MON-001',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.description).toBe('27 inch 4K monitor');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Incomplete Product',
        })
        .expect(400);
    });

    it('should reject invalid price', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product',
          price: 'invalid',
          stock: 5,
          sku: 'SKU-001',
        })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('should return empty list initially', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should return all created products', async () => {
      const product1 = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product 1',
          price: '100.00',
          stock: 10,
          sku: 'PROD-001',
        })
        .expect(201);

      const product2 = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product 2',
          price: '200.00',
          stock: 20,
          sku: 'PROD-002',
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
          expect(res.body[0].id).toBe(product2.body.id); // Most recent first
          expect(res.body[1].id).toBe(product1.body.id);
        });
    });
  });

  describe('GET /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: '99.99',
          stock: 5,
          sku: 'TEST-001',
        });
      productId = res.body.id;
    });

    it('should return a product by id', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
          expect(res.body.name).toBe('Test Product');
          expect(res.body.price).toBe('99.99');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: '99.99',
          stock: 5,
          sku: 'TEST-001',
        });
      productId = res.body.id;
    });

    it('should update a product', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ name: 'Updated Product' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Product');
          expect(res.body.price).toBe('99.99');
        });
    });

    it('should update stock', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ stock: 15 })
        .expect(200)
        .expect((res) => {
          expect(res.body.stock).toBe(15);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .patch('/products/non-existent-id')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: '99.99',
          stock: 5,
          sku: 'TEST-001',
        });
      productId = res.body.id;
    });

    it('should delete a product', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .delete('/products/non-existent-id')
        .expect(404);
    });
  });
});
