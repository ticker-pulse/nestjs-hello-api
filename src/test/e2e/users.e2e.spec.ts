import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { resetTestDatabase, setupTestDatabase, teardownTestDatabase } from '../setup';

describe('Users E2E', () => {
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

  describe('POST /users', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('John Doe');
          expect(res.body.email).toBe('john@example.com');
          expect(res.body.isActive).toBe(true);
        });
    });

    it('should create a user with phone', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+1234567890',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.phone).toBe('+1234567890');
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Invalid User',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should reject missing name', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return empty list initially', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should return all created users', async () => {
      // Create two users
      const user1 = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'User 1', email: 'user1@example.com' })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'User 2', email: 'user2@example.com' })
        .expect(201);

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
          expect(res.body[0].id).toBe(user2.body.id); // Most recent first
          expect(res.body[1].id).toBe(user1.body.id);
        });
    });
  });

  describe('GET /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Test User', email: 'test@example.com' });
      userId = res.body.id;
    });

    it('should return a user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.name).toBe('Test User');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Test User', email: 'test@example.com' });
      userId = res.body.id;
    });

    it('should update a user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ name: 'Updated User' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated User');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('should update multiple fields', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ name: 'Updated User', phone: '+1987654321' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated User');
          expect(res.body.phone).toBe('+1987654321');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/non-existent-id')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Test User', email: 'test@example.com' });
      userId = res.body.id;
    });

    it('should delete a user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .expect(404);
    });
  });
});
