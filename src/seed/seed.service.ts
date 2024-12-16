import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const user = await this.insertNewUsers();
    await this.insertNewProducts(user);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const query = this.userRepository.createQueryBuilder();
    await query.delete().where({}).execute();
  }

  async insertNewUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      const newUser = this.userRepository.create(user);
      users.push(newUser);
    });

    const dbUser = await this.userRepository.save(users);
    return dbUser[0];
  }

  async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const insertPromises = [];
    const products = initialData.products;
    products.forEach(async (product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromises);
    return true;
  }
}
