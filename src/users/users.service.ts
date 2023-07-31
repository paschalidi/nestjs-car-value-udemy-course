import { Injectable, NotFoundException } from "@nestjs/common";
import { FindOneOptions, Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  /**
   * Note: with this bit here nestjs will generate the Repository for us
   * REMEMBER then Repository is a class provided by TypeORM
   * also it has methods like find, findOne, create, save, remove
   */
  constructor(@InjectRepository(User) private repo: Repository<User>) {
  }

  create(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }

  async findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOne({ where: { id } });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.repo.save({ ...user, ...attrs });
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.repo.remove(user);
  }
}
