import request from "supertest"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

let connection: Connection
let token: string

describe("Create Statement", () => {
    beforeAll(async () => {
        connection = await createConnection()
        await connection.runMigrations()

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
    
        token = authentication.body.token
    })

    afterAll(async() => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should be able to create a new deposit statement", async () => {

        const statement = await request(app)
            .post("/api/v1/statements/deposit")
            .set("Authorization", `bearer ${token}`)
            .send({
                amount: 100,
                description: "Test description"
            })

        expect(statement.body).toHaveProperty("id")
        expect(statement.body.type).toEqual(OperationType.DEPOSIT)
        expect(statement.body.amount).toEqual(100)
    })

    it("should be able to create a new withdraw statement", async () => {

        const statement = await request(app)
            .post("/api/v1/statements/withdraw")
            .set("Authorization", `bearer ${token}`)
            .send({
                amount: 50,
                description: "Test description"
            })

        expect(statement.body).toHaveProperty("id")
        expect(statement.body.type).toEqual(OperationType.WITHDRAW)
        expect(statement.body.amount).toEqual(50)
    })

    it("should not be able to create a new withdraw statement if there is not enought in balance", async () => {

        const result = await request(app)
            .post("/api/v1/statements/withdraw")
            .set("Authorization", `bearer ${token}`)
            .send({
                amount: 100,
                description: "Test description"
            })

        expect(result.status).toBe(400)
        expect(result.body).toHaveProperty("message")
        expect(result.body.message).toEqual("Insufficient funds")
    })

    it("should not be able to create a new statement with invalid or no token", () => {
        /* Os testes de token invalido e sem token de autenticação já estão sendo cobertos no 
        arquivo ShowUserProfileController.spec.ts */
    })

    it("should not be able to create a new statement with wrong ID", () => {
        /* Ao enviar o ID errado ele irá retornar um erro de autenticação, já coberto pelos testes
        no AuthneticateUserController.spec.ts */
    })
})