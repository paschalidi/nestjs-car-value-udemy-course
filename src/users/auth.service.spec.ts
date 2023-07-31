import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { scrypt } from "crypto";

describe("AuthService", () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;


  beforeEach(async () => {
    fakeUsersService = {
      find: (email: string) => {
        return Promise.resolve([]);
      },
      create: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should singup user", async () => {
    const user = await service.signup("test@test.com", "123");

    expect(user.password).not.toEqual("123");
    const [salt, hash] = user.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("should throw an error when email already in use", async () => {
    fakeUsersService.find = () => Promise.resolve([{ id: 1, email: "test@test2.com", password: "1" } as User]);
    await expect(service.signup("test@test.com", "123")).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw an error when signin is called with an unused email", async () => {
    await expect(
      service.signin("asdflkj@asdlfkj.com", "123")
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw an error because the passwords are not the same", async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: "asdf@asdf.com", password: "laskdjf" } as User
      ]);
    await expect(
      service.signin("laskdjf@alskdfj.com", "passowrd")
    ).rejects.toThrow(BadRequestException);
  });

  it("should make sure hashed passwords are the same", async () => {
    fakeUsersService.find = () => Promise.resolve([{
      id: 1,
      email: "test@test.com",
      password: "086d81f9e9ca2339.3ad415596b090cd1f368ae97c241247d7be8b644f14dda38e8b8e324f73e63a4"
    } as User]);

    const user = await service.signin("test@test.com", "123");
    expect(user).toBeDefined();
  });
});
