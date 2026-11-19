import { FindOptionsOrder } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { NotFoundError, ConflictError } from '../utils/errors';
import bcrypt from 'bcrypt';
import { createLogger } from '../utils/logger';

const logger = createLogger('UserService');
const userRepository = AppDataSource.getRepository(User);

type SortableUserField = keyof Pick<
  User,
  'id' | 'name' | 'email' | 'isActive' | 'age' | 'createdAt' | 'updatedAt'
>;

const ALLOWED_SORT_FIELDS: SortableUserField[] = [
  'id',
  'name',
  'email',
  'isActive',
  'age',
  'createdAt',
  'updatedAt',
];

interface FindAllOptions {
  page: number;
  limit: number;
  sort: string;
  order: 'ASC' | 'DESC';
}

const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  age: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  static async findAll(options: FindAllOptions): Promise<[User[], number]> {
    const { page, limit, sort, order } = options;
    const skip = (page - 1) * limit;

    const sortField: SortableUserField = ALLOWED_SORT_FIELDS.includes(
      sort as SortableUserField
    )
      ? (sort as SortableUserField)
      : 'id';

    const orderBy: FindOptionsOrder<User> = {
      [sortField]: order,
    };

    return userRepository.findAndCount({
      select: USER_SAFE_SELECT,
      order: orderBy,
      skip,
      take: limit,
    });
  }

  static async findById(id: number): Promise<User> {
    const user = await userRepository.findOne({
      where: { id },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return user;
  }

  static async create(data: {
    name: string;
    email: string;
    password: string;
    age?: number;
  }): Promise<User> {
    const existing = await userRepository.findOne({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const savedUser = await userRepository.save(user);
    delete (savedUser as Partial<User>).password;

    return savedUser;
  }

  static async update(id: number, data: Partial<User>): Promise<User> {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findOne({
        where: { email: data.email },
      });

      if (existing) {
        throw new ConflictError('A user with this email already exists');
      }
    }

    Object.assign(user, data);

    return userRepository.save(user);
  }

  static async delete(id: number): Promise<void> {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    await userRepository.remove(user);
  }
}

