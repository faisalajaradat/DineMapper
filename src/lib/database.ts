

import { Sequelize, Options } from 'sequelize';
import Restaurant from '../models/Restaurant';
import Rating from '../models/Rating';
import RestaurantAggregate from '../models/RestaurantAggregate';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from "@/lib/auth";
import config from '../../config/config.js';

const env = process.env.NODE_ENV || 'development';
const sequelizeConfig = (config as { [key: string]: Options })[env];

let sequelize: Sequelize;

// JWT secret
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

// -----------------------------
// INIT DATABASE + MODELS
// -----------------------------
export const initDatabase = async () => {
  if (!sequelize) {
    sequelize = new Sequelize(sequelizeConfig);

    try {
      await sequelize.authenticate();
      console.log('Database connection established.');
    } catch (err) {
      console.error('Unable to connect:', err);
    }
  }
  return sequelize;
};

export const initModel = async () => {
  const sequelize = await initDatabase();

  // Init models
  Restaurant.initModel(sequelize);
  Rating.initModel(sequelize);
  RestaurantAggregate.initModel(sequelize);
  User.initModel(sequelize);

  // --------------------------
  // NEW, CORRECT ASSOCIATIONS
  // --------------------------

  // Restaurant has many Ratings
  Restaurant.hasMany(Rating, {
    foreignKey: 'restaurantId',
    as: 'ratings',
    onDelete: 'CASCADE'
  });

  // Restaurant has one aggregate row
  Restaurant.hasOne(RestaurantAggregate, {
    foreignKey: 'restaurantId',
    as: 'aggregate',
    onDelete: 'CASCADE'
  });

  // Rating belongs to Restaurant
  Rating.belongsTo(Restaurant, {
    foreignKey: 'restaurantId',
    as: 'restaurant',
  });

  // Rating belongs to User
  Rating.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has many Ratings
  User.hasMany(Rating, {
    foreignKey: 'userId',
    as: 'ratings'
  });

  await sequelize.sync({ force: true });
  console.log('Models synchronized.');
};

// -----------------------------
// AGGREGATES
// -----------------------------
export const updateRestaurantAggregate = async (restaurantId: number) => {
  await initModel();

  const [aggregate] = await RestaurantAggregate.findOrCreate({
    where: { restaurantId },
    defaults: {
      restaurantId,
      totalRatings: 0,
      avg_service: 0,
      avg_foodquality: 0,
      avg_ambiance: 0,
      avg_overall: 0
    }
  });

  const ratings = await Rating.findAll({ where: { restaurantId } });
  const count = ratings.length;

  if (count === 0) {
    await aggregate.update({
      totalRatings: 0,
      avg_service: 0,
      avg_foodquality: 0,
      avg_ambiance: 0,
      avg_overall: 0
    });
    return aggregate;
  }

  const sumService = ratings.reduce((s, r) => s + r.rating_service, 0);
  const sumFood = ratings.reduce((s, r) => s + r.rating_foodquality, 0);
  const sumAmb = ratings.reduce((s, r) => s + r.rating_ambiance, 0);

  await aggregate.update({
    totalRatings: count,
    avg_service: +(sumService / count).toFixed(2),
    avg_foodquality: +(sumFood / count).toFixed(2),
    avg_ambiance: +(sumAmb / count).toFixed(2),
    avg_overall: +((sumService + sumFood + sumAmb) / (count * 3)).toFixed(2),
  });

  return aggregate;
};

// -----------------------------
// USERS
// -----------------------------
export const registerUser = async (data: any) => {
  await initModel();
  return User.create(data).then(u => u.get({ plain: true }));
};

export const loginUser = async (email: string, password: string) => {
  await initModel();

  const user = await User.findOne({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return signToken({ id: user.uuid, email: user.email });
};

// -----------------------------
// RESTAURANTS
// -----------------------------
export const createRestaurant = async (data: any) => {
  await initModel();
  const restaurant = await Restaurant.create(data);
  return restaurant.get({ plain: true });
};

export const createRestaurantWithRating = async (data: any) => {
  await initModel();

  const restaurant = await Restaurant.create({
    name: data.name,
    address: data.address,
    cuisine: data.cuisine,
    latitude: data.latitude,
    longitude: data.longitude,
    priceRange: data.priceRange,
    phone: data.phone,
    website: data.website,
    photos: data.photos,
    isActive: true
  });

  const rating = await Rating.create({
    restaurantId: restaurant.id,
    userId: data.userId,
    rating_service: data.rating_service,
    rating_foodquality: data.rating_foodquality,
    rating_ambiance: data.rating_ambiance,
    meal: data.meal,
    notes: data.notes
  });

  await updateRestaurantAggregate(restaurant.id);

  return {
    ...restaurant.get({ plain: true }),
    userRating: rating.get({ plain: true })
  };
};

export const getAllRestaurants = async () => {
  await initModel();
  const restaurants = await Restaurant.findAll({
    include: [{ model: RestaurantAggregate, as: 'aggregate' }],
    where: { isActive: true }
  });
  return restaurants.map(r => r.get({ plain: true }));
};

// -----------------------------
// GET Restaurants by User RATING, not ownership
// -----------------------------
export const getRestaurantsByUUID = async (userId: string) => {
  await initModel();

  // Restaurants the user has rated
  const restaurants = await Restaurant.findAll({
    include: [
      {
        model: Rating,
        as: 'ratings',
        where: { userId },
        required: true
      },
      {
        model: RestaurantAggregate,
        as: 'aggregate',
        required: false
      }
    ]
  });

  return restaurants.map(r => r.get({ plain: true }));
};
export const getRestaurantById = async (restaurantId: number) => {
  await initModel();

  const restaurant = await Restaurant.findOne({
    where: { id: restaurantId, isActive: true },
    include: [
      { model: RestaurantAggregate, as: 'aggregate' },
      { 
        model: Rating, 
        as: 'ratings',
        include: [{ model: User, as: 'user', attributes: ['uuid', 'email'] }]
      }
    ]
  });

  return restaurant ? restaurant.get({ plain: true }) : null;
};


// -----------------------------
// RATINGS
// -----------------------------
export const addRating = async (data: any) => {
  await initModel();
  const rating = await Rating.create(data);
  await updateRestaurantAggregate(data.restaurantId);
  return rating.get({ plain: true });
};

export const getRatingsByRestaurantId = async (restaurantId: number) => {
  await initModel();

  const ratings = await Rating.findAll({
    where: { restaurantId },
    include: [{ model: User, as: 'user', attributes: ['uuid', 'email'] }],
    order: [['createdAt', 'DESC']]
  });

  return ratings.map(r => r.get({ plain: true }));
};

// -----------------------------
// AUTH
// -----------------------------
export const authenticateToken = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await User.findOne({ where: { uuid: payload.id } });
  return user ? user.get({ plain: true }) : null;
};


// -----------------------------
// UPDATE USER
// -----------------------------
export const updateUser = async (uuid: string, data: any) => {
  await initModel();

  const user = await User.findOne({ where: { uuid } });
  if (!user) return null;

  await user.update(data);
  return user.get({ plain: true });
};