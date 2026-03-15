import request from 'supertest';
import { app } from '../index';

describe('GET /', () => {
  it('responds with API running message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
