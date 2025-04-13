import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../index';
import User from './User';

interface RefreshTokenAttributes {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface RefreshTokenCreationAttributes extends Optional<RefreshTokenAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
  public id!: string;
  public userId!: string;
  public token!: string;
  public expiresAt!: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    modelName: 'RefreshToken',
    timestamps: true,
  }
);

// Define associations
RefreshToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(RefreshToken, { foreignKey: 'userId' });

export default RefreshToken;
