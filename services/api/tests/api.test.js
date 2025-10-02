const request = require('supertest');
const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');

// Mock Firebase for testing
jest.mock('firebase/app');
jest.mock('firebase/firestore');

const app = require('../index');

describe('AIOS API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Endpoint', () => {
    test('GET /api/health should return system status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'AIOS Server is running');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Config Endpoint', () => {
    test('GET /api/config should return configuration', async () => {
      const response = await request(app)
        .get('/api/config')
        .expect(200);

      expect(response.body).toHaveProperty('projectId');
      expect(response.body).toHaveProperty('apiUrl');
      expect(response.body).toHaveProperty('wsUrl');
    });
  });

  describe('Apps API', () => {
    beforeEach(() => {
      // Mock Firestore responses
      getDocs.mockResolvedValue({
        size: 2,
        docs: [
          {
            id: 'app1',
            data: () => ({
              name: 'Test App 1',
              description: 'Test Description 1',
              category: 'general',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            })
          },
          {
            id: 'app2',
            data: () => ({
              name: 'Test App 2',
              description: 'Test Description 2',
              category: 'ai',
              status: 'inactive',
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
        ]
      });
    });

    test('GET /api/apps should return all apps', async () => {
      const response = await request(app)
        .get('/api/apps')
        .expect(200);

      expect(response.body).toHaveProperty('apps');
      expect(Array.isArray(response.body.apps)).toBe(true);
      expect(response.body.apps).toHaveLength(2);
    });

    test('POST /api/apps should create a new app', async () => {
      const newApp = {
        name: 'New Test App',
        description: 'New Test Description',
        category: 'automation',
        config: { setting: 'value' }
      };

      addDoc.mockResolvedValue({ id: 'newAppId' });

      const response = await request(app)
        .post('/api/apps')
        .send(newApp)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newApp.name);
      expect(response.body).toHaveProperty('description', newApp.description);
      expect(response.body).toHaveProperty('category', newApp.category);
      expect(response.body).toHaveProperty('status', 'inactive');
    });

    test('POST /api/apps should require name and description', async () => {
      const invalidApp = {
        category: 'general'
      };

      const response = await request(app)
        .post('/api/apps')
        .send(invalidApp)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Name and description are required');
    });

    test('PUT /api/apps/:id should update an app', async () => {
      const updateData = {
        name: 'Updated App Name',
        description: 'Updated Description'
      };

      updateDoc.mockResolvedValue();

      const response = await request(app)
        .put('/api/apps/app1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', 'app1');
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('description', updateData.description);
    });

    test('DELETE /api/apps/:id should delete an app', async () => {
      deleteDoc.mockResolvedValue();

      const response = await request(app)
        .delete('/api/apps/app1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'App deleted successfully');
    });
  });

  describe('System API', () => {
    beforeEach(() => {
      getDocs.mockResolvedValue({
        size: 3,
        docs: [
          { data: () => ({ status: 'active' }) },
          { data: () => ({ status: 'active' }) },
          { data: () => ({ status: 'inactive' }) }
        ]
      });
    });

    test('GET /api/system/status should return system status', async () => {
      const response = await request(app)
        .get('/api/system/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('totalApps', 3);
      expect(response.body).toHaveProperty('activeApps', 2);
      expect(response.body).toHaveProperty('inactiveApps', 1);
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /api/system/logs should return system logs', async () => {
      getDocs.mockResolvedValue({
        docs: [
          {
            id: 'log1',
            data: () => ({
              level: 'info',
              message: 'Test log message',
              timestamp: new Date(),
              metadata: {}
            })
          }
        ]
      });

      const response = await request(app)
        .get('/api/system/logs')
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    test('POST /api/system/logs should create a new log', async () => {
      const logData = {
        level: 'info',
        message: 'Test log message',
        metadata: { source: 'test' }
      };

      addDoc.mockResolvedValue({ id: 'newLogId' });

      const response = await request(app)
        .post('/api/system/logs')
        .send(logData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('level', logData.level);
      expect(response.body).toHaveProperty('message', logData.message);
    });

    test('POST /api/system/logs should require level and message', async () => {
      const invalidLog = {
        metadata: { source: 'test' }
      };

      const response = await request(app)
        .post('/api/system/logs')
        .send(invalidLog)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Level and message are required');
    });
  });

  describe('Error Handling', () => {
    test('should handle Firebase errors gracefully', async () => {
      getDocs.mockRejectedValue(new Error('Firebase connection failed'));

      const response = await request(app)
        .get('/api/apps')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Firebase connection failed');
    });
  });
});
