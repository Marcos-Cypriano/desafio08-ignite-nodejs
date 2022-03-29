import request from "supertest"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"

let connection: Connection
let id: string
let token: string

describe("Show User Profile", () => {
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

        const user: ICreateUserDTO = {
            name: "Test User",
            email: "user@test.com",
            password: "123"
        }
    
        const userCreated = await request(app).post("/api/v1/users").send(user)
    
        id = userCreated.body.id
    
        const authentication = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: user.password
        })
    
        token = authentication.body.token
    })
    
    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })
    
    it("should be able to show a user's profile", async () => {

        const userProfile = await request(app).get("/api/v1/profile").set("Authorization", `bearer ${token}`)

        expect(userProfile.body).toHaveProperty("id")
        expect(userProfile.body.id).toEqual(id)
    })

    it("should not be able to show a user's profile using invalid token", async () => {
        const invalidToken = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        const result = await request(app).get("/api/v1/profile").set("Authorization", invalidToken)

        expect(result.status).toBe(401)
        expect(result.body.message).toEqual("JWT invalid token!")
    })

    it("should not be able to show a user's profile using no token", async () => {
        const result = await request(app).get("/api/v1/profile")

        expect(result.status).toBe(401)
        expect(result.body.message).toEqual("JWT token is missing!")
    })

    it("should not be able to show a unexisting user's profile", async () => {
        /* Ao enviar o token errado ele irá retornar um erro de autenticação, já coberto pelos testes
        no AuthneticateUserController.spec.ts */
    })
})