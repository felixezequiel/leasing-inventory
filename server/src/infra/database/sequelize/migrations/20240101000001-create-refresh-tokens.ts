import { QueryInterface } from 'sequelize';
import RefreshToken from '../models/RefreshToken';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('refresh_tokens', RefreshToken.getAttributes());
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('refresh_tokens');
};
