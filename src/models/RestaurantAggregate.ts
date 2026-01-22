'use server';
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface RestaurantAggregateAttributes {
  restaurantId: number;
  totalRatings: number;
  avg_service: number;
  avg_foodquality: number;
  avg_ambiance: number;
  avg_overall: number;
  updatedAt?: Date;
}

export interface RestaurantAggregateCreationAttributes
  extends Optional<RestaurantAggregateAttributes, 'restaurantId'> {}

class RestaurantAggregate
  extends Model<RestaurantAggregateAttributes, RestaurantAggregateCreationAttributes>
  implements RestaurantAggregateAttributes 
{
  public restaurantId!: number;
  public totalRatings!: number;
  public avg_service!: number;
  public avg_foodquality!: number;
  public avg_ambiance!: number;
  public avg_overall!: number;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof RestaurantAggregate {
    RestaurantAggregate.init(
      {
        restaurantId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: {
            model: 'Restaurants',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        totalRatings: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        avg_service: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
          defaultValue: 0,
        },
        avg_foodquality: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
          defaultValue: 0,
        },
        avg_ambiance: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
          defaultValue: 0,
        },
        avg_overall: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
          defaultValue: 0,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'RestaurantAggregate',
        tableName: 'RestaurantAggregates',
        timestamps: false,        
        indexes: [
          {
            fields: ['avg_overall'],
            name: 'aggregates_overall_index',
          },
        ],
      }
    );

    return RestaurantAggregate;
  }

  static associate(models: any) {
    RestaurantAggregate.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant',
    });
  }

  public getDisplayRating(): number {
    return this.avg_overall / 2;
  }
}

export default RestaurantAggregate;