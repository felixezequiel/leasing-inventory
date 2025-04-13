import { QueryInterface } from 'sequelize';
import User from '../models/User';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('users', User.getAttributes());
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('users');
};
