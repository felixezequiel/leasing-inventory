import { Body, Controller, Delete, Get, Param, Post, Put } from 'routing-controllers';
import { UserService } from '@application/services/UserService';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';
import { CreateUserDto, UpdateUserDto } from '@shared/dtos/UserDto';
import { Protected, Public, CurrentUser } from '../decorators/auth.decorator';
import { User } from '@domain/entities/User';

@Controller('/users')
@Protected()
export class UserController {
  private readonly userService: UserService;

  constructor() {
    // Em um cenário real, isso seria injetado por um container DI
    const userRepository = new UserRepositoryImpl();
    this.userService = new UserService(userRepository);
  }

  @Get()
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return { users };
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    return { user };
  }

  @Post()
  @Public()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(createUserDto);
      return { user };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create user' };
    }
  }

  @Put('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ) {
    // Verifica se o usuário está tentando atualizar seu próprio perfil
    if (id !== currentUser.id) {
      return { error: 'You can only update your own profile' };
    }

    const user = await this.userService.updateUser(id, updateUserDto);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    return { user };
  }

  @Delete('/:id')
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: User
  ) {
    // Verifica se o usuário está tentando deletar seu próprio perfil
    if (id !== currentUser.id) {
      return { error: 'You can only delete your own profile' };
    }

    const success = await this.userService.deleteUser(id);
    
    if (!success) {
      return { error: 'User not found' };
    }
    
    return { success };
  }
} 