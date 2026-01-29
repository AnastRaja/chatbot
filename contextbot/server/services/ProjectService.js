const Project = require('../models/Project');
const { v4: uuidv4 } = require('uuid');

class ProjectService {
    async getUserProjects(userId, userEmail) {
        console.log(`[ProjectService] Fetching projects for user: ${userId} or email: ${userEmail}`);
        // Return list of projects for the dashboard
        // Query by either userId OR userEmail
        const query = {
            $or: [
                { userId: userId }
            ]
        };

        if (userEmail) {
            query.$or.push({ userEmail: userEmail });
        }

        const projects = await Project.find(query);
        console.log(`[ProjectService] Found ${projects.length} projects for user ${userId}/${userEmail}`);
        const profilesMap = {};
        projects.forEach(p => profilesMap[p.id] = p);
        return profilesMap;
    }

    async getProject(id) {
        // Public access for the widget (by bizId)
        // No userId check here because the widget script needs to load config anonymously
        return await Project.findOne({ id });
    }

    async getProjectForUser(id, userId, userEmail) {
        // Secure access for editing - check either ID or Email
        const query = {
            id: id,
            $or: [
                { userId: userId }
            ]
        };

        if (userEmail) {
            query.$or.push({ userEmail: userEmail });
        }
        return await Project.findOne(query);
    }

    async createOrUpdateProject(data, userId, userEmail) {
        console.log(`[ProjectService] Create/Update for user: ${userId} (${userEmail})`, data);
        const { id, name, context, widgetColor, settings } = data;
        let bizId = id;
        let project;

        if (bizId) {
            // Try to find existing project by ID and (User ID OR Email)
            const query = {
                id: bizId,
                $or: [
                    { userId: userId }
                ]
            };

            if (userEmail) {
                query.$or.push({ userEmail: userEmail });
            }
            project = await Project.findOne(query);
        }

        if (project) {
            console.log(`[ProjectService] Updating existing project ${bizId}`);
            project.name = name || project.name;
            project.context = context || project.context;
            project.widgetColor = widgetColor || project.widgetColor;

            // Ensure email is saved if missing
            if (!project.userEmail && userEmail) {
                project.userEmail = userEmail;
            }

            if (settings) {
                project.settings = { ...project.settings, ...settings };
            }

            await project.save();
        } else {
            console.log(`[ProjectService] Creating new project for user ${userId}`);
            bizId = bizId || uuidv4();
            project = await Project.create({
                id: bizId,
                userId: userId, // Link to user
                userEmail: userEmail, // Link to email
                name: name || 'Untitled Business',
                context: context || {},
                widgetColor: widgetColor || '#2563eb',
                settings: settings || {}
            });
            console.log(`[ProjectService] Created project ${bizId} with userId ${project.userId}`);
        }
        return { id: bizId, project };
    }

    async deleteProject(id, userId, userEmail) {
        const query = {
            id: id,
            $or: [
                { userId: userId }
            ]
        };
        if (userEmail) {
            query.$or.push({ userEmail: userEmail });
        }
        return await Project.deleteOne(query);
    }

    async getUserStats(userId, userEmail) {
        const ChatSession = require('../models/ChatSession');
        const Lead = require('../models/Lead');

        // Get all project IDs for this user to filter leads/chats
        const query = {
            $or: [
                { userId: userId }
            ]
        };
        if (userEmail) {
            query.$or.push({ userEmail: userEmail });
        }

        const userProjects = await Project.find(query).select('id');
        const projectIds = userProjects.map(p => p.id);

        const [profiles, leads, chats] = await Promise.all([
            Project.countDocuments(query),
            Lead.countDocuments({ projectId: { $in: projectIds } }),
            ChatSession.countDocuments({ projectId: { $in: projectIds } }) // Assuming ChatSession also has projectId
        ]);

        return { profiles, leads, active_chats: chats };
    }
}

module.exports = new ProjectService();
