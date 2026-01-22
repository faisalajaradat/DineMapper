'use server';
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { CUISINE_OPTIONS } from '@/lib/constants';

// ---------------------------------------------
// Types
// ---------------------------------------------

export type Mealtype = "Breakfast" | "Brunch" | "Lunch" | "Dinner" | null;
export type Cuisine = typeof CUISINE_OPTIONS[number];
export type PriceRange = "$" | "$$" | "$$$" | "$$$$";

// What a Restaurant *is* in the DB
export interface RestaurantAttributes {
  id: number;
  name: string;
  address: string;
  cuisine: Cuisine[];
  latitude: number;
  longitude: number;
  priceRange?: PriceRange;
  phone?: string;
  website?: string;
  photos?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// What is needed to *create* a restaurant
export interface RestaurantCreationAttributes
  extends Optional<RestaurantAttributes, 'id'> {}

// For restaurant + aggregate output
export interface RestaurantWithAggregate extends RestaurantAttributes {
  aggregate?: {
    restaurantId: number;
    totalRatings: number;
    avg_service: number;
    avg_foodquality: number;
    avg_ambiance: number;
    avg_overall: number;
    updatedAt: Date;
  };
}

// ---------------------------------------------
// Model
// ---------------------------------------------

class Restaurant extends Model<
  RestaurantAttributes,
  RestaurantCreationAttributes
> implements RestaurantAttributes {

  public id!: number;
  public name!: string;
  public address!: string;
  public cuisine!: Cuisine[];
  public latitude!: number;
  public longitude!: number;
  public priceRange?: PriceRange;
  public phone?: string;
  public website?: string;
  public photos?: string[];
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Restaurant {
    Restaurant.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        latitude: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: false,
        },
        longitude: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: false,
        },
        cuisine: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
        priceRange: {
          type: DataTypes.ENUM("$", "$$", "$$$", "$$$$"),
          allowNull: true,
        },
        phone: { type: DataTypes.STRING, allowNull: true },
        website: { type: DataTypes.STRING, allowNull: true },
        photos: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      },
      {
        sequelize,
        modelName: "Restaurant",
        tableName: "Restaurants",
      }
    );

    return Restaurant;
  }

  static associate(models: any) {
    Restaurant.hasMany(models.Rating, {
      foreignKey: "restaurantId",
      as: "ratings",
    });

    Restaurant.hasOne(models.RestaurantAggregate, {
      foreignKey: "restaurantId",
      as: "aggregate",
    });
  }
}

export default Restaurant;