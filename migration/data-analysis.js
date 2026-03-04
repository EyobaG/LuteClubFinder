// Data Analysis Report for PLU Club Database
// Run this to understand data quality before migration

const fs = require('fs');
const csv = require('csv-parser');

const analysis = {
  totalClubs: 0,
  missingFields: {
    email: 0,
    website: 0,
    meetingTime: 0,
    meetingLocation: 0,
    secondaryContact: 0,
    description: 0
  },
  categories: {},
  duplicates: [],
  dataQuality: []
};

const clubs = [];

fs.createReadStream('../club_list.csv')
  .pipe(csv())
  .on('data', (row) => {
    analysis.totalClubs++;
    clubs.push(row);

    // Check missing fields
    if (!row['Club/Organization Email']) analysis.missingFields.email++;
    if (!row['Club/Organization Website and/or IG page']) analysis.missingFields.website++;
    if (!row['Meeting Days/Times\n\n(MTWRFSU)']) analysis.missingFields.meetingTime++;
    if (!row['Meeting Location']) analysis.missingFields.meetingLocation++;
    if (!row['Secondary Contact Email']) analysis.missingFields.secondaryContact++;
    if (row['Description needed?'] === 'True') analysis.missingFields.description++;

    // Track potential duplicates
    const clubName = row['Name of Club/Organization'].toLowerCase();
    if (clubName.includes('lacrosse')) {
      analysis.duplicates.push(row['Name of Club/Organization']);
    }
  })
  .on('end', () => {
    console.log('=== PLU CLUB DATABASE ANALYSIS ===\n');
    console.log(`Total Clubs: ${analysis.totalClubs}`);
    console.log('\n--- Missing Data ---');
    console.log(`Clubs without email: ${analysis.missingFields.email} (${(analysis.missingFields.email/analysis.totalClubs*100).toFixed(1)}%)`);
    console.log(`Clubs without website/social: ${analysis.missingFields.website} (${(analysis.missingFields.website/analysis.totalClubs*100).toFixed(1)}%)`);
    console.log(`Clubs without meeting time: ${analysis.missingFields.meetingTime} (${(analysis.missingFields.meetingTime/analysis.totalClubs*100).toFixed(1)}%)`);
    console.log(`Clubs without meeting location: ${analysis.missingFields.meetingLocation} (${(analysis.missingFields.meetingLocation/analysis.totalClubs*100).toFixed(1)}%)`);
    console.log(`Clubs without secondary contact: ${analysis.missingFields.secondaryContact} (${(analysis.missingFields.secondaryContact/analysis.totalClubs*100).toFixed(1)}%)`);
    console.log(`Clubs needing descriptions: ${analysis.missingFields.description} (${(analysis.missingFields.description/analysis.totalClubs*100).toFixed(1)}%)`);
    
    if (analysis.duplicates.length > 0) {
      console.log('\n--- Potential Duplicates ---');
      analysis.duplicates.forEach(name => console.log(`  - ${name}`));
    }

    console.log('\n--- Data Quality Score ---');
    const completeness = 100 - (
      (analysis.missingFields.email + 
       analysis.missingFields.website + 
       analysis.missingFields.meetingTime) / 
      (analysis.totalClubs * 3) * 100
    );
    console.log(`Overall Completeness: ${completeness.toFixed(1)}%`);
    
    console.log('\n✓ Analysis complete! Ready for migration.');
  });
