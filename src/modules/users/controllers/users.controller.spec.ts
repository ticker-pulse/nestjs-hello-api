import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach } from 'vitest';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';
import {
  createMockUsersService,
  type MockedUsersService,
} from '@/test/mocks/users.service.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let service: MockedUsersService;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    phone: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    service = createMockUsersService();

    // Create controller with type-safe mock
    controller = new UsersController(service as unknown as UsersService);
  });

  describe('POST /users', () => {
    it('should create a user and return 201', async () => {
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create({
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(result).toEqual(mockUser);
    });

    it('should create a user with phone', async () => {
      service.create.mockResolvedValue(mockUser);

      await controller.create({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
      });

      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      service.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUser);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated User' };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', { name: 'Updated User' });

      expect(result.name).toBe('Updated User');
    });

    it('should throw NotFoundException when user not found', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.update('invalid-id', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user and return 204', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('user-1');

      expect(service.remove).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
