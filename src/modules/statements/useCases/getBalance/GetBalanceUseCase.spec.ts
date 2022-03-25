import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let inMemoryUsersRespository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createStatementUseCase: CreateStatementUseCase
let getBalanceUseCase: GetBalanceUseCase

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

describe("Get Balance", () => {
    beforeEach(() => {
        inMemoryUsersRespository = new InMemoryUsersRepository()
        inMemoryStatementsRepository = new InMemoryStatementsRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRespository)
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRespository,inMemoryStatementsRepository)
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository,inMemoryUsersRespository)
    })

    it("Should be able to get the balance from a user", async () => {
        const user: ICreateUserDTO= {
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

        const statement2: ICreateStatementDTO = {
            user_id: user_id,
            description: "Test2 description",
            amount: 50,
            type: OperationType.WITHDRAW
        }

        await createStatementUseCase.execute(statement2)

        const balance = await getBalanceUseCase.execute({user_id: user_id})

        expect(balance).toHaveProperty("balance")
        expect(balance.balance).toEqual(50)
    })

    it("Should not be able to get the balance from a nonexisting user", async () => {
        const user: ICreateUserDTO= {
            name: "User11 test",
            email: "user11@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)

        //const user_id = String(userCreated.id)

        const statement1: ICreateStatementDTO = {
            user_id: userCreated.id as string,
            description: "Test description",
            amount: 100,
            type: OperationType.DEPOSIT
        }

        await createStatementUseCase.execute(statement1)
        
        expect(async () => {
            await getBalanceUseCase.execute({ user_id: "ID errada" })
        }).rejects.toBeInstanceOf(GetBalanceError)
    })
})