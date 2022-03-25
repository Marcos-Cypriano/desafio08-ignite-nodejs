import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let inMemoryUsersRespository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe("Get Statement Operation", () => {
    beforeEach(() => {
        inMemoryUsersRespository = new InMemoryUsersRepository()
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRespository)
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRespository,inMemoryStatementsRepository)
        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRespository,inMemoryStatementsRepository)
    })

    it("should be able to get a statement operation", async () => {
        const user: ICreateUserDTO = {
            name: "User10 test",
            email: "user10@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)

        const user_id = String(userCreated.id)

        const statement1: ICreateStatementDTO = {
            user_id: user_id,
            description: "Test description",
            amount: 100,
            type: OperationType.DEPOSIT
        }

        const statement1Created = await createStatementUseCase.execute(statement1)
        const statement_id = statement1Created.id as string

        const statement2: ICreateStatementDTO = {
            user_id: user_id,
            description: "Test2 description",
            amount: 50,
            type: OperationType.WITHDRAW
        }

        await createStatementUseCase.execute(statement2)

        const operation = await getStatementOperationUseCase.execute({ user_id, statement_id })

        expect(operation).toHaveProperty("id")
        expect(operation.type).toEqual(OperationType.DEPOSIT)
    })

    it("should not be able to get a statement operation with invalid user id", async () => {
        const user: ICreateUserDTO = {
            name: "User10 test",
            email: "user10@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)

        const user_id = String(userCreated.id)

        const statement1: ICreateStatementDTO = {
            user_id: user_id,
            description: "Test description",
            amount: 100,
            type: OperationType.DEPOSIT
        }

        const statement1Created = await createStatementUseCase.execute(statement1)
        const statement_id = statement1Created.id as string

        expect(async () => {
            const operation = await getStatementOperationUseCase.execute({ user_id: "ID errada", statement_id })
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
    })

    it("should not be able to get a statement operation with invalid statement id", async () => {
        const user: ICreateUserDTO = {
            name: "User10 test",
            email: "user10@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)

        const user_id = String(userCreated.id)

        const statement1: ICreateStatementDTO = {
            user_id: user_id,
            description: "Test description",
            amount: 100,
            type: OperationType.DEPOSIT
        }

        await createStatementUseCase.execute(statement1)

        expect(async () => {
            const operation = await getStatementOperationUseCase.execute({ user_id, statement_id: "ID errada" })
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
    })
})