/**
 * NutriGuide AI - Database Seeder
 * Seeds MongoDB with meal data from Kaggle dataset
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Meal from '../models/Meal.model.js';

// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutriguide';

console.log('=' .repeat(60));
console.log('NUTRIGUIDE AI - DATABASE SEEDER');
console.log('='.repeat(60));

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('\n[1/4] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing meals
    console.log('\n[2/4] Clearing existing meals...');
    const deleteResult = await Meal.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing meals`);

    // Load seed data
    console.log('\n[3/4] Loading seed data...');
    const seedPath = path.join(__dirname, 'meals_seed.json');
    
    if (!fs.existsSync(seedPath)) {
      console.log('✗ Seed file not found!');
      console.log('  Please run: cd ../ml-service && python create_meal_database.py');
      process.exit(1);
    }

    const mealsData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    console.log(`✓ Loaded ${mealsData.length} meals from seed file`);

    // Insert meals
    console.log('\n[4/4] Inserting meals into database...');
    const insertedMeals = await Meal.insertMany(mealsData);
    console.log(`✓ Successfully inserted ${insertedMeals.length} meals`);

    // Show statistics
    console.log('\n📊 Database Statistics:');
    const stats = await Meal.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCalories: { $avg: '$nutrition.calories' },
          avgProtein: { $avg: '$nutrition.protein' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\nMeals by Category:');
    stats.forEach(stat => {
      console.log(`  - ${stat._id}: ${stat.count} meals (avg ${Math.round(stat.avgCalories)} cal, ${Math.round(stat.avgProtein)}g protein)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('DATABASE SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n✓ Your MongoDB is now populated with real meal data');
    console.log('✓ Ready to start the backend server: npm run dev');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
