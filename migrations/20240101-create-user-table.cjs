module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the Users table
    await queryInterface.createTable('Users', {
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true, // Primary key
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
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

    // Create the Restaurants table linked to the Users table by uuid
    await queryInterface.createTable('Restaurants', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cuisine: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      meal: {
        type: Sequelize.ENUM('Breakfast', 'Brunch', 'Lunch', 'Dinner'),
        allowNull: false,
      },
      rating_service: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 10,
        },
      },
      rating_foodquality: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 10,
        },
      },
      rating_ambiance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 10,
        },
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      userId: {
        type: Sequelize.UUID, // Use UUID instead of INTEGER
        references: {
          model: 'Users', // Links to the Users table
          key: 'uuid', // Reference the uuid column in Users table
        },
        onDelete: 'CASCADE', // When user is deleted, cascade the delete to restaurants
        allowNull: false,
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
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the Restaurants table first, then Users
    await queryInterface.dropTable('Restaurants');
    await queryInterface.dropTable('Users');
  },
};
