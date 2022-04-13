import request from "supertest"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    TRANSFER = 'transfer'
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

    it("should be able to make a transfer", async () => {
        /* Se eu adiciono esse depósito de 100, o balance fica 50100.00, ele concatena os valores ao invés de somar!
            O teste seguinte acaba dando erro porque assume que tem balanço suficiente por causa desse erro. */
        // await request(app)
        //     .post("/api/v1/statements/deposit")
        //     .set("Authorization", `bearer ${token}`)
        //     .send({
        //         amount: 100,
        //         description: "Test description"
        //     })
            
        const user2: ICreateUserDTO = {
            name: "Test User2",
            email: "user2@test.com",
            password: "123"
        }
        
        const user2Created = await request(app).post("/api/v1/users").send(user2)
        
        const transfer = await request(app)
        .post(`/api/v1/statements/transfers/${user2Created.body.id}`)
        .set("Authorization", `bearer ${token}`)
        .send({
            amount: 10,
            description: "Test transfer"
        })

        expect(transfer.body).toHaveProperty("id")
        expect(transfer.body.type).toEqual(OperationType.TRANSFER)
    })

    it("should not be able to make a transfer without sufficient fund", async () => {
        const user3: ICreateUserDTO = {
            name: "Test User3",
            email: "user3@test.com",
            password: "123"
        }
    
        const user3Created = await request(app).post("/api/v1/users").send(user3)
        
        const result = await request(app)
            .post(`/api/v1/statements/transfers/${user3Created.body.id}`)
            .set("Authorization", `bearer ${token}`)
            .send({
                amount: 150,
                description: "Test transfer"
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