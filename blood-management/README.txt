BLOOD DONOR MANAGEMENT SYSTEM - SETUP INSTRUCTIONS
==================================================

PREREQUISITES:
--------------
1. Node.js (v14 or higher)
2. MongoDB (installed and running)

INSTALLATION STEPS:
-------------------

1. Install Node.js dependencies:
   npm install

2. Start MongoDB (if not already running):
   - Windows: Open MongoDB Compass or run 'mongod' in terminal
   - Or ensure MongoDB service is running

3. Run the application:
   npm start

FEATURES:
---------
✓ Add new blood donors
✓ View all donors
✓ Search donors by blood type
✓ Edit donor details
✓ Delete donors
✓ MongoDB database integration
✓ Data persistence

BLOOD TYPES SUPPORTED:
---------------------
A+, A-, B+, B-, AB+, AB-, O+, O-

MONGODB COMMANDS (Optional):
----------------------------
To view data directly in MongoDB CLI:

1. Open MongoDB Shell:
   mongosh

2. Use the database:
   use bloodManagement

3. View all donors:
   db.donors.find()

4. Count donors:
   db.donors.countDocuments()

5. Find donors by blood type:
   db.donors.find({ bloodType: "O+" })

6. Delete all donors:
   db.donors.deleteMany({})
