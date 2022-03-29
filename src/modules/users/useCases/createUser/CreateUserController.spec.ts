import request from "supertest"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { ICreateUserDTO } from "./ICreateUserDTO"
import exp from "constants"

let connection: Connection
let user: ICreateUserDTO

describe("Create User", () => {
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        user = {
            name: "Test User",
            email: "user@test.com",
            password: "123"
        }
    })

    afterAll(async() => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("Should be able to create a new user", async () => {

        const result = await request(app).post("/api/v1/users").send(user)

        expect(result.status).toBe(201)
        expect(result.body).toHaveProperty("id")
    })

    it("Should not be able to create a new user with existing email", async () => {

        const result = await request(app).post("/api/v1/users").send(user)

        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual("User already exists")
    })
})