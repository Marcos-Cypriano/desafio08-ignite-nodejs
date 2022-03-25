import { verify } from "jsonwebtoken";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase

interface IPayload {
    sub: string
}

describe("Authenticate User", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)   
    })

    it("Should be able to authenticate user", async() => {
        const user: ICreateUserDTO = {
            name: "User1 test",
            email: "user1@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)

        const userAuthenticated = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        })
        
        const { sub: user_id } = verify(userAuthenticated.token, String(process.env.JWT_SECRET)) as IPayload

        expect(userAuthenticated).toHaveProperty("token")
        expect(user_id).toEqual(userCreated.id)
    })

    it("Should not be able to authenticate user with wrong email", async () => {
        const user: ICreateUserDTO = {
            name: "User5 test",
            email: "user5@test.com",
            password: "123" 
        }

        await createUserUseCase.execute(user)

        expect(async () => {
            await authenticateUserUseCase.execute({
                email: "email@errado.com",
                password: user.password
            })
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })

    it("Should not be able to authenticate user with wrong password", async () => {
        const user: ICreateUserDTO = {
            name: "User6 test",
            email: "user6@test.com",
            password: "123" 
        }

        await createUserUseCase.execute(user)

        expect(async () => {
            await authenticateUserUseCase.execute({
                email: user.email,
                password: "321"
            })
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
    })
})