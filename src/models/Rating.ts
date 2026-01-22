'use server';
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface RatingAttributes {
  id: number;
  restaurantId: number;   // FK → Restaurants.id
  userId: string;          // FK → Users.uuid
  rating_service: number;
  rating_foodquality: number;
  rating_ambiance: number;
  meal: "Breakfast" | "Brunch" | "Lunch" | "Dinner" | null;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RatingCreationAttributes
  extends Optional<RatingAttributes, 'id'> {}

class Rating extends Model<
  RatingAttributes,
  RatingCreationAttributes
> implements RatingAttributes {

  public id!: number;
  public restaurantId!: number;
  public userId!: string;
  public rating_service!: number;
  public rating_foodquality!: number;
  public rating_ambiance!: number;
  public meal!: "Breakfast" | "Brunch" | "Lunch" | "Dinner" | null;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Rating {
    Rating.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        restaurantId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "Restaurants", key: "id" },
          onDelete: "CASCADE",
        },

        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "Users", key: "uuid" },
          onDelete: "CASCADE",
        },

        rating_service: { type: DataTypes.INTEGER, allowNull: false },
        rating_foodquality: { type: DataTypes.INTEGER, allowNull: false },
        rating_ambiance: { type: DataTypes.INTEGER, allowNull: false },

        meal: {
          type: DataTypes.ENUM("Breakfast", "Brunch", "Lunch", "Dinner"),
          allowNull: true,
        },

        notes: { type: DataTypes.TEXT, allowNull: true },

        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      },
      {
        sequelize,
        modelName: "Rating",
        tableName: "Ratings",
      }
    );

    return Rating;
  }

  static associate(models: any) {
    Rating.belongsTo(models.Restaurant, {
      foreignKey: "restaurantId",
      as: "restaurant",
    });

    Rating.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

export default Rating;