import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase} from "./ShowUserProfileUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

describe("Show User Profile", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    })

    it("Should be able to show the user profile", async () => {
        const user: ICreateUserDTO = {
            name: "User3 test",
            email: "user3@test.com",
            password: "123" 
        }

        const userCreated = await createUserUseCase.execute(user)
        const user_id = userCreated.id as string

        const userProfile = await showUserProfileUseCase.execute(user_id)

        expect(userProfile).toHaveProperty("id")
    })

    it("Should not be able to show the user profile with wrong id", () => {
        const user: ICreateUserDTO = {
            name: "User4 test",
            email: "user4@test.com",
            password: "123" 
        }

        expect(async () => {
            await createUserUseCase.execute(user)
    
            await showUserProfileUseCase.execute("ID errada")
        }).rejects.toBeInstanceOf(ShowUserProfileError)
    })
})