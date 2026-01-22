'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Create new Ratings table
    await queryInterface.createTable('Ratings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Restaurants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'uuid',
        },
        onDelete: 'CASCADE',
      },
      rating_service: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      rating_foodquality: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      rating_ambiance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 10,
        },
      },
      meal: {
        type: Sequelize.ENUM('Breakfast', 'Brunch', 'Lunch', 'Dinner'),
        allowNull: false,
      },
      visitDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Step 2: Create RestaurantAggregates table
    await queryInterface.createTable('RestaurantAggregates', {
      restaurantId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Restaurants',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      totalRatings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      avg_service: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0,
      },
      avg_foodquality: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0,
      },
      avg_ambiance: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0,
      },
      avg_overall: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Step 3: Add new columns to Restaurants (for better data)
    const restaurantTable = await queryInterface.describeTable('Restaurants');

    if (!restaurantTable.priceRange) {
      await queryInterface.addColumn('Restaurants', 'priceRange', {
        type: Sequelize.ENUM('$', '$$', '$$$', '$$$$'),
        allowNull: true,
      });
    }
    
    if (!restaurantTable.phone) {
      await queryInterface.addColumn('Restaurants', 'phone', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    
    if (!restaurantTable.website) {
      await queryInterface.addColumn('Restaurants', 'website', {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      });
    }
    
    if (!restaurantTable.photos) {
      await queryInterface.addColumn('Restaurants', 'photos', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      });
    }
    
    if (!restaurantTable.isActive) {
      await queryInterface.addColumn('Restaurants', 'isActive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    // Step 4: Migrate existing ratings data
    console.log('Migrating existing ratings...');
    
    // Get all restaurants that have ratings
    const restaurantsWithRatings = await queryInterface.sequelize.query(`
      SELECT id, rating_service, rating_foodquality, rating_ambiance, 
             meal, notes, "createdAt", "updatedAt"
      FROM "Restaurants" 
      WHERE rating_service > 0 OR rating_foodquality > 0 OR rating_ambiance > 0
    `, { type: Sequelize.QueryTypes.SELECT });

    // Insert into Ratings table
    for (const restaurant of restaurantsWithRatings) {
      await queryInterface.sequelize.query(`
        INSERT INTO "Ratings" 
        ("restaurantId", userId, rating_service, rating_foodquality, rating_ambiance, 
         meal, notes, "createdAt", "updatedAt")
        VALUES (:restaurantId, :userId, :rating_service, :rating_foodquality, :rating_ambiance,
                :meal, :notes, :createdAt, :updatedAt)
      `, {
        replacements: {
          restaurantId: restaurant.id,
          userId: restaurant.userId,
          rating_service: restaurant.rating_service,
          rating_foodquality: restaurant.rating_foodquality,
          rating_ambiance: restaurant.rating_ambiance,
          meal: restaurant.meal,
          notes: restaurant.notes,
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt
        }
      });
    }

    console.log(`Migrated ${restaurantsWithRatings.length} ratings`);

    // Step 5: Calculate and populate aggregates
    console.log('Calculating aggregate ratings...');
    
    await queryInterface.sequelize.query(`
      INSERT INTO "RestaurantAggregates" 
      ("restaurantId", "totalRatings", avg_service, avg_foodquality, avg_ambiance, avg_overall)
      SELECT 
        "restaurantId",
        COUNT(*) as "totalRatings",
        ROUND(AVG(rating_service), 2) as avg_service,
        ROUND(AVG(rating_foodquality), 2) as avg_foodquality,
        ROUND(AVG(rating_ambiance), 2) as avg_ambiance,
        ROUND((AVG(rating_service) + AVG(rating_foodquality) + AVG(rating_ambiance)) / 3, 2) as avg_overall
      FROM "Ratings"
      GROUP BY "restaurantId"
    `);

    // Step 6: Add performance indexes
    console.log('Adding indexes...');
    
    await queryInterface.addIndex('Ratings', ['restaurantId']);
    await queryInterface.addIndex('Ratings', ['userId']);
    await queryInterface.addIndex('Ratings', ['restaurantId', 'userId'], { 
      unique: true,
      name: 'ratings_restaurant_user_unique'
    });
    
    await queryInterface.addIndex('Restaurants', ['latitude', 'longitude'], {
      name: 'restaurants_location_index'
    });
    await queryInterface.addIndex('Restaurants', ['name'], {
      name: 'restaurants_name_index'
    });
    await queryInterface.addIndex('Restaurants', ['isActive'], {
      name: 'restaurants_active_index'
    });

    // Step 7: Remove old rating columns from Restaurants
    console.log('Removing old rating columns...');
    
    await queryInterface.removeColumn('Restaurants', 'rating_service');
    await queryInterface.removeColumn('Restaurants', 'rating_foodquality');
    await queryInterface.removeColumn('Restaurants', 'rating_ambiance');
    await queryInterface.removeColumn('Restaurants', 'meal');
    await queryInterface.removeColumn('Restaurants', 'notes');
    await queryInterface.removeColumn('Restaurants', 'userId');

    console.log('Migration completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Rolling back migration...');

    // Step 1: Add back old columns to Restaurants
    await queryInterface.addColumn('Restaurants', 'rating_service', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 1,
        max: 10,
      },
    });
    await queryInterface.addColumn('Restaurants', 'rating_foodquality', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 1,
        max: 10,
      },
    });
    await queryInterface.addColumn('Restaurants', 'rating_ambiance', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 1,
        max: 10,
      },
    });
    await queryInterface.addColumn('Restaurants', 'meal', {
      type: Sequelize.ENUM('Breakfast', 'Brunch', 'Lunch', 'Dinner'),
      allowNull: false,
    });
    await queryInterface.addColumn('Restaurants', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Restaurants', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'uuid',
      },
      onDelete: 'CASCADE',
    });

    // Step 2: Move average ratings back to Restaurants (from aggregates)
    await queryInterface.sequelize.query(`
      UPDATE "Restaurants" 
      SET 
        rating_service = COALESCE(aggs.avg_service, 0),
        rating_foodquality = COALESCE(aggs.avg_foodquality, 0),
        rating_ambiance = COALESCE(aggs.avg_ambiance, 0)
      FROM "RestaurantAggregates" aggs
      WHERE "Restaurants".id = aggs.restaurantId
    `);

    // Step 3: Drop new tables
    await queryInterface.dropTable('RestaurantAggregates');
    await queryInterface.dropTable('Ratings');

    // Step 4: Remove new columns
    await queryInterface.removeColumn('Restaurants', 'priceRange');
    await queryInterface.removeColumn('Restaurants', 'phone');
    await queryInterface.removeColumn('Restaurants', 'website');
    await queryInterface.removeColumn('Restaurants', 'photos');
    await queryInterface.removeColumn('Restaurants', 'isActive');

    // Step 5: Remove indexes
    await queryInterface.removeIndex('Ratings', 'ratings_restaurant_user_unique');
    await queryInterface.removeIndex('Restaurants', 'restaurants_location_index');
    await queryInterface.removeIndex('Restaurants', 'restaurants_name_index');
    await queryInterface.removeIndex('Restaurants', 'restaurants_active_index');

    console.log('Rollback completed!');
  }
};