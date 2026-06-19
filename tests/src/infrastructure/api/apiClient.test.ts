import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../../../../src/infrastructure/api/apiClient';

describe('apiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should successfully make GET request and return data', async () => {
    const mockData = { id: 1, name: 'Sample' };
    const mockResponse = {
      success: true,
      data: mockData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.get('/test');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should successfully make POST request and return data', async () => {
    const mockData = { success: true };
    const mockResponse = {
      success: true,
      data: mockData,
    };
    const bodyData = { key: 'value' };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockResponse,
    });

    const result = await apiClient.post('/test', bodyData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should successfully make PUT request and return data', async () => {
    const mockData = { updated: true };
    const mockResponse = {
      success: true,
      data: mockData,
    };
    const bodyData = { key: 'value' };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.put('/test', bodyData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should successfully make DELETE request and return data', async () => {
    const mockData = { deleted: true };
    const mockResponse = {
      success: true,
      data: mockData,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await apiClient.delete('/test');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should throw an error if response.ok is false', async () => {
    const mockResponse = {
      success: false,
      message: 'Not Found',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => mockResponse,
    });

    await expect(apiClient.get('/test')).rejects.toThrow('Not Found');
  });

  it('should throw HTTP status error if response.ok is false and no message is provided', async () => {
    const mockResponse = {
      success: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => mockResponse,
    });

    await expect(apiClient.get('/test')).rejects.toThrow('HTTP 500');
  });

  it('should throw error if response is ok but data is undefined', async () => {
    const mockResponse = {
      success: true,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    await expect(apiClient.get('/test')).rejects.toThrow('Server returned an empty data payload.');
  });

  it('should handle network failures and throw connecting error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
  });

  it('should handle generic thrown non-Error values and throw fallback message', async () => {
    global.fetch = vi.fn().mockRejectedValue('String Error');

    await expect(apiClient.get('/test')).rejects.toThrow('Failed to connect to server.');
  });
});
