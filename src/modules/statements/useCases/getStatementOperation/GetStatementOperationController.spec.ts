import request from "supertest"
import { v4 as uuidV4 } from "uuid"
import { Connection } from "typeorm"

import createConnection from "../../../../database"

import { app } from "../../../../app"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"

let connection: Connection
let token: string
let statement_id: string

describe("Get Statement Operation", () => {
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

        const statement = await request(app)
            .post("/api/v1/statements/deposit")
            .set("Authorization", `bearer ${token}`)
            .send({
                amount: 100,
                description: "Test description"
            })

        statement_id = statement.body.id
    })

    afterAll(async () => {
        await connection.dropDatabase()
        await connection.close()
    })

    it("should be able to get an statement operation", async () => {

        const statementOperation = await request(app)
        .get(`/api/v1/statements/${statement_id}`)
        .set("Authorization", `bearer ${token}`)

        const statementOperationParsed = JSON.parse(statementOperation.text)

        expect(statementOperationParsed).toHaveProperty("user_id")
        expect(statementOperationParsed).toHaveProperty("id")
    })

    it("should not be able to get an statement operation with wrong statement ID", async () => {

        const idErrada = uuidV4()

        const statementOperation = await request(app)
        .get(`/api/v1/statements/${idErrada}`)
        .set("Authorization", `bearer ${token}`)

        const statementOperationParsed = JSON.parse(statementOperation.text)

        expect(statementOperation.status).toBe(404)
        expect(statementOperationParsed).toHaveProperty("message")
        expect(statementOperationParsed.message).toEqual("Statement not found")
    })
})