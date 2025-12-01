
import xlsx from 'xlsx';
import { MongoClient } from 'mongodb';

// MongoDB Atlas connection string - Replace with your actual connection string
const MONGODB_URI = 'mongodb+srv://abhitreader_db_user:EMtQH7RfreWh9Y7K@cluster0.kkb9tlf.mongodb.net/?appName=Cluster0';

// Database and collection names
const DATABASE_NAME = 'pollcheck';
const COLLECTION_NAME = 'voters';

// Path to your Excel file
const EXCEL_FILE_PATH = './pollcheckdata.xlsx';

async function seedData() {
    let client;

    try {
        // Read the Excel file
        console.log('Reading Excel file...');
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON
        const rawData = xlsx.utils.sheet_to_json(sheet);
        
        console.log(`Found ${rawData.length} records in Excel file`);

        // Map the data to match your column names
        const voters = rawData.map((row, index) => ({
            voterId: row['Voter ID'] || null,
            nameMarathi: row['Name (Marathi)'] || null,
            nameEnglish: row['Name (English)'] || null,
            relationMarathi: row['Relation (Marathi)'] || null,
            relationEnglish: row['Relation (English)'] || null,
            houseNo: row['House No'] || null,
            age: row['Age'] ? parseInt(row['Age']) : null,
            gender: row['Gender'] || null,
            confidence: row['Confidence'] || null,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Connect to MongoDB Atlas
        console.log('Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected successfully to MongoDB Atlas');

        // Get database and collection
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Optional: Clear existing data before inserting
        // Uncomment the next line if you want to clear the collection first
        // await collection.deleteMany({});
        // console.log('Cleared existing data');

        // Insert data in batches for better performance
        const BATCH_SIZE = 1000;
        let insertedCount = 0;

        for (let i = 0; i < voters.length; i += BATCH_SIZE) {
            const batch = voters.slice(i, i + BATCH_SIZE);
            const result = await collection.insertMany(batch);
            insertedCount += result.insertedCount;
            console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.insertedCount} documents`);
        }

        console.log(`\n✅ Successfully seeded ${insertedCount} voters to MongoDB Atlas`);
        console.log(`Database: ${DATABASE_NAME}`);
        console.log(`Collection: ${COLLECTION_NAME}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        throw error;
    } finally {
        // Close the connection
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

// Run the seed function
seedData().catch(console.error);
