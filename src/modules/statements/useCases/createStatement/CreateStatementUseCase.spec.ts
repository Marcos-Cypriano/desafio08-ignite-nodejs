import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from "./ICreateStatementDTO"

let inMemoryUsersRespository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe("Create Statement", () => {
    beforeEach(() => {
        inMemoryUsersRespository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRespository)
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRespository,inMemoryStatementsRepository)
    })

    it("Should be able to create a deposit", async () => {
        const user: ICreateUserDTO = {
            name: "User7 test",
            email: "user7@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)
        // user_id = userCreated.id as string

        const statement: ICreateStatementDTO = {
            user_id: userCreated.id as string,
            description: "Test description",
            amount: 100,
            type: OperationType.DEPOSIT
        } 

        const statementDone = await createStatementUseCase.execute(statement)

        expect(statementDone).toHaveProperty("id")
    })

    it("Should not be able to create a withdraw due to insufficient funds", async () => {
        const user: ICreateUserDTO = {
            name: "User8 test",
            email: "user8@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)
        const user_id = userCreated.id as string

        const statement: ICreateStatementDTO = {
            user_id: user_id,
            description: "Test description",
            amount: 100,
            type: OperationType.WITHDRAW
        } 

        expect(async () => {
            await createStatementUseCase.execute(statement)
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
    })

    it("Should not be able to create a deposit with a non existing user_id", async () => {
        const user: ICreateUserDTO = {
            name: "User9 test",
            email: "user9@test.com",
            password: "123" 
        }

        await createUserUseCase.execute(user)

        const statement: ICreateStatementDTO = {
            user_id: "ID errada",
            description: "Test description",
            amount: 100,
            type: OperationType.DEPOSIT
        } 

        expect(async () => {
            await createStatementUseCase.execute(statement)
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
    })
})