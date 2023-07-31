import {
  Body,
  Controller,
  Delete,
  Get, NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session, UseGuards
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user-dto";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dtos/update-user-dto";
import { Serialize } from "../interceptors/serialize.interceptor";
import { UserDto } from "./dtos/user.dto";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "./user.entity";
import { AuthGuard } from "../guards/auth.guard";

@Controller("auth")
@Serialize(UserDto)
export class UsersController {
  constructor(private usersService: UsersService, private authService: AuthService) {
  }

  @Get("/whoami")
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post("/signout")
  async signoutUser(@Session() session: any) {
    session.userId = null;
  }

  @Post("/signup")
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post("/signin")
  async signinUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  // find a specific user given the id coming from the request
  @Get("/:id")
  async findUser(@Param("id") id: string) {
    const user = await this.usersService.findOne(parseInt(id));

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  // find all users with given email
  @Get()
  findAllUsers(@Query("email") email: string) {
    return this.usersService.find(email);
  }

  //update users given a body of the request
  @Patch("/:id")
  updateUser(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }

  // delete a user given the id coming from the request
  @Delete("/:id")
  removeUser(@Param("id") id: string) {
    return this.usersService.remove(parseInt(id));
  }
}
