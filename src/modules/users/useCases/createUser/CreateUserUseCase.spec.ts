import { CreateUserError } from "./CreateUserError";

import { CreateUserUseCase } from "./CreateUserUseCase"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create User", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    })

    it("Should be able to create a new user", async () => {
        const user: ICreateUserDTO = {
            name: "User1 test",
            email: "user1@test.com",
            password: "123"
        }

        const userCreated = await createUserUseCase.execute(user)

        expect(userCreated).toHaveProperty("id")
    })

    it("Should not be able to create a new user with existing email", () => {
        const user: ICreateUserDTO = {
            name: "User2 test",
            email: "user2@test.com",
            password: "123"
        }
        
        expect(async () => {
            await createUserUseCase.execute(user)

            await createUserUseCase.execute(user)
        }).rejects.toBeInstanceOf(CreateUserError)
    })
})