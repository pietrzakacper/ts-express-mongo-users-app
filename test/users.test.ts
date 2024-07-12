import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initDb as initDbConnection } from '../src/db';
import { usersRoutes } from '../src/routes';
import { UsersController } from '../src/controllers';
import { Server, startServer } from '../src/http-server';
import freeports from 'find-free-ports';
import { sleep } from '../src/utils';

let mongod: MongoMemoryServer;
let server: Server;
let server_url: string;

beforeEach(async () => {
    mongod = await MongoMemoryServer.create();

    const db_uri = mongod.getUri();

    const db = await initDbConnection(db_uri, 'test');

    const routes = [usersRoutes(new UsersController(db))];

    const server_port = (await freeports(1))[0]!;
    const host = 'localhost';

    server_url = `http://${host}:${server_port}`;

    server = await startServer(host, server_port!, routes);
});

afterEach(async () => {
    await server.close();
    await mongod.stop();
});

describe('/users', () => {
    test('GET /users returns empty list when no users where created', async () => {
        const response = await fetch(`${server_url}/users`);
        expect(response.ok).toBe(true);

        const users = await response.json();

        expect(users).toEqual([]);
    });

    test('GET /users returns created users', async () => {
        const user1CreatedResponse = await postCreateUser({
            name: 'John Doe',
            email: 'john@gmail.com',
        });

        expect(user1CreatedResponse.ok).toBe(true);

        const response = await fetch(`${server_url}/users`);
        expect(response.ok).toBe(true);

        const users = await response.json();

        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(1);
        expect(users[0].name).toBe('John Doe');
        expect(users[0].email).toBe('john@gmail.com');
        expect(users[0].id).toBeTypeOf('string');
        expect(users[0].created_at).toBeTypeOf('string');
    });

    test('GET /users returns users sorted by creation date', async () => {
        const responses = await Promise.all([
            postCreateUser({ name: 'Ralph Sapkowski', email: 'ralph@yahoo.com' }),
            // the created_at has a resolution of seconds, so we need to wait at least 1 second
            sleep(1000).then(() =>
                postCreateUser({ name: 'Mark Idaho', email: 'mark@hotmail.com' }),
            ),
        ]);

        expect(responses.every((r) => r.ok)).toBe(true);

        // test descending sorting by creation date
        {
            const responseDesc = await fetch(`${server_url}/users?created=desc`);
            expect(responseDesc.ok).toBe(true);

            const usersDesc = await responseDesc.json();
            expect(usersDesc.length).toBe(2);
            expect(usersDesc[0].name).toBe('Mark Idaho');
            expect(usersDesc[1].name).toBe('Ralph Sapkowski');
        }

        // test ascending sorting by creation date
        {
            const responseAsc = await fetch(`${server_url}/users?created=asc`);
            expect(responseAsc.ok).toBe(true);

            const usersAsc = await responseAsc.json();
            expect(usersAsc.length).toBe(2);
            expect(usersAsc[0].name).toBe('Ralph Sapkowski');
            expect(usersAsc[1].name).toBe('Mark Idaho');
        }
    });

    test('POST /users returns a new user', async () => {
        const response = await postCreateUser({ name: 'John Doe', email: 'john@gmail.com' });
        expect(response.ok).toBe(true);

        const newUser = await response.json();
        expect(newUser.name).toBe('John Doe');
        expect(newUser.email).toBe('john@gmail.com');
        expect(newUser.id).toBeTypeOf('string');
        expect(newUser.created_at).toBeTypeOf('string');
    });

    test('POST /users returns 400 when invalid body is sent', async () => {
        const response = await fetch(`${server_url}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'John Doe',
            }),
        });

        expect(response.status).toBe(400);
    });

    test('POST /users returns email-exists errorr when email is already in use', async () => {
        const response1 = await postCreateUser({ name: 'John Doe', email: 'john@gmail.com' });
        expect(response1.ok).toBe(true);

        const response2 = await postCreateUser({ name: 'Other John', email: 'john@gmail.com' });
        expect(response2.status).toBe(400);

        const body = await response2.json();
        expect(body.errorCode).toBe('email-exists');
    });
});

function postCreateUser(payload: { name: string; email: string }) {
    return fetch(`${server_url}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: payload.name,
            email: payload.email,
        }),
    });
}
