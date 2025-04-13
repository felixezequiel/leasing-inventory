import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const table = await queryInterface.describeTable('users');

  if (table.google_id) return;
  
  await queryInterface.addColumn('users', 'google_id', {
    type: DataTypes.STRING,
    allowNull: true
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('users', 'google_id');
}; 