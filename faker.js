const { faker } = require('@faker-js/faker');
const XLSX = require('xlsx');
const fs = require('fs');

// Number of rows you want to generate
const numRows = 600000;

// Generate fake data
const generateData = () => {
    const data = [];
    for (let i = 0; i < numRows; i++) {
        data.push({
            'No. Undian': faker.datatype.uuid().slice(0, 8).toUpperCase() + "X",
            'Kode unik undian': faker.datatype.uuid().slice(0, 8).toUpperCase() + "X",
            'Name': faker.person.fullName(),
            'Age': faker.datatype.number({ min: 18, max: 70 }),
            'Address': faker.location.streetAddress() + ', ' + faker.location.city(),
            'Gender': faker.person.gender(),
            'Saving Balance (IDR)': `Rp ${faker.commerce.price(20000000, 50000000, 0, 'Rp ')}`
        });
    }
    return data;
};

// Write to Excel file
const writeToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'FakeData.xlsx');
};

// Generate and write data
const data = generateData();
writeToExcel(data);

console.log('Excel file generated successfully.');
