'use server';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Page } from "@/models/Page";
import { DeletedLink } from "@/models/DeletedLink";
import { Event } from "@/models/Event";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongoClient";
import { getServerSession } from "next-auth";
import { Education } from "@/models/Education";
import { WorkExperience } from "@/models/WorkExperience";
import { Project } from "@/models/Project";
import mongoose from "mongoose";

// Helper function to sanitize string input
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

// Helper function to sanitize URL
function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Only allow http, https, mailto, tel protocols
  if (trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/')) {
    return trimmed.slice(0, 2000);
  }
  // If no protocol, assume https
  if (trimmed && !trimmed.includes(':')) {
    return 'https://' + trimmed.slice(0, 2000);
  }
  return '';
}

// Clamp a proficiency value to 0-100, defaulting to 80 when missing/invalid
function normalizeProficiency(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return 80;
  return Math.min(100, Math.max(0, parsed));
}

// Helper to sanitize skills data (categorized objects or arrays)
function sanitizeSkillsData(skillsData) {
  if (skillsData === null || skillsData === undefined) return {};

  // Old format: array of strings
  if (Array.isArray(skillsData)) {
    return {
      "All Skills": skillsData
        .slice(0, 50)
        .map(skill => ({
          name: sanitizeString(typeof skill === 'string' ? skill : (skill?.name || ''), 100),
          proficiency: normalizeProficiency(skill?.proficiency),
        }))
        .filter(s => s.name.length > 0),
    };
  }

  // New format: { "Category Name": [{ name, proficiency }] }
  if (typeof skillsData === 'object') {
    const sanitized = {};
    const categoryKeys = Object.keys(skillsData).slice(0, 20); // max 20 categories
    for (const key of categoryKeys) {
      const safeKey = sanitizeString(key, 100);
      if (!safeKey) continue;
      const items = skillsData[key];
      if (!Array.isArray(items)) continue;
      sanitized[safeKey] = items
        .slice(0, 50)
        .map(item => ({
          name: sanitizeString(typeof item === 'string' ? item : (item?.name || ''), 100),
          proficiency: normalizeProficiency(item?.proficiency),
        }))
        .filter(s => s.name.length > 0);
    }
    return sanitized;
  }

  return {};
}

export async function savePageSettings(formData) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const dataKeys = [
      'displayName', 'location',
      'bio', 'bgType', 'bgColor', 'bgImage',
    ];

    const dataToUpdate = {};
    for (const key of dataKeys) {
      if (formData.has(key)) {
        const value = formData.get(key);
        // Sanitize text inputs
        if (['displayName', 'location', 'bio'].includes(key)) {
          dataToUpdate[key] = sanitizeString(value, key === 'bio' ? 2000 : 200);
        } else if (['bgImage'].includes(key)) {
          dataToUpdate[key] = sanitizeUrl(value);
        } else {
          dataToUpdate[key] = value;
        }
      }
    }

    if (formData.has('showAvailableBadge')) {
      dataToUpdate.showAvailableBadge = formData.get('showAvailableBadge') === 'true';
    }

    await Page.updateOne(
      { owner: session?.user?.email },
      dataToUpdate,
    );

    if (formData.has('avatar')) {
      const avatarLink = sanitizeUrl(formData.get('avatar'));
      if (avatarLink) {
        await User.updateOne(
          { email: session.user?.email },
          { image: avatarLink },
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, message: error.message };
  }
}

export async function savePageButtons(formData) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const buttonsValues = {};
    formData.forEach((value, key) => {
      // Sanitize each button URL/value
      buttonsValues[key] = ['email', 'mobile'].includes(key)
        ? sanitizeString(value, 200)
        : sanitizeUrl(value);
    });
    const dataToUpdate = { buttons: buttonsValues };
    await Page.updateOne(
      { owner: session?.user?.email },
      dataToUpdate,
    );
    return { success: true };
  } catch (error) {
    console.error('Error saving buttons:', error);
    return { success: false, message: error.message };
  }
}

export async function savePageLinks(links) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const page = await Page.findOne({ owner: session?.user?.email });
    if (!page) {
      return { success: false, message: 'Page not found.' };
    }
    const currentLinks = page.links || [];

    // Sanitize incoming links
    const sanitizedLinks = links.map(link => ({
      key: sanitizeString(link.key, 100),
      title: sanitizeString(link.title, 200),
      subtitle: sanitizeString(link.subtitle, 500),
      icon: link.icon ? sanitizeUrl(link.icon) : '',
      url: sanitizeUrl(link.url),
    }));

    // Find deleted links
    const newLinkUrls = sanitizedLinks.map(link => link.url);
    const deletedLinks = currentLinks.filter(link => !newLinkUrls.includes(link.url));

    // Store deleted links
    for (const deletedLink of deletedLinks) {
      const totalClicks = await Event.countDocuments({
        uri: deletedLink.url,
        type: 'click',
        page: page.uri
      });

      await DeletedLink.create({
        originalLinkId: deletedLink.key || deletedLink._id,
        title: deletedLink.title,
        url: deletedLink.url,
        icon: deletedLink.icon,
        subtitle: deletedLink.subtitle,
        pageUri: page.uri,
        owner: session.user.email,
        totalClicks: totalClicks,
        deletedAt: new Date()
      });
    }

    // Check for restored links
    const currentLinkUrls = currentLinks.map(link => link.url);
    const restoredLinks = sanitizedLinks.filter(link => !currentLinkUrls.includes(link.url));

    for (const restoredLink of restoredLinks) {
      await DeletedLink.deleteMany({
        url: restoredLink.url,
        pageUri: page.uri,
        owner: session.user.email
      });
    }

    // Update page with sanitized links
    await Page.updateOne(
      { owner: session?.user?.email },
      { links: sanitizedLinks },
    );

    return { success: true };
  } catch (error) {
    console.error('Error saving links:', error);
    return { success: false, message: error.message };
  }
}

// Generic transactional handler for sub-collection clean-sweeps & bulk insertions
async function saveCollectionData({ uri, rawData, Model, mapper }) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  const userEmail = session.user.email;

  if (!uri || !Array.isArray(rawData)) {
    return { success: false, message: 'Invalid data provided.' };
  }

  // `uri` comes from the client: only allow writing under a page the caller owns.
  if (typeof uri !== 'string' || !(await Page.exists({ owner: userEmail, uri }))) {
    return { success: false, message: 'Page not found or permission denied.' };
  }

  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();

    await Model.deleteMany({
      owner: userEmail,
      pageUri: uri,
    }, { session: dbSession });

    const docsToInsert = rawData.map(item => ({
      ...mapper(item),
      owner: userEmail,
      pageUri: uri,
    }));

    if (docsToInsert.length > 0) {
      await Model.insertMany(docsToInsert, { session: dbSession });
    }

    await dbSession.commitTransaction();
    return { success: true };

  } catch (error) {
    await dbSession.abortTransaction();
    console.error(`Error saving ${Model.modelName || 'collection'}:`, error);
    return { success: false, message: error.message };
  } finally {
    dbSession.endSession();
  }
}

export async function savePageEducation(uri, educationData) {
  return saveCollectionData({
    uri,
    rawData: educationData,
    Model: Education,
    mapper: (item) => ({
      school: sanitizeString(item.school, 200),
      degree: sanitizeString(item.degree, 200),
      start: sanitizeString(item.start, 50),
      end: sanitizeString(item.end, 50),
      cgpa: sanitizeString(item.cgpa || '', 20),
      description: sanitizeString(item.description, 2000),
    }),
  });
}

// Updated to support categorized skills with proficiency
export async function savePageSkills(uri, skillsData) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: 'Unauthorized. Please log in.' };
    }

    if (!uri) {
      return { success: false, message: 'URI is required.' };
    }

    if (skillsData === null || skillsData === undefined) {
      return { success: false, message: 'Invalid skills data format.' };
    }

    // Sanitize skills data before persisting
    const sanitizedSkills = sanitizeSkillsData(skillsData);

    const result = await Page.updateOne(
      { owner: session.user.email, uri: uri },
      { $set: { skills: sanitizedSkills } }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: 'Page not found or permission denied.' };
    }

    return { success: true };

  } catch (error) {
    console.error('Error saving skills:', error);
    return { success: false, message: error.message };
  }
}

export async function savePageWorkExperience(uri, workData) {
  return saveCollectionData({
    uri,
    rawData: workData,
    Model: WorkExperience,
    mapper: (item) => ({
      company: sanitizeString(item.company, 200),
      role: sanitizeString(item.role, 200),
      start: sanitizeString(item.start, 50),
      end: sanitizeString(item.end, 50),
      bullets: (item.bullets || []).map(b => sanitizeString(b, 500)).slice(0, 20),
    }),
  });
}

export async function savePageSummary(uri, summary) {
  await connectToDatabase();

  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: 'Unauthorized' };
  }

  if (!uri || typeof summary !== 'string') {
    return { success: false, message: 'Invalid data' };
  }

  try {
    const sanitizedSummary = sanitizeString(summary, 5000);

    const result = await Page.updateOne(
      { owner: session.user.email, uri: uri },
      { $set: { summary: sanitizedSummary } }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: 'Page not found' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving summary:', error);
    return { success: false, message: error.message };
  }
}

export async function savePageProject(uri, projectData) {
  return saveCollectionData({
    uri,
    rawData: projectData,
    Model: Project,
    mapper: (item) => ({
      title: sanitizeString(item.title, 200),
      techStacks: sanitizeString(item.techStacks, 500),
      timeTaken: sanitizeString(item.timeTaken, 100),
      summary: sanitizeString(item.summary, 3000),
      githubLink: sanitizeUrl(item.githubLink),
      liveLink: sanitizeUrl(item.liveLink),
    }),
  });
}
