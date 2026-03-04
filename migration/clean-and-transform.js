// Data Cleaning and Transformation Script
// Converts CSV data to Firestore-ready JSON with smart categorization

const fs = require('fs');
const csv = require('csv-parser');

// Smart categorization based on club names and keywords
function inferCategory(clubName, description = '') {
  const name = clubName.toLowerCase();
  const desc = description.toLowerCase();
  const combined = name + ' ' + desc;

  if (combined.match(/computer|coding|tech|stem|science|chemistry|pre-health|medlife|psi chi/)) {
    return 'academic';
  }
  if (combined.match(/asian|pacific|black|latinx|native|indigenous|hawaii|nisa|api/)) {
    return 'cultural';
  }
  if (combined.match(/christian|fellowship|intervarsity|young life|fca/)) {
    return 'faith';
  }
  if (combined.match(/dance|music|theatre|cabaret|acappella|mariachi|art|clay|mast|media/)) {
    return 'arts';
  }
  if (combined.match(/lacrosse|frisbee|pickleball|water polo|outdoor|rec/)) {
    return 'recreational';
  }
  if (combined.match(/business|finance|investment|deca|rotc/)) {
    return 'professional';
  }
  if (combined.match(/service|red cross|medlife|social work/)) {
    return 'service';
  }
  if (combined.match(/game|guild|magic|planeswalker/)) {
    return 'gaming';
  }
  
  return 'special_interest';
}

// Generate tags from club name and description
function generateTags(clubName, description = '', category) {
  const tags = new Set();
  const combined = (clubName + ' ' + description).toLowerCase();

  // Category-based tags
  const tagMap = {
    academic: ['learning', 'education', 'career'],
    cultural: ['diversity', 'community', 'heritage'],
    faith: ['spirituality', 'community', 'fellowship'],
    arts: ['creative', 'performance', 'expression'],
    recreational: ['fitness', 'sports', 'outdoor'],
    professional: ['career', 'networking', 'leadership'],
    service: ['volunteering', 'community', 'impact'],
    gaming: ['social', 'competition', 'strategy']
  };

  if (tagMap[category]) {
    tagMap[category].forEach(tag => tags.add(tag));
  }

  // Specific keyword tags
  if (combined.includes('beginner') || combined.includes('all levels')) tags.add('beginner-friendly');
  if (combined.includes('music')) tags.add('music');
  if (combined.includes('tech') || combined.includes('coding')) tags.add('technology');
  if (combined.includes('leadership')) tags.add('leadership');
  if (combined.includes('social')) tags.add('social');
  if (combined.includes('competitive') || combined.includes('competition')) tags.add('competitive');
  if (combined.includes('volunteer')) tags.add('volunteering');
  if (combined.includes('cultural') || combined.includes('diversity')) tags.add('diversity');

  return Array.from(tags);
}

// Infer vibes from club characteristics
function inferVibes(clubName, description = '', category) {
  const vibes = [];
  const combined = (clubName + ' ' + description).toLowerCase();

  if (category === 'recreational' || category === 'gaming' || combined.includes('social')) {
    vibes.push('casual');
  }
  if (category === 'arts' || category === 'cultural') {
    vibes.push('creative');
  }
  if (category === 'professional' || combined.includes('career')) {
    vibes.push('professional');
  }
  if (category === 'service' || combined.includes('community')) {
    vibes.push('community-focused');
  }
  if (combined.includes('competitive') || combined.includes('competition')) {
    vibes.push('competitive');
  }
  if (category === 'academic' || combined.includes('learning')) {
    vibes.push('learning-focused');
  }

  return vibes.length > 0 ? vibes : ['casual'];
}

// Parse meeting schedule
function parseMeetingSchedule(meetingTime, location) {
  if (!meetingTime || meetingTime === 'NULL') {
    return {
      frequency: 'varies',
      dayOfWeek: null,
      time: null,
      location: location || 'TBD',
      virtual: false
    };
  }

  const dayMap = {
    'M': 'Monday',
    'T': 'Tuesday',
    'W': 'Wednesday',
    'R': 'Thursday',
    'F': 'Friday',
    'S': 'Saturday',
    'U': 'Sunday'
  };

  // Extract day and time
  const dayMatch = meetingTime.match(/\(([MTWRFSU,\s]+)\)/);
  const timeMatch = meetingTime.match(/(\d{1,2}:\d{2}[ap]m)/i);
  
  let dayOfWeek = null;
  let frequency = 'weekly';

  if (dayMatch) {
    const days = dayMatch[1].split(',').map(d => d.trim());
    dayOfWeek = days.map(d => dayMap[d] || d).join(', ');
    
    if (days.length > 1) frequency = 'multiple_weekly';
  }

  if (meetingTime.toLowerCase().includes('every other') || meetingTime.toLowerCase().includes('biweekly')) {
    frequency = 'biweekly';
  }
  if (meetingTime.toLowerCase().includes('month')) {
    frequency = 'monthly';
  }

  return {
    frequency,
    dayOfWeek,
    time: timeMatch ? timeMatch[0] : meetingTime,
    location: location || 'TBD',
    virtual: false
  };
}

// Infer time commitment
function inferTimeCommitment(meetingTime, category) {
  if (!meetingTime) return 'low';
  
  const meetingCount = (meetingTime.match(/[MTWRFSU]/g) || []).length;
  
  if (category === 'professional' || category === 'service') return 'medium';
  if (meetingCount >= 3) return 'high';
  if (meetingCount === 2) return 'medium';
  return 'low';
}

// Generate URL-friendly slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Clean and normalize social links
function normalizeSocialLink(link) {
  if (!link) return null;
  
  link = link.trim();
  
  // Instagram handle
  if (link.startsWith('@')) {
    return `https://instagram.com/${link.substring(1)}`;
  }
  if (link.includes('instagram.com/') || link.includes('IG:') || link.includes('on Instagram')) {
    const match = link.match(/[@\w.]+/);
    if (match) {
      const handle = match[0].replace('@', '');
      return `https://instagram.com/${handle}`;
    }
  }
  
  // Full URL
  if (link.startsWith('http')) {
    return link;
  }
  
  return link;
}

// Main transformation
const transformedClubs = [];

fs.createReadStream('../club_list.csv')
  .pipe(csv())
  .on('data', (row) => {
    const clubName = row['Name of Club/Organization'];
    const description = row['New desc./ other comments'] || '';
    const category = inferCategory(clubName, description);
    const tags = generateTags(clubName, description, category);
    const vibes = inferVibes(clubName, description, category);
    const meetingSchedule = parseMeetingSchedule(
      row['Meeting Days/Times\n\n(MTWRFSU)'],
      row['Meeting Location']
    );

    // Build officers array
    const officers = [];
    if (row['Primary Contact Name (club officer) (First)']) {
      officers.push({
        name: `${row['Primary Contact Name (club officer) (First)']} ${row['Primary Contact Name (club officer) (Last)']}`.trim(),
        role: 'President',
        email: row['Primary Contact Email']?.toLowerCase().trim() || '',
        userId: null
      });
    }
    if (row['Secondary Contact Name (club officer) (First)'] && 
        row['Secondary Contact Name (club officer) (First)'] !== 'Not') {
      officers.push({
        name: `${row['Secondary Contact Name (club officer) (First)']} ${row['Secondary Contact Name (club officer) (Last)']}`.trim(),
        role: 'Vice President',
        email: row['Secondary Contact Email']?.toLowerCase().trim() || '',
        userId: null
      });
    }

    // Parse social links
    const websiteRaw = row['Club/Organization Website and/or IG page'];
    const socialLinks = {};
    let website = null;

    if (websiteRaw) {
      const links = websiteRaw.split(/[,\s]+/).filter(l => l);
      links.forEach(link => {
        const normalized = normalizeSocialLink(link);
        if (normalized) {
          if (normalized.includes('instagram.com')) {
            socialLinks.instagram = normalized;
          } else if (normalized.includes('facebook.com')) {
            socialLinks.facebook = normalized;
          } else if (normalized.includes('discord')) {
            socialLinks.discord = normalized;
          } else if (normalized.startsWith('http')) {
            website = normalized;
          }
        }
      });
    }

    const transformedClub = {
      // Original ID for reference
      originalId: row['Club ID'],
      
      // Basic Info
      name: clubName,
      slug: generateSlug(clubName),
      description: description || `${clubName} is a student organization at PLU. More information coming soon!`,
      shortDescription: description ? description.substring(0, 100) + '...' : `Join ${clubName}!`,
      
      // Contact & Social
      contactEmail: row['Club/Organization Email']?.toLowerCase().trim() || null,
      website: website,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      
      // Meeting Information
      meetingSchedule,
      
      // Categorization & Discovery
      category,
      tags,
      vibes,
      
      // Quiz Matching Attributes
      attributes: {
        timeCommitment: inferTimeCommitment(row['Meeting Days/Times\n\n(MTWRFSU)'], category),
        experienceRequired: 'beginner', // Default - can be updated by admins
        groupSize: 'medium', // Default
        activityType: ['meetings'],
        bestFor: tags.slice(0, 3) // Use first 3 tags
      },
      
      // Leadership
      officers,
      
      // Media (to be added later)
      logo: null,
      coverImage: null,
      gallery: [],
      
      // Metadata
      status: 'active',
      memberCount: 0,
      featured: false,
      verified: false, // Requires admin verification
      
      // Engagement
      views: 0,
      saves: 0,
      
      // Flags
      needsDescription: row['Description needed?'] === 'True',
      notes: row['New desc./ other comments'] || null
    };

    transformedClubs.push(transformedClub);
  })
  .on('end', () => {
    // Write to JSON file
    fs.writeFileSync(
      'clubs-transformed.json',
      JSON.stringify(transformedClubs, null, 2)
    );

    console.log(`✓ Transformed ${transformedClubs.length} clubs`);
    console.log('✓ Output: clubs-transformed.json');
    
    // Generate summary
    const summary = {
      total: transformedClubs.length,
      byCategory: {},
      missingEmail: transformedClubs.filter(c => !c.contactEmail).length,
      missingWebsite: transformedClubs.filter(c => !c.website && !c.socialLinks).length,
      needsDescription: transformedClubs.filter(c => c.needsDescription).length
    };

    transformedClubs.forEach(club => {
      summary.byCategory[club.category] = (summary.byCategory[club.category] || 0) + 1;
    });

    console.log('\n--- Summary ---');
    console.log('Clubs by Category:');
    Object.entries(summary.byCategory).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    console.log(`\nMissing email: ${summary.missingEmail}`);
    console.log(`Missing website/social: ${summary.missingWebsite}`);
    console.log(`Needs description: ${summary.needsDescription}`);
  });
