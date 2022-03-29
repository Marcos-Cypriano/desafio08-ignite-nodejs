import request from "supertest"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"

let connection: Connection

describe("Get Balance", () => {
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()
    })

    afterAll(async() => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should be able to get user's balance", async () => {
        const user: ICreateUserDTO = {
            name: "Test User",
	        email: "user@test.com",
	        password: "123"
        }

        await request(app).post("/api/v1/users").send(user)

        const authentication = await request(app).post("/api/v1/sessions").send({
            email: user.email,
            password: user.password
        })

        const token = authentication.body.token

        await request(app)
            .post("/api/v1/statements/deposit")
            .set("Authorization", `bearer ${token}`)
            .send({
                amount: 100,
                description: "Test description"
            })

        const balanceDTO = await request(app)
        .get("/api/v1//statements/balance")
        .set("Authorization", `bearer ${token}`)

        expect(balanceDTO.body).toHaveProperty("balance")
        expect(balanceDTO.body.balance).toEqual(100)
    })

    it("should not be able to get balance with invalid or no token", () => {
        /* Os testes de token invalido e sem token de autenticação já estão sendo cobertos no 
        arquivo ShowUserProfileController.spec.ts */
    })

    it("should not be able to get user's balance with wrong ID", () => {
        /* Ao enviar o token errado ele irá retornar um erro de autenticação, já coberto pelos testes
        no AuthneticateUserController.spec.ts */
    })
})