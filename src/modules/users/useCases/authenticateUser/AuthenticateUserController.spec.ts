import "dotenv/config"

import request from "supertest"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { verify } from "jsonwebtoken"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"

interface IPayload {
    sub: string
}

let connection: Connection
let user: ICreateUserDTO
let id: string
let token: string

describe("Authenticate User", () => {
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        user = {
            name: "Test User",
            email: "user@test.com",
            password: "123"
        }

        const userCreated = await request(app).post("/api/v1/users").send(user)
        
        id = userCreated.body.id
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })
    
    it("should be able to authenticate user", async () => {
        const result = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: user.password
        })
    
        token = result.body.token

        const { sub: user_id } = verify(token, String(process.env.JWT_SECRET)) as IPayload

        expect(result.body).toHaveProperty("token")
        expect(user_id).toEqual(id)
    })

    it("should not be able to authenticate user with wrong password", async () => {

        const result = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: "senha errada"
        })

        expect(result.status).toBe(401)
        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual("Incorrect email or password")
    })

    it("should not be able to authenticate user with wrong email", async () => {

        const result = await request(app).post("/api/v1/sessions").send({
            email: "Email errado",
            password: user.password
        })

        expect(result.status).toBe(401)
        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual("Incorrect email or password")
    })
})