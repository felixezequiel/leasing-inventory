import { Body, Delete, Get, JsonController, Param, Post, Put } from 'routing-controllers';
import { UserService } from '@application/services/UserService';
import { UserRepositoryImpl } from '@data/repositories/UserRepositoryImpl';
import { CreateUserDto, UpdateUserDto } from '@shared/dtos/UserDto';

@JsonController('/users')
export class UserController {
  private userService: UserService;

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
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(createUserDto);
      return { user };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create user' };
    }
  }

  @Put('/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.updateUser(id, updateUserDto);
    
    if (!user) {
      return { error: 'User not found' };
    }
    
    return { user };
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    const success = await this.userService.deleteUser(id);
    
    if (!success) {
      return { error: 'User not found' };
    }
    
    return { success };
  }
} 